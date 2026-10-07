// Compatibility entry for older bookmarks; the active player has a fresh URL.
const playerStyles = document.createElement("link");
playerStyles.rel = "stylesheet";
playerStyles.href = "styles/experience.css?v=20261008-steady4";
document.head.appendChild(playerStyles);
const playerScript = document.createElement("script");
playerScript.src = "scripts/experience-player-v4.js?v=20261008-steady4";
document.body.appendChild(playerScript);
