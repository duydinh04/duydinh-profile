require('dotenv').config();
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const TRACKS_FILE = path.join(DATA_DIR, 'tracks.json');
const MUSIC_DIR = path.join(ROOT, 'uploads', 'music');
const COVERS_DIR = path.join(ROOT, 'uploads', 'covers');
for (const dir of [DATA_DIR, MUSIC_DIR, COVERS_DIR]) fs.mkdirSync(dir, { recursive: true });
if (!fs.existsSync(TRACKS_FILE)) fs.writeFileSync(TRACKS_FILE, '[]\n');

if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
  console.warn('CẢNH BÁO: hãy tạo file .env từ .env.example và đặt ADMIN_PASSWORD, SESSION_SECRET trước khi dùng trang quản trị.');
}
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  name: 'duydinh.sid',
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', maxAge: 2 * 60 * 60 * 1000 }
}));
app.use(express.static(ROOT, { index: 'index.html', dotfiles: 'ignore', setHeaders(res, filePath) {
  if (filePath.endsWith('.mp3')) res.setHeader('Cache-Control', 'public, max-age=3600');
}}));
app.use('/uploads', express.static(path.join(ROOT, 'uploads')));

function readTracks() {
  try { const data = JSON.parse(fs.readFileSync(TRACKS_FILE, 'utf8')); return Array.isArray(data) ? data : []; }
  catch (e) { console.error('Không đọc được data/tracks.json:', e.message); return []; }
}
function writeTracks(tracks) { fs.writeFileSync(TRACKS_FILE, JSON.stringify(tracks, null, 2) + '\n'); }
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'Vui lòng đăng nhập quản trị.' });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, file.fieldname === 'audio' ? MUSIC_DIR : COVERS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(5).toString('hex')}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 30 * 1024 * 1024, files: 2 }, fileFilter(req, file, cb) {
  if (file.fieldname === 'audio' && !['.mp3', '.ogg', '.wav', '.m4a', '.aac'].includes(path.extname(file.originalname).toLowerCase())) return cb(new Error('File nhạc hỗ trợ: MP3, OGG, WAV, M4A, AAC.'));
  if (file.fieldname === 'cover' && !['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(file.originalname).toLowerCase())) return cb(new Error('Ảnh bìa phải là JPG, PNG hoặc WEBP.'));
  cb(null, true);
}});

app.get('/api/tracks', (req, res) => res.json(readTracks()));
app.get('/api/admin/status', (req, res) => res.json({ loggedIn: Boolean(req.session && req.session.isAdmin) }));
app.post('/api/admin/login', (req, res) => {
  const supplied = String(req.body.password || '');
  const expected = String(process.env.ADMIN_PASSWORD || '');
  if (!expected || supplied.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) {
    return res.status(401).json({ error: 'Mật khẩu không đúng hoặc chưa được cấu hình trong .env.' });
  }
  req.session.regenerate(err => {
    if (err) return res.status(500).json({ error: 'Không thể tạo phiên đăng nhập.' });
    req.session.isAdmin = true;
    res.json({ ok: true });
  });
});
app.post('/api/admin/logout', requireAdmin, (req, res) => req.session.destroy(() => res.json({ ok: true })));
app.post('/api/admin/tracks', requireAdmin, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 120);
  const artist = String(req.body.artist || '').trim().slice(0, 120);
  if (!name) {
    for (const files of Object.values(req.files || {})) files.forEach(f => fs.unlink(f.path, () => {}));
    return res.status(400).json({ error: 'Vui lòng nhập tên bài hát.' });
  }
  if (!req.files || !req.files.audio || !req.files.audio[0]) return res.status(400).json({ error: 'Vui lòng chọn file nhạc.' });
  const audioFile = req.files.audio[0];
  const coverFile = req.files.cover && req.files.cover[0];
  const track = {
    id: crypto.randomUUID(), name, artist,
    file: `/uploads/music/${audioFile.filename}`,
    cover: coverFile ? `/uploads/covers/${coverFile.filename}` : '/Picture/cd.jpg'
  };
  const tracks = readTracks(); tracks.push(track); writeTracks(tracks);
  res.status(201).json({ ok: true, track });
});
app.delete('/api/admin/tracks/:id', requireAdmin, (req, res) => {
  const tracks = readTracks();
  const track = tracks.find(t => t.id === req.params.id);
  if (!track) return res.status(404).json({ error: 'Không tìm thấy bài hát.' });
  const remaining = tracks.filter(t => t.id !== req.params.id); writeTracks(remaining);
  // Chỉ xóa file đã upload trong uploads, không đụng vào nhạc gốc trong Music/.
  for (const value of [track.file, track.cover]) {
    if (typeof value === 'string' && value.startsWith('/uploads/')) {
      const full = path.resolve(ROOT, value.slice(1));
      if (full.startsWith(path.resolve(ROOT, 'uploads') + path.sep)) fs.unlink(full, () => {});
    }
  }
  res.json({ ok: true });
});
app.get('/admin', (req, res) => res.sendFile(path.join(ROOT, 'admin.html')));
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File quá lớn (tối đa 30 MB).' : 'File tải lên không hợp lệ.' });
  if (err) return res.status(400).json({ error: err.message || 'Đã xảy ra lỗi.' });
  next();
});
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Duy Dinh Profile đang chạy: http://localhost:${port}\nTrang quản trị nhạc: http://localhost:${port}/admin`));
