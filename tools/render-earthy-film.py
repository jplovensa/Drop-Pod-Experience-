"""Render supplied Earthy Luxe views into a film; requires FFmpeg/libx264."""

import concurrent.futures
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILM_DIR = ROOT / "assets/earthy-luxe/film"
CHAPTERS = [
    ("The Destination Collection", 12, "assets/destination-collection.mp4"),
    ("Beachfront Placement", 12, "assets/beachfront.mp4"),
    ("Life on the Veranda", 7, "assets/pod-hero.jpg"),
    ("The Approach", 12, "assets/exterior-pods.mp4"),
    ("Veranda to Entrance", 12, "el:8,10,1"),
    ("The Suite Reveal", 12, "el:2,1,5"),
    ("Inside the Pod", 15, "el:1"),
    ("Facade", 7, "el:10"),
    ("Terrace Lounge", 7, "el:8"),
    ("Alfresco Dining", 7, "el:9"),
    ("The Living Wall", 7, "el:2"),
    ("The Open Suite", 7, "el:1"),
    ("The Kitchen", 7, "el:4"),
    ("Culinary Detail", 7, "el:3"),
    ("Dressing Gallery", 7, "el:7"),
    ("The Sleeping Suite", 7, "el:5"),
    ("Morning Light", 7, "el:6"),
]
ENCODE = ["-an", "-c:v", "libx264", "-threads", "2", "-preset", "fast",
          "-crf", "22", "-pix_fmt", "yuv420p"]


def ffmpeg(args):
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args],
        check=True,
    )


def concatenate(clips, target, listing):
    listing.write_text("".join(f"file '{clip}'\n" for clip in clips))
    ffmpeg(["-f", "concat", "-safe", "0", "-i", str(listing),
            "-c", "copy", "-movflags", "+faststart", str(target)])


def render_still(path, duration, target, earthy=False):
    frames = round(duration * 24)
    # Fixed framing removes integer crop steps from the former zoom animation.
    crop = "crop=iw:trunc(ih*0.748/2)*2:0:ih-oh," if earthy else ""
    filters = (
        f"{crop}scale=1280:720:force_original_aspect_ratio=increase,"
        "crop=1280:720,setsar=1,format=yuv420p"
    )
    ffmpeg(["-threads", "2", "-filter_threads", "1", "-loop", "1",
            "-framerate", "24", "-i", str(path), "-vf", filters,
            "-frames:v", str(frames), *ENCODE, str(target)])


def dissolve_shots(shots, target, duration):
    fade_frames = 12
    shot_frames = (round(duration * 24) + fade_frames * (len(shots) - 1)) // len(shots)
    inputs = []
    for shot in shots:
        inputs.extend(["-i", str(shot)])
    filters = []
    for index in range(len(shots)):
        filters.append(f"[{index}:v]setpts=PTS-STARTPTS,fps=24[v{index}]")
    previous = "v0"
    for index in range(1, len(shots)):
        offset = index * (shot_frames - fade_frames) / 24
        output = f"mix{index}"
        filters.append(f"[{previous}][v{index}]xfade=transition=fade:"
                       f"duration={fade_frames / 24}:offset={offset},fps=24[{output}]")
        previous = output
    ffmpeg(["-threads", "2", "-filter_complex_threads", "1", *inputs,
            "-filter_complex", ";".join(filters), "-map", f"[{previous}]",
            "-t", str(duration), "-r", "24", *ENCODE,
            "-movflags", "+faststart", str(target)])


def render_chapter(item, temporary):
    index, (title, duration, source) = item
    target = temporary / f"chapter-{index:02d}.mp4"
    if source.startswith("el:"):
        views = source[3:].split(",")
        shots = []
        for shot_index, view in enumerate(views):
            shot = temporary / f"shot-{index}-{shot_index}.mp4"
            shot_duration = (round(duration * 24) + 12 * (len(views) - 1)) / len(views) / 24
            render_still(ROOT / f"assets/earthy-luxe/v{view}.webp",
                         shot_duration, shot, earthy=True)
            shots.append(shot)
        dissolve_shots(shots, target, duration)
    elif source.endswith(".mp4"):
        ffmpeg(["-threads", "2", "-filter_threads", "1", "-stream_loop", "-1",
                "-i", str(ROOT / source), "-t", str(duration), "-vf",
                "scale=1280:720:force_original_aspect_ratio=increase,"
                "crop=1280:720,fps=24,setsar=1,format=yuv420p",
                *ENCODE, str(target)])
    else:
        render_still(ROOT / source, duration, target)
    print(f"Rendered {index + 1:02d}: {title}", flush=True)
    return target


def main():
    FILM_DIR.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="fjall-el-film-") as directory:
        temporary = Path(directory)
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            clips = list(pool.map(lambda item: render_chapter(item, temporary),
                                  enumerate(CHAPTERS)))
        film = FILM_DIR / "earthy-luxe-cinematic-v4.mp4"
        concatenate(clips, film, temporary / "chapters.txt")
        for index, name in [(4, "entry"), (5, "suite")]:
            shutil.copyfile(clips[index], FILM_DIR / f"{name}-v4.mp4")

    manifest = []
    start = 0
    for title, duration, source in CHAPTERS:
        manifest.append(dict(title=title, start=start, duration=duration, source=source))
        start += duration
    (FILM_DIR / "chapters.json").write_text(
        json.dumps(dict(duration=start, chapters=manifest), indent=2) + "\n"
    )
    print(f"Film complete: {start}s, {film.stat().st_size} bytes", flush=True)


if __name__ == "__main__":
    main()
