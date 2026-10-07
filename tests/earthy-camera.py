"""Check decoded Earthy Luxe footage for unintended movement between shots."""
import json
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
DIRECTORY = ROOT / "assets/earthy-luxe/film"
FILM = DIRECTORY / "earthy-luxe-cinematic-v4.mp4"
CHAPTERS = json.loads((DIRECTORY / "chapters.json").read_text())["chapters"]

for chapter in CHAPTERS:
    if chapter["source"].endswith(".mp4"):
        continue
    # Sample a held shot, clear of its entry, exit and dissolves.
    result = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", str(chapter["start"] + 0.75),
         "-i", str(FILM), "-t", "1.5", "-vf", "scale=640:360,fps=8",
         "-pix_fmt", "gray", "-f", "rawvideo", "-"],
        check=True, capture_output=True,
    )
    frames = np.frombuffer(result.stdout, dtype=np.uint8).reshape(-1, 360, 640)
    assert len(frames) >= 10, f"Missing decoded frames: {chapter['title']}"
    differences = np.abs(np.diff(frames.astype(np.float32), axis=0))
    maximum = differences.mean(axis=(1, 2)).max()
    # Small codec rounding changes are acceptable; camera movement is not.
    assert maximum < 0.2, f"Camera moved in {chapter['title']}: {maximum:.3f}"
    print(f"PASS steady shot: {chapter['title']} (frame change {maximum:.4f})")
