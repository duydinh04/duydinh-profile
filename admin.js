(() => {
  const loginCard = document.getElementById('loginCard');
  const adminArea = document.getElementById('adminArea');
  const globalMessage = document.getElementById('globalMessage');
  const formMessage = document.getElementById('formMessage');
  const trackList = document.getElementById('trackList');
  const loginForm = document.getElementById('loginForm');
  const trackForm = document.getElementById('trackForm');
  const addBtn = document.getElementById('addBtn');
  function message(el, text, error = false) { el.textContent = text; el.classList.toggle('error', error); }
  async function request(url, options = {}) {
    const response = await fetch(url, { credentials: 'same-origin', ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Yêu cầu không thành công.');
    return data;
  }
  function showLoggedIn(value) { loginCard.hidden = value; adminArea.hidden = !value; }
  async function checkSession() {
    try { const status = await request('/api/admin/status'); showLoggedIn(status.loggedIn); if (status.loggedIn) await loadTracks(); }
    catch (e) { message(globalMessage, e.message, true); }
  }
  loginForm.addEventListener('submit', async e => {
    e.preventDefault(); message(globalMessage, '');
    try {
      await request('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: document.getElementById('password').value }) });
      loginForm.reset(); showLoggedIn(true); await loadTracks(); message(globalMessage, 'Đăng nhập thành công.');
    } catch (err) { message(globalMessage, err.message, true); }
  });
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try { await request('/api/admin/logout', { method: 'POST' }); showLoggedIn(false); message(globalMessage, 'Đã đăng xuất.'); }
    catch (e) { message(globalMessage, e.message, true); }
  });
  trackForm.addEventListener('submit', async e => {
    e.preventDefault(); addBtn.disabled = true; message(formMessage, 'Đang tải lên...');
    try {
      const data = await request('/api/admin/tracks', { method: 'POST', body: new FormData(trackForm) });
      trackForm.reset(); message(formMessage, `Đã thêm “${data.track.name}”. Danh sách phát đã được cập nhật.`); await loadTracks();
    } catch (err) { message(formMessage, err.message, true); }
    finally { addBtn.disabled = false; }
  });
  async function loadTracks() {
    const tracks = await request('/api/tracks'); trackList.replaceChildren();
    if (!tracks.length) { trackList.textContent = 'Chưa có bài hát nào.'; return; }
    tracks.forEach(track => {
      const row = document.createElement('div'); row.className = 'track-row';
      const meta = document.createElement('div'); meta.className = 'track-meta';
      const title = document.createElement('strong'); title.textContent = track.name;
      const artist = document.createElement('small'); artist.textContent = `${track.artist || 'Chưa ghi nghệ sĩ'} · ${track.file}`;
      meta.append(title, artist); row.appendChild(meta);
      const del = document.createElement('button'); del.type = 'button'; del.className = 'delete'; del.textContent = 'Xóa';
      del.addEventListener('click', async () => {
        if (!confirm(`Bạn chắc chắn muốn xóa bài “${track.name}” khỏi danh sách?`)) return;
        del.disabled = true;
        try { await request(`/api/admin/tracks/${encodeURIComponent(track.id)}`, { method: 'DELETE' }); await loadTracks(); message(globalMessage, `Đã xóa “${track.name}”.`); }
        catch (e) { message(globalMessage, e.message, true); del.disabled = false; }
      });
      row.appendChild(del); trackList.appendChild(row);
    });
  }
  checkSession();
})();
