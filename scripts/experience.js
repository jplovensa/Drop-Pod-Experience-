// Compatibility entry for older bookmarks; the active player has a fresh URL.
const playerStyles = document.createElement("link");
playerStyles.rel = "stylesheet";
playerStyles.href = "styles/experience.css?v=20261007-film3";
document.head.appendChild(playerStyles);
const playerScript = document.createElement("script");
playerScript.src = "scripts/experience-player-v3.js";
document.body.appendChild(playerScript);
