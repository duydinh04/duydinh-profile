window.addEventListener('DOMContentLoaded', () => {
  audio.play().then(() => {
    audio.muted = false; // 🔊 Bật tiếng sau khi play thành công
    disc.style.animationPlayState = 'running';
    playPauseBtn.innerHTML = '<i class="ri-pause-line"></i>';
    isPlaying = true;
  }).catch(err => {
    console.warn("Autoplay bị chặn bởi trình duyệt:", err);
  });
});
const audio = document.getElementById('audio');
const disc = document.getElementById('disc');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let isPlaying = false;

playPauseBtn.addEventListener('click', () => {
  if (!isPlaying) {
    audio.play();
    disc.style.animationPlayState = 'running';
    playPauseBtn.innerHTML = '<i class="ri-pause-line"></i>';
  } else {
    audio.pause();
    disc.style.animationPlayState = 'paused';
    playPauseBtn.innerHTML = '<i class="ri-play-line"></i>';
  }
  isPlaying = !isPlaying;
});

prevBtn.addEventListener('click', () => {
  audio.currentTime = 0; // hoặc chuyển bài sau nếu có playlist
});

nextBtn.addEventListener('click', () => {
  audio.currentTime = audio.duration - 1; // tua tới gần cuối
});

function createFloatingImage() {
  const img = document.createElement('img');
  img.src = 'Picture/heart.jpg';
  img.classList.add('floating-image');
  img.style.left = Math.random() * window.innerWidth + 'px';
  const duration = 5 + Math.random() * 5;
  img.style.animationDuration = duration + 's';
  document.body.appendChild(img);
  setTimeout(() => img.remove(), duration * 1000);
}
setInterval(createFloatingImage, 500);

// ❌ Chặn chuột phải
document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
});

// ❌ Chặn phím F12, Ctrl+Shift+I, Ctrl+U
document.addEventListener('keydown', function (e) {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
    (e.ctrlKey && e.key === 'U')
  ) {
    e.preventDefault();
  }
});

document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('startOverlay').style.display = 'none';
  audio.play();
  disc.style.animationPlayState = 'running';
  playPauseBtn.innerHTML = '<i class="ri-pause-line"></i>';
  isPlaying = true;
});
