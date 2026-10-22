(() => {
  const audio = document.getElementById('audio');
  const disc = document.getElementById('disc');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const trackTitle = document.getElementById('trackTitle');
  const progress = document.getElementById('progress');
  const currentTimeEl = document.getElementById('currentTime');
  const durationEl = document.getElementById('duration');
  const playlistEl = document.getElementById('playlist');
  const tracks = [];
  let currentTrackIndex = 0;
  let isShuffle = false;
  let isPlaying = false;

  const icon = (name) => `<i class="ri-${name}"></i>`;
  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  }
  function updatePlayButton() {
    playPauseBtn.innerHTML = isPlaying ? icon('pause-line') : icon('play-line');
    playPauseBtn.setAttribute('aria-label', isPlaying ? 'Tạm dừng' : 'Phát nhạc');
    disc.style.animationPlayState = isPlaying ? 'running' : 'paused';
  }
  function renderPlaylist() {
    if (!playlistEl) return;
    playlistEl.replaceChildren();
    tracks.forEach((track, i) => {
      const item = document.createElement('button');
      item.type = 'button'; item.className = `playlist-item${i === currentTrackIndex ? ' active' : ''}`;
      const name = document.createElement('span'); name.className = 'playlist-name'; name.textContent = track.name;
      const artist = document.createElement('small'); artist.textContent = track.artist || 'Duy Đinh';
      item.append(name, artist);
      item.addEventListener('click', () => loadTrack(i, true));
      playlistEl.appendChild(item);
    });
  }
  function setTrackDisplay(track) {
    if (trackTitle) trackTitle.textContent = track ? `🎵 ${track.name}` : 'Chưa có bài hát';
    document.title = track ? `🎵 ${track.name} - Duy Đinh` : 'Duy Đinh';
    if (track && track.cover) disc.style.backgroundImage = `url("${track.cover.replace(/"/g, '')}")`;
    renderPlaylist();
  }
  async function loadTrack(index, autoplay = true) {
    if (!tracks.length) { setTrackDisplay(null); return; }
    currentTrackIndex = (index + tracks.length) % tracks.length;
    const track = tracks[currentTrackIndex];
    audio.src = track.file;
    audio.load();
    setTrackDisplay(track);
    progress.value = 0; currentTimeEl.textContent = '0:00'; durationEl.textContent = '0:00';
    if (autoplay) {
      try { await audio.play(); isPlaying = true; }
      catch (err) { isPlaying = false; console.info('Trình duyệt yêu cầu người dùng bấm phát nhạc.', err.message); }
      updatePlayButton();
    } else { isPlaying = false; updatePlayButton(); }
  }
  function nextTrack() {
    if (!tracks.length) return;
    if (isShuffle && tracks.length > 1) {
      let next = currentTrackIndex;
      while (next === currentTrackIndex) next = Math.floor(Math.random() * tracks.length);
      loadTrack(next, true);
    } else loadTrack((currentTrackIndex + 1) % tracks.length, true);
  }
  async function refreshTracks() {
    try {
      const response = await fetch('/api/tracks', { cache: 'no-store' });
      if (!response.ok) throw new Error('Không tải được danh sách nhạc.');
      const list = await response.json();
      tracks.splice(0, tracks.length, ...list.filter(t => t && t.name && t.file));
      if (!tracks.length) { setTrackDisplay(null); return; }
      await loadTrack(Math.min(currentTrackIndex, tracks.length - 1), false);
    } catch (error) {
      if (trackTitle) trackTitle.textContent = 'Không tải được danh sách nhạc';
      console.error(error);
    }
  }

  playPauseBtn.addEventListener('click', async () => {
    if (!tracks.length) return;
    if (audio.paused) {
      try { await audio.play(); } catch (e) { console.warn(e); }
    } else audio.pause();
  });
  prevBtn.addEventListener('click', () => loadTrack((currentTrackIndex - 1 + tracks.length) % tracks.length, true));
  nextBtn.addEventListener('click', nextTrack);
  if (shuffleBtn) shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle; shuffleBtn.classList.toggle('enabled', isShuffle);
    shuffleBtn.setAttribute('aria-pressed', String(isShuffle));
    shuffleBtn.title = isShuffle ? 'Tắt phát ngẫu nhiên' : 'Bật phát ngẫu nhiên';
  });
  audio.addEventListener('play', () => { isPlaying = true; updatePlayButton(); });
  audio.addEventListener('pause', () => { isPlaying = false; updatePlayButton(); });
  audio.addEventListener('ended', nextTrack);
  audio.addEventListener('loadedmetadata', () => { durationEl.textContent = formatTime(audio.duration); });
  audio.addEventListener('timeupdate', () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) progress.value = (audio.currentTime / audio.duration) * 100;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });
  progress.addEventListener('input', () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  });
  document.getElementById('startBtn').addEventListener('click', async () => {
    document.getElementById('startOverlay').style.display = 'none';
    if (!tracks.length) await refreshTracks();
    if (tracks.length && audio.paused) {
      try { await audio.play(); } catch (e) { isPlaying = false; updatePlayButton(); }
    }
  });
  refreshTracks();

  // Ảnh trái tim rơi trang trí.
  function createFloatingImage() {
    const img = document.createElement('img'); img.src = 'Picture/heart.jpg'; img.alt = '';
    img.className = 'floating-image'; img.style.left = Math.random() * window.innerWidth + 'px';
    const duration = 5 + Math.random() * 5; img.style.animationDuration = duration + 's';
    document.body.appendChild(img); setTimeout(() => img.remove(), duration * 1000);
  }
  setInterval(createFloatingImage, 500);
  // Chặn chuột phải và một số phím tắt (không phải biện pháp bảo mật thực sự).
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J'].includes(e.key.toUpperCase())) || (e.ctrlKey && e.key.toUpperCase() === 'U')) e.preventDefault();
  });
})();
