const audio = document.getElementById('audio');
const disc = document.getElementById('disc');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const trackTitle = document.getElementById('trackTitle'); // nhớ có trong HTML!

let isPlaying = false;

const tracks = [
  { name: "Ngôi sao lẻ loi Remix", file: "Music/Music1.mp3" },
  { name: "Chỉ là anh không biết Remix", file: "Music/Music2.mp3" },
  { name: "Địa ngục trần gian Remix", file: "Music/Music3.mp3" },
  { name: "Chợt nhận ra Remix", file: "Music/Music4.mp3" }
];


let currentTrackIndex = 0;

// Hàm load nhạc và play
function loadTrack(index) {
  if (index >= 0 && index < tracks.length) {
    audio.src = tracks[index];
    audio.play().then(() => {
      isPlaying = true;
      disc.style.animationPlayState = 'running';
      playPauseBtn.innerHTML = '<i class="ri-pause-line"></i>';
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadTrack(currentTrackIndex);
});

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
  currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
  loadTrack(currentTrackIndex);
});

nextBtn.addEventListener('click', () => {
  currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
  loadTrack(currentTrackIndex);
});

document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('startOverlay').style.display = 'none';
  loadTrack(currentTrackIndex);
});

// Ảnh nổi 💖
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

// Chặn chuột phải
document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
});

// Chặn F12, Ctrl+Shift+I/J, Ctrl+U
document.addEventListener('keydown', function (e) {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
    (e.ctrlKey && e.key === 'U')
  ) {
    e.preventDefault();
  }
});
document.title = "🎵 Đang phát: " + tracks[index].split("/").pop();
function loadTrack(index) {
  if (index >= 0 && index < tracks.length) {
    audio.src = tracks[index].file;
    audio.play().then(() => {
      isPlaying = true;
      disc.style.animationPlayState = 'running';
      playPauseBtn.innerHTML = '<i class="ri-pause-line"></i>';

      const trackName = tracks[index].name;
      document.title = "🎵 " + trackName + " - Duy Đinh";

      const titleElement = document.getElementById("trackTitle");
      if (titleElement) {
        titleElement.textContent = "🎵 Đang phát: " + trackName;
      }
    });
  }
}


