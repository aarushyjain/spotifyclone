Spotify Clone — Step-by-step files and instructions

Files included:
- index.html       (main HTML)
- style.css        (styles)
- script.js        (player logic)
- images/placeholder.png  (placeholder cover art)
- audio/           (empty folder — put your .mp3 files here)
- README.md

Step-by-step to run:
1. Extract the zip and open the folder in VS Code.
2. Place your audio files into the `audio/` folder. Filenames are case-sensitive.
3. (Optional) Place cover images into `images/` folder and update `script.js` songs array if names differ.
4. Open `index.html` using Live Server (recommended) or a static server.
5. If a song doesn't play, open browser DevTools (F12) -> Console to see errors. Ensure paths in `script.js` match actual file locations.

Editing playlist:
- Open `script.js` and edit the `songs` array. Each entry needs `title`, `artist`, `image`, `url`.

Troubleshooting:
- If images don't show, check `images/placeholder.png` exists.
- If audio fails, confirm the audio files are supported by the browser (mp3 is safest) and the path is correct.

Enjoy!
