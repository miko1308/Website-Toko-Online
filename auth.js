// ─── AUTH SYSTEM — Fhoenix12 Aquarius ───
// Sesi Admin  : sessionStorage (hanya 1 tab, tidak lintas tab)
// Sesi Customer: localStorage (persist, tapi diblokir jika admin aktif di tab ini)

const ADMIN_PASS  = 'fhoenix12admin';
const ADMIN_KEY   = 'fx_admin_v1';   // sessionStorage — per tab
const USER_KEY    = 'fx_user';       // localStorage   — persist

// ══════════════════════════════════════
//  ADMIN
// ══════════════════════════════════════

function isAdmin() {
  // Admin HANYA jika sessionStorage tab ini punya flag admin
  return sessionStorage.getItem(ADMIN_KEY) === 'true';
}

function adminLogin(pass) {
  if (pass === ADMIN_PASS) {
    // Set admin di sessionStorage (hanya tab ini)
    sessionStorage.setItem(ADMIN_KEY, 'true');
    // Keluarkan customer session di tab ini (biar tidak tumpang tindih)
    localStorage.removeItem(USER_KEY);
    return true;
  }
  return false;
}

function adminLogout() {
  sessionStorage.removeItem(ADMIN_KEY);
  location.reload();
}

function requireAdmin() {
  // Harus admin DAN tidak boleh ada customer session aktif di tab ini
  if (!isAdmin()) {
    window.location.href = 'login.html';
  }
}

// ══════════════════════════════════════
//  CUSTOMER
// ══════════════════════════════════════

function getUsers() {
  try { return JSON.parse(localStorage.getItem('fx_users') || '{}'); }
  catch(e) { return {}; }
}

function saveUsers(u) {
  localStorage.setItem('fx_users', JSON.stringify(u));
}

function getCurrentUser() {
  // Customer tidak valid jika tab ini sedang mode admin
  if (isAdmin()) return null;
  try {
    const d = localStorage.getItem(USER_KEY);
    return d ? JSON.parse(d) : null;
  } catch(e) { return null; }
}

function isLoggedIn() {
  // Tidak dianggap login customer jika tab ini adalah tab admin
  if (isAdmin()) return false;
  return getCurrentUser() !== null;
}

function registerUser(name, email, phone, pass, referral) {
  // Blokir jika tab ini adalah admin
  if (isAdmin()) return { ok: false, msg: 'Sedang dalam mode admin.' };

  const users = getUsers();
  if (users[email]) return { ok: false, msg: 'Email sudah terdaftar.' };

  const user = {
    name, email, phone, pass,
    referral: referral || null,
    joinDate: new Date().toISOString(),
    orders: []
  };
  users[email] = user;
  saveUsers(users);

  const { pass: _, ...safe } = user;
  localStorage.setItem(USER_KEY, JSON.stringify({ ...safe, email }));
  return { ok: true };
}

function loginUser(email, pass) {
  // Blokir jika tab ini adalah admin
  if (isAdmin()) return { ok: false, msg: 'Sedang dalam mode admin.' };

  const users = getUsers();
  const user  = users[email];
  if (!user) return { ok: false, msg: 'Email tidak ditemukan.' };
  if (user.pass !== pass) return { ok: false, msg: 'Password salah.' };

  const { pass: _, ...safe } = user;
  localStorage.setItem(USER_KEY, JSON.stringify({ ...safe, email }));
  return { ok: true };
}

function logoutUser() {
  localStorage.removeItem(USER_KEY);
  window.location.href = 'login-pelanggan.html';
}

function requireLogin() {
  // Jika tab ini admin → tolak akses halaman customer
  if (isAdmin()) {
    window.location.href = 'admin.html';
    return;
  }
  if (!isLoggedIn()) {
    sessionStorage.setItem('after_login', location.pathname + location.search);
    window.location.href = 'login-pelanggan.html';
  }
}

// ══════════════════════════════════════
//  ORDER HELPERS
// ══════════════════════════════════════

function saveOrderToAccount(orderData) {
  const user = getCurrentUser();
  if (!user) return;
  const users = getUsers();
  if (!users[user.email]) return;
  if (!users[user.email].orders) users[user.email].orders = [];

  // Gunakan id yang SAMA dengan fx_orders (jangan generate ulang)
  users[user.email].orders.unshift({
    ...orderData,
    date: orderData.date || new Date().toISOString(),
    status: 'Menunggu'
  });
  saveUsers(users);

  // Update session
  const { pass: _, ...safe } = users[user.email];
  localStorage.setItem(USER_KEY, JSON.stringify({ ...safe, email: user.email }));
}

function saveOrderGlobal(orderData) {
  try {
    const orders = JSON.parse(localStorage.getItem('fx_orders') || '[]');
    orders.unshift({
      ...orderData,
      date: new Date().toISOString(),
      status: 'Menunggu'
    });
    localStorage.setItem('fx_orders', JSON.stringify(orders));
  } catch(e) {}
}

function getOrdersGlobal() {
  try { return JSON.parse(localStorage.getItem('fx_orders') || '[]'); }
  catch(e) { return []; }
}