/* Fixed and improved script.js
   Key changes:
   - Uses the <audio id="audio"> element in the page (helps with debugging and browser policies)
   - Better error handling when files are missing
   - Accessible keyboard interactions
   - Clear instructions at top for where to put your files
*/

// Add/modify entries here to match your local files (case-sensitive)
const songs = [
  { title: 'Shape of You', artist: 'Ed Sheeran', image: 'images/shape_of_you.jpg', url: 'audio/shape_of_you.mp3' },
  { title: 'Blinding Lights', artist: 'The Weeknd', image: 'images/blinding_lights.jpg', url: 'audio/blinding_lights.mp3' },
  { title: 'Levitating', artist: 'Dua Lipa', image: 'images/levitating.jpg', url: 'audio/levitating.mp3' }
];

let currentSongIndex = 0;
const audio = document.getElementById('audio') || new Audio();

// small helpers
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function ensurePlayerUI() {
  const player = document.querySelector('.audio-player');
  if (!player) return;
  if (!$('#progress-container')) {
    const prog = document.createElement('div');
    prog.id = 'progress-container';
    prog.innerHTML = `
      <div id="progress">
        <div id="progress-filled"></div>
      </div>
      <div id="time-row">
        <span id="current-time">0:00</span>
        <span id="duration">0:00</span>
      </div>
    `;
    const controls = player.querySelector('.controls');
    if (controls) player.insertBefore(prog, controls);
    else player.appendChild(prog);
  }
}

function formatTime(seconds = 0) {
  seconds = Math.floor(isFinite(seconds) ? seconds : 0);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function setPlayButtonTo(state) {
  const btn = $('#play');
  if (!btn) return;
  if (state === 'play') btn.textContent = 'Play';
  else if (state === 'pause') btn.textContent = 'Pause';
  else btn.textContent = state;
}

function displayPlaylist() {
  const container = $('#playlist');
  if (!container) return;
  container.innerHTML = '';
  songs.forEach((s, idx) => {
    const el = document.createElement('div');
    el.className = 'song-item';
    el.tabIndex = 0; // keyboard focusable
    el.innerHTML = `
      <img src="${s.image || 'images/placeholder.png'}" alt="${s.title}" onerror="this.src='images/placeholder.png'">
      <div class="meta">
        <div class="song-title">${s.title}</div>
        <div class="song-artist">${s.artist}</div>
      </div>
    `;
    el.addEventListener('click', () => { currentSongIndex = idx; loadSong(idx, true); });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); currentSongIndex = idx; loadSong(idx, true); }
    });
    container.appendChild(el);
  });
}

function loadSong(index, autoPlay = false) {
  const song = songs[index];
  if (!song) return;
  $('#song-title').textContent = song.title;
  $('#song-artist').textContent = song.artist;
  $('#song-img').src = song.image || 'images/placeholder.png';

  // update audio src and try to load metadata
  audio.src = song.url || '';
  audio.load();

  // reset UI
  const filled = $('#progress-filled');
  if (filled) filled.style.width = '0%';
  $('#current-time').textContent = '0:00';
  $('#duration').textContent = '0:00';
  setPlayButtonTo('play');

  if (autoPlay) {
    audio.play().then(() => setPlayButtonTo('pause')).catch((err) => {
      console.warn('Autoplay prevented or play() failed:', err);
      setPlayButtonTo('play');
    });
  }
}

function togglePlayPause() {
  if (!audio.src) { console.warn('No audio source loaded.'); return; }
  if (audio.paused) {
    audio.play().then(() => setPlayButtonTo('pause')).catch((err) => console.warn('play() failed:', err));
  } else { audio.pause(); setPlayButtonTo('play'); }
}

function nextSong() { currentSongIndex = (currentSongIndex + 1) % songs.length; loadSong(currentSongIndex, true); }
function prevSong() { currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length; loadSong(currentSongIndex, true); }

function updateProgressUI() {
  const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  const filled = $('#progress-filled');
  if (filled) filled.style.width = `${percent}%`;
  $('#current-time').textContent = formatTime(audio.currentTime);
  $('#duration').textContent = isFinite(audio.duration) ? formatTime(audio.duration) : '0:00';
}

function seekFromClick(e) {
  const rect = $('#progress').getBoundingClientRect();
  const clickX = (e.clientX ?? (e.touches && e.touches[0].clientX)) - rect.left;
  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
  if (isFinite(audio.duration) && audio.duration > 0) { audio.currentTime = ratio * audio.duration; updateProgressUI(); }
}

function attachListeners() {
  const playBtn = $('#play'); const nextBtn = $('#next'); const prevBtn = $('#prev');
  if (playBtn) playBtn.addEventListener('click', togglePlayPause);
  if (nextBtn) nextBtn.addEventListener('click', nextSong);
  if (prevBtn) prevBtn.addEventListener('click', prevSong);

  audio.addEventListener('loadedmetadata', () => { $('#duration').textContent = isFinite(audio.duration) ? formatTime(audio.duration) : '0:00'; updateProgressUI(); });
  audio.addEventListener('timeupdate', updateProgressUI);
  audio.addEventListener('ended', () => nextSong());
  audio.addEventListener('error', (e) => {
    console.error('Audio error', e); setPlayButtonTo('Play');
    // skip to next after a brief pause
    setTimeout(() => nextSong(), 800);
  });

  const progressEl = $('#progress');
  if (progressEl) {
    progressEl.addEventListener('click', seekFromClick);
    progressEl.addEventListener('touchstart', (ev) => seekFromClick(ev.touches[0]));
  }

  window.addEventListener('keydown', (ev) => {
    const activeTag = (document.activeElement && document.activeElement.tagName) || '';
    if (['INPUT','TEXTAREA'].includes(activeTag)) return;
    if (ev.code === 'Space') { ev.preventDefault(); togglePlayPause(); }
    else if (ev.code === 'ArrowRight') { ev.preventDefault(); nextSong(); }
    else if (ev.code === 'ArrowLeft') { ev.preventDefault(); prevSong(); }
  });
}

// init
document.addEventListener('DOMContentLoaded', () => {
  ensurePlayerUI();
  displayPlaylist();
  attachListeners();
  if (songs.length > 0) loadSong(currentSongIndex, false);
  console.info('Player initialized — songs:', songs.length);
});

// expose for debugging
window._player = { audio, loadSong, nextSong, prevSong, togglePlayPause, songs };
