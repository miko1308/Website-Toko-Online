// ─── SHARED STORE STATE ───
let isStoreClosed = localStorage.getItem('storeClosed') === 'true';
let isInstallment = localStorage.getItem('installment') === 'true';
let autoWA        = localStorage.getItem('autoWA') !== 'false';

function applyStoreState() {
  const banner = document.getElementById('closed-banner');
  const pill   = document.getElementById('store-pill');
  if (banner) banner.style.display = isStoreClosed ? 'block' : 'none';
  if (pill) {
    if (isStoreClosed) { pill.className='store-pill closed'; pill.innerHTML='<div class="dot"></div> Tutup'; }
    else               { pill.className='store-pill';        pill.innerHTML='<div class="dot"></div> Buka'; }
  }
  const tStore=document.getElementById('t-store'), tInst=document.getElementById('t-inst'), tWA=document.getElementById('t-wa');
  if (tStore) tStore.checked = !isStoreClosed;
  if (tInst)  tInst.checked  = isInstallment;
  if (tWA)    tWA.checked    = autoWA;
}

function toggleStore(checked)       { isStoreClosed = !checked; localStorage.setItem('storeClosed', isStoreClosed); applyStoreState(); }
function toggleInstallment(checked) { isInstallment = checked;  localStorage.setItem('installment', isInstallment); }
function toggleAutoWA(checked)      { autoWA = checked;         localStorage.setItem('autoWA', autoWA); }

// ─── ADMIN BAR (semua halaman, jika admin login) ───
function injectAdminBar() {
  if (!isAdmin()) return;
  if (document.getElementById('admin-top-bar')) return;
  const style = document.createElement('style');
  style.textContent = `
    .admin-top-bar {
      position:fixed; top:0; left:0; right:0; z-index:9999;
      background:rgba(10,8,28,0.96); backdrop-filter:blur(14px);
      border-bottom:1px solid rgba(159,122,234,0.22);
      display:flex; align-items:center; justify-content:space-between;
      padding:0 1.25rem; height:34px; gap:1rem;
      font-family:'DM Sans',sans-serif;
      box-shadow: 0 2px 20px rgba(0,0,0,0.5);
      animation: slideDown 0.25s ease;
    }
    @keyframes slideDown { from{transform:translateY(-100%)} to{transform:translateY(0)} }
    .atb-left { display:flex; align-items:center; gap:0.55rem; font-size:0.72rem; color:rgba(159,122,234,0.75); }
    .atb-dot { width:6px; height:6px; border-radius:50%; background:#34d399; box-shadow:0 0 6px rgba(52,211,153,0.6); animation:blink 2s infinite; }
    .atb-left strong { color:#a78bfa; }
    .atb-right { display:flex; align-items:center; gap:0.45rem; }
    .atb-link { font-size:0.7rem; font-weight:600; color:#a78bfa; text-decoration:none; padding:0.18rem 0.65rem; border:1px solid rgba(159,122,234,0.28); border-radius:5px; transition:all 0.15s; white-space:nowrap; }
    .atb-link:hover { background:rgba(159,122,234,0.14); }
    .atb-out { font-size:0.7rem; font-weight:700; color:#f87171; background:rgba(248,113,113,0.1); border:1px solid rgba(248,113,113,0.25); border-radius:5px; padding:0.18rem 0.65rem; cursor:pointer; transition:all 0.15s; font-family:'DM Sans',sans-serif; white-space:nowrap; }
    .atb-out:hover { background:rgba(248,113,113,0.22); }
    body.has-admin-bar nav { top:34px; }
    body.has-admin-bar .page-wrap { padding-top: calc(62px + 34px + 2.5rem); }
    body.has-admin-bar #closed-banner { top:calc(62px + 34px); }
  `;
  document.head.appendChild(style);
  const bar = document.createElement('div');
  bar.id = 'admin-top-bar'; bar.className = 'admin-top-bar';
  const cur = location.pathname.split('/').pop() || 'index.html';
  bar.innerHTML = `
    <div class="atb-left"><div class="atb-dot"></div><span>Mode <strong>Admin</strong></span></div>
    <div class="atb-right">
      <a href="admin.html" class="atb-link${cur==='admin.html'?' style="background:rgba(159,122,234,0.14)"':''}">⚙️ Panel Admin</a>
      <button class="atb-out" onclick="doAdminLogout()">🚪 Logout</button>
    </div>`;
  document.body.prepend(bar);
  document.body.classList.add('has-admin-bar');
}

function doAdminLogout() {
  if (confirm('Yakin mau logout dari mode admin?')) {
    localStorage.removeItem('fx_admin_v1'); location.reload();
  }
}

// modal helpers
function openOverlay(id)  { document.getElementById(id).classList.add('open'); }
function closeOverlay(id) { document.getElementById(id).classList.remove('open'); }
document.addEventListener('click', e => { if (e.target.classList.contains('overlay')) e.target.classList.remove('open'); });

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent; btn.textContent = '✓';
    setTimeout(()=>btn.textContent=orig, 1500);
  });
}
function rp(n) { if(!n||n===0)return'Hubungi WA'; return'Rp'+n.toLocaleString('id-ID'); }

window.addEventListener('DOMContentLoaded', () => {
  applyStoreState();
  injectAdminBar();
});
