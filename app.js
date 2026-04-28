/* ===== PLACEHOLDER IMAGE ===== */
function carImgPlaceholder(make, model) {
  const label = ((make || 'Car') + (model ? ' ' + model : '')).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">`
    + `<rect width="800" height="500" fill="#1a2550"/>`
    + `<rect width="800" height="2" y="499" fill="#2563eb" opacity="0.6"/>`
    + `<path d="M160 300 Q205 255 285 250 L325 205 Q362 182 400 182 Q438 182 475 205 L515 250 Q595 255 640 300 L652 332 Q642 350 618 350 L582 350 Q576 372 555 372 Q534 372 528 350 L272 350 Q266 372 245 372 Q224 372 218 350 L182 350 Q158 350 148 332 Z" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.18"/>`
    + `<circle cx="245" cy="354" r="24" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.18"/>`
    + `<circle cx="555" cy="354" r="24" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.18"/>`
    + `<circle cx="245" cy="354" r="10" fill="#ffffff" opacity="0.08"/>`
    + `<circle cx="555" cy="354" r="10" fill="#ffffff" opacity="0.08"/>`
    + `<text x="400" y="418" font-family="system-ui,Arial,sans-serif" font-size="27" fill="#ffffff" fill-opacity="0.92" text-anchor="middle" font-weight="700" letter-spacing="0.5">${label}</text>`
    + `<text x="400" y="446" font-family="system-ui,Arial,sans-serif" font-size="13" fill="#ffffff" fill-opacity="0.38" text-anchor="middle" letter-spacing="1">NO IMAGE PROVIDED</text>`
    + `</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* ===== ACCOUNT SYSTEM ===== */
const getAccounts    = () => JSON.parse(localStorage.getItem('ad_accounts') || '[]');
const saveAccounts   = (a) => localStorage.setItem('ad_accounts', JSON.stringify(a));
const getCurrentUser = () => JSON.parse(localStorage.getItem('ad_user') || 'null');
const getUserListings= () => JSON.parse(localStorage.getItem('ad_listings') || '[]');
const saveUserListings=(l) => localStorage.setItem('ad_listings', JSON.stringify(l));

function updateAuthUI() {
  const user = getCurrentUser();
  const signInBtn   = document.getElementById('signInBtn');
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userInitial = document.getElementById('userInitial');
  const sellBtn     = document.getElementById('sellBtn');
  const accountLink = document.getElementById('accountNavLink');
  if (user) {
    if (signInBtn)   signInBtn.style.display   = 'none';
    if (userMenuBtn) userMenuBtn.style.display  = 'flex';
    if (userInitial) userInitial.textContent    = user.name[0].toUpperCase();
    if (sellBtn)     sellBtn.style.display      = 'flex';
    if (accountLink) accountLink.style.display  = 'inline';
  } else {
    if (signInBtn)   signInBtn.style.display    = 'flex';
    if (userMenuBtn) userMenuBtn.style.display  = 'none';
    if (sellBtn)     sellBtn.style.display      = 'none';
    if (accountLink) accountLink.style.display  = 'none';
  }
}

function toggleUserMenu() {
  document.getElementById('userDropdown').classList.toggle('open');
}
document.addEventListener('click', e => {
  const menu = document.getElementById('userMenuBtn');
  if (menu && !menu.contains(e.target))
    document.getElementById('userDropdown')?.classList.remove('open');
});

function register() {
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regConfirm').value;
  if (!name || !email || !password)       { toast('Please fill in all fields', 'error', '⚠️'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('Enter a valid email address', 'error', '⚠️'); return; }
  if (password.length < 6)               { toast('Password must be at least 6 characters', 'error', '⚠️'); return; }
  if (password !== confirm)              { toast('Passwords do not match', 'error', '⚠️'); return; }
  const accounts = getAccounts();
  if (accounts.find(a => a.email === email)) { toast('An account with that email already exists', 'error', '⚠️'); return; }
  const user = { id: Date.now(), name, email, password, createdAt: new Date().toISOString() };
  accounts.push(user);
  saveAccounts(accounts);
  localStorage.setItem('ad_user', JSON.stringify({ id: user.id, name, email }));
  closeModal('registerModal');
  updateAuthUI();
  navigate('account');
  toast(`Welcome to AutoDrive, ${name}! 🎉`, 'success', '🚗');
}

function login() {
  const email    = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) { toast('Please enter your email and password', 'error', '⚠️'); return; }
  const user = getAccounts().find(a => a.email === email && a.password === password);
  if (!user) { toast('Incorrect email or password', 'error', '⚠️'); return; }
  localStorage.setItem('ad_user', JSON.stringify({ id: user.id, name: user.name, email: user.email }));
  closeModal('loginModal');
  updateAuthUI();
  toast(`Welcome back, ${user.name}! 👋`, 'success', '👋');
}

function logout() {
  localStorage.removeItem('ad_user');
  document.getElementById('userDropdown')?.classList.remove('open');
  updateAuthUI();
  navigate('home');
  toast('You\'ve been signed out', 'info', '👋');
}

/* ===== EDIT LISTING / MARK AS SOLD ===== */
function openEditModal(id) {
  const car = getUserListings().find(l => l.id === id);
  if (!car) return;
  const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val || ''; };
  set('sellMake', car.make); set('sellModel', car.model); set('sellYear', car.year);
  set('sellPrice', car.price); set('sellMileage', car.mileage); set('sellColor', car.color);
  set('sellEngine', car.engine !== 'See description' ? car.engine : '');
  set('sellLocation', car.location); set('sellPostcode', car.zip);
  set('sellDescription', car.description); set('sellImage', car.image?.startsWith('https://placehold') ? '' : car.image);
  const setSelect = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val; };
  setSelect('sellType', car.type); setSelect('sellFuel', car.fuel);
  setSelect('sellTransmission', car.transmission); setSelect('sellCondition', car.condition);
  document.getElementById('sellEditId').value = id;
  document.getElementById('sellSubmitBtn').textContent = 'Update Listing ✏️';
  document.getElementById('sellModalTitle').textContent = '✏️ Edit Your Listing';
  // Populate PX fields
  const px = car.partExchange;
  const pxOpenEl = document.getElementById('sellPXOpen');
  const pxPanel = document.getElementById('pxSellPanel');
  if (pxOpenEl) pxOpenEl.checked = !!(px && px.open);
  if (pxPanel) pxPanel.style.display = (px && px.open) ? '' : 'none';
  if (px && px.open) {
    set('sellPXMakes', px.acceptedMakes ? px.acceptedMakes.join(', ') : '');
    set('sellPXMinEngine', px.minEngineL || '');
    set('sellPXMinYear', px.minYear || '');
  }
  openModal('sellModal');
}

function toggleSold(id) {
  const listings = getUserListings();
  const car = listings.find(l => l.id === id);
  if (!car) return;
  car.sold = !car.sold;
  saveUserListings(listings);
  renderAccountPage();
  toast(car.sold ? 'Marked as sold! 🎉' : 'Listing reactivated', car.sold ? 'success' : 'info', car.sold ? '✅' : '🚗');
}

/* ===== ACCOUNT SETTINGS ===== */
function updateAccountName() {
  const newName = document.getElementById('settingsName').value.trim();
  if (!newName) { toast('Please enter a name', 'error', '⚠️'); return; }
  const user = getCurrentUser();
  if (!user) return;
  const accounts = getAccounts();
  const acc = accounts.find(a => a.id === user.id);
  if (acc) { acc.name = newName; saveAccounts(accounts); }
  localStorage.setItem('ad_user', JSON.stringify({ ...user, name: newName }));
  updateAuthUI();
  renderAccountPage();
  toast('Name updated successfully', 'success', '✅');
}

function updateAccountPassword() {
  const current  = document.getElementById('settingsCurrentPw').value;
  const next     = document.getElementById('settingsNewPw').value;
  const confirm  = document.getElementById('settingsConfirmPw').value;
  if (!current || !next || !confirm) { toast('Please fill in all password fields', 'error', '⚠️'); return; }
  if (next.length < 6) { toast('New password must be at least 6 characters', 'error', '⚠️'); return; }
  if (next !== confirm) { toast('New passwords do not match', 'error', '⚠️'); return; }
  const user = getCurrentUser();
  const accounts = getAccounts();
  const acc = accounts.find(a => a.id === user.id);
  if (!acc || acc.password !== current) { toast('Current password is incorrect', 'error', '⚠️'); return; }
  acc.password = next;
  saveAccounts(accounts);
  ['settingsCurrentPw','settingsNewPw','settingsConfirmPw'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  toast('Password updated successfully', 'success', '🔒');
}

/* ===== COOKIE CONSENT ===== */
function checkCookieConsent() {
  if (!localStorage.getItem('ad_cookies')) {
    setTimeout(() => { const b = document.getElementById('cookieBanner'); if(b) b.classList.add('visible'); }, 1000);
  }
}
function acceptCookies() {
  localStorage.setItem('ad_cookies', 'accepted');
  const b = document.getElementById('cookieBanner'); if(b) b.classList.remove('visible');
}
function declineCookies() {
  localStorage.setItem('ad_cookies', 'necessary');
  const b = document.getElementById('cookieBanner'); if(b) b.classList.remove('visible');
}

function postListing() {
  const user = getCurrentUser();
  if (!user) { openModal('loginModal'); return; }
  const get = (id) => document.getElementById(id)?.value.trim();
  const make = get('sellMake'), model = get('sellModel');
  const year = parseInt(get('sellYear')), price = parseInt(get('sellPrice'));
  const type = get('sellType');
  if (!make || !model || !year || !price || !type) {
    toast('Please fill in all required fields', 'error', '⚠️'); return;
  }
  const mileage     = parseInt(get('sellMileage')) || 0;
  const fuel        = get('sellFuel') || 'Petrol';
  const transmission= get('sellTransmission') || 'Manual';
  const condition   = get('sellCondition') || 'Used';
  const color       = get('sellColor') || 'Not specified';
  const location    = get('sellLocation') || 'UK';
  const postcode    = get('sellPostcode') || '';
  const description = get('sellDescription') || '';
  const imageUrl    = get('sellImage') || '';
  const catMap      = { SUV:'SUVs', Truck:'Trucks', Coupe:'Performance', Sedan:'All', Hatchback:'All', Convertible:'All', Van:'All' };
  const img         = imageUrl || carImgPlaceholder(make, model);
  const car = {
    id: 100000 + (Date.now() % 100000),
    make, model, year, price, mileage, type, fuel, transmission, condition, color,
    engine: get('sellEngine') || 'See description',
    horsepower: 0, torque: 0,
    mpg: { city: 0, highway: 0 },
    features: [], dealer: `${user.name} (Private Seller)`,
    location, zip: postcode, distance: 0, rating: 0, reviews: 0,
    image: img, images: [img],
    badge: 'Private Seller',
    priceHistory: [price], daysOnMarket: 0,
    vin: '', accidentFree: false, owners: 1, carfax: false,
    category: catMap[type] || 'All',
    isEV: fuel === 'Electric', isHybrid: fuel === 'Hybrid',
    sellerId: user.id, sellerName: user.name, description,
    listedAt: new Date().toISOString(), isUserListing: true,
    partExchange: (() => {
      const pxOpen = document.getElementById('sellPXOpen')?.checked || false;
      if (!pxOpen) return { open: false };
      const makesRaw = document.getElementById('sellPXMakes')?.value.trim() || '';
      const acceptedMakes = makesRaw ? makesRaw.split(',').map(m => m.trim()).filter(Boolean) : ['Any'];
      const minEngineL = parseFloat(document.getElementById('sellPXMinEngine')?.value) || 0;
      const minYear = parseInt(document.getElementById('sellPXMinYear')?.value) || 0;
      return { open: true, acceptedMakes, ...(minEngineL && { minEngineL }), ...(minYear && { minYear }) };
    })(),
  };
  const editId = parseInt(document.getElementById('sellEditId')?.value);
  const listings = getUserListings();
  if (editId) {
    const idx = listings.findIndex(l => l.id === editId);
    if (idx > -1) { listings[idx] = { ...listings[idx], ...car, id: editId }; }
  } else {
    listings.push(car);
  }
  saveUserListings(listings);
  // Reset form + edit state
  ['sellMake','sellModel','sellYear','sellPrice','sellMileage','sellColor','sellEngine','sellLocation','sellPostcode','sellDescription','sellImage']
    .forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  const editIdEl = document.getElementById('sellEditId');
  if (editIdEl) editIdEl.value = '';
  const submitBtn = document.getElementById('sellSubmitBtn');
  if (submitBtn) submitBtn.textContent = 'Post Listing 🚗';
  const titleEl = document.getElementById('sellModalTitle');
  if (titleEl) titleEl.textContent = '🚗 Post Your Car for Sale';
  // Reset PX fields
  const pxOpenEl = document.getElementById('sellPXOpen');
  if (pxOpenEl) pxOpenEl.checked = false;
  const pxPanel = document.getElementById('pxSellPanel');
  if (pxPanel) pxPanel.style.display = 'none';
  ['sellPXMakes','sellPXMinEngine','sellPXMinYear'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  closeModal('sellModal');
  toast(editId ? 'Listing updated! ✏️' : 'Your car is now listed! 🎉', 'success', '🚗');
  navigate('account');
}

function deleteMyListing(id) {
  if (!confirm('Remove this listing?')) return;
  saveUserListings(getUserListings().filter(l => l.id !== id));
  renderAccountPage();
  toast('Listing removed', 'info', '🗑️');
}

function renderAccountPage() {
  const user = getCurrentUser();
  if (!user) { navigate('home'); openModal('loginModal'); return; }
  const myListings = getUserListings().filter(l => l.sellerId === user.id);
  const favCars    = CAR_DATA.filter(c => isFav(c.id));
  const full       = getAccounts().find(a => a.id === user.id);
  const since      = full ? new Date(full.createdAt).toLocaleDateString('en-GB', { month:'long', year:'numeric' }) : '';
  const initials   = user.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('accountContent').innerHTML = `
    <div class="account-hero">
      <div class="account-avatar">${initials}</div>
      <div class="account-info">
        <h2>${user.name}</h2>
        <p class="account-email">${user.email}</p>
        ${since ? `<p class="account-since">Member since ${since}</p>` : ''}
      </div>
      <div class="account-stats">
        <div class="account-stat"><div class="account-stat-val">${myListings.length}</div><div class="account-stat-lbl">Listings</div></div>
        <div class="account-stat"><div class="account-stat-val">${favCars.length}</div><div class="account-stat-lbl">Saved</div></div>
      </div>
      <button class="btn-cta" onclick="logout()" style="margin-left:auto">Sign Out</button>
    </div>
    <div class="account-section">
      <div class="account-sec-header">
        <h3>My Listings</h3>
        <button class="btn-primary" onclick="openModal('sellModal')">+ Post a Car</button>
      </div>
      ${myListings.length === 0 ? `
        <div class="empty-compare">
          <div style="font-size:48px;margin-bottom:12px">🚗</div>
          <h3 style="font-size:18px;font-weight:800;margin-bottom:8px">No listings yet</h3>
          <p style="color:var(--text-muted);margin-bottom:24px">Post your first car and reach thousands of buyers.</p>
          <button class="btn-cta" onclick="openModal('sellModal')">+ List Your Car</button>
        </div>` : `
        <div class="cars-grid">
          ${myListings.map(car => `
            <div class="car-card reveal" onclick="openCar(${car.id})">
              <div class="car-img-wrap">
                <span class="card-badge badge-private">Private Seller</span>
                <img src="${car.image || carImgPlaceholder(car.make, car.model)}" alt="${car.make} ${car.model}" loading="lazy" onerror="this.src=carImgPlaceholder('${car.make}','${car.model}')">
              </div>
              <div class="car-body">
                <div class="car-title">${car.year} ${car.make} ${car.model}</div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px">
                  <div class="car-price">${fmt(car.price)}</div>
                  <span style="font-size:12px;color:var(--text-muted)">${fmtMi(car.mileage)}</span>
                </div>
                <div style="display:flex;gap:8px;margin-top:12px">
                  <button class="btn-listing-edit" onclick="event.stopPropagation();openEditModal(${car.id})">✏️ Edit</button>
                  <button class="btn-listing-sold ${car.sold ? 'is-sold' : ''}" onclick="event.stopPropagation();toggleSold(${car.id})">${car.sold ? '↩ Relist' : '✅ Sold'}</button>
                  <button class="btn-listing-delete" onclick="event.stopPropagation();deleteMyListing(${car.id})">🗑️</button>
                </div>
              </div>
            </div>`).join('')}
        </div>`}
    </div>
    ${favCars.length > 0 ? `
    <div class="account-section">
      <div class="account-sec-header">
        <h3>Saved Cars</h3>
        <span class="link-action" onclick="navigate('favorites')">View All →</span>
      </div>
      <div class="cars-grid">${favCars.slice(0,3).map(c => carCardHTML(c,false)).join('')}</div>
    </div>` : ''}

    <div class="account-section">
      <div class="account-sec-header"><h3>Account Settings</h3></div>
      <div class="settings-grid">
        <div class="settings-card">
          <h4>Change Display Name</h4>
          <div class="form-field">
            <label>New Name</label>
            <input type="text" id="settingsName" placeholder="${user.name}" value="${user.name}">
          </div>
          <button class="btn-primary" onclick="updateAccountName()">Save Name</button>
        </div>
        <div class="settings-card">
          <h4>Change Password</h4>
          <div class="form-field">
            <label>Current Password</label>
            <input type="password" id="settingsCurrentPw" placeholder="••••••••">
          </div>
          <div class="form-field">
            <label>New Password</label>
            <input type="password" id="settingsNewPw" placeholder="••••••••">
          </div>
          <div class="form-field">
            <label>Confirm New Password</label>
            <input type="password" id="settingsConfirmPw" placeholder="••••••••">
          </div>
          <button class="btn-primary" onclick="updateAccountPassword()">Update Password</button>
        </div>
      </div>
    </div>`;
}

/* ===== STATE ===== */
const state = {
  page: 'home',
  favorites: JSON.parse(localStorage.getItem('favs') || '[]'),
  compareList: JSON.parse(localStorage.getItem('compare') || '[]'),
  filters: { make: '', type: '', fuel: '', condition: '', minPrice: 0, maxPrice: 300000, maxMileage: 200000, category: 'All', isEV: false, isHybrid: false, pxOnly: false, pxMyMake: '', pxMyEngineL: 0, pxMyYear: 0 },
  sort: 'recommended',
  viewMode: 'grid',
  searchQuery: '',
  selectedCar: null,
  currentGalleryImg: 0,
  detailTab: 'specs',
  calcValues: { price: 35000, down: 5000, rate: 6.9, term: 60 },
  tradeIn: { make: '', year: '', mileage: '', condition: '' },
  page_num: 1,
  perPage: 9,
};

/* ===== ROUTER ===== */
function navigate(page, data) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(`page-${page}`);
  if (el) el.classList.add('active');
  state.page = page;
  if (data) Object.assign(state, data);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  updateNav();
  // Close mobile menu on navigation
  const nav = document.getElementById('headerNav');
  if (nav) nav.classList.remove('mobile-open');
  if (page === 'browse') renderBrowse();
  if (page === 'detail' && state.selectedCar) renderDetail(state.selectedCar);
  if (page === 'compare') renderCompare();
  if (page === 'favorites') renderFavorites();
  if (page === 'account') renderAccountPage();
}

function updateNav() {
  document.querySelectorAll('.header-nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === state.page);
  });
}

/* ===== HELPERS ===== */
const fmt = (n) => '£' + n.toLocaleString();
const fmtMi = (n) => n.toLocaleString() + ' mi';

function getBadgeClass(badge) {
  const map = { 'New': 'badge-new', 'Hot Deal': 'badge-hot', 'Great Deal': 'badge-deal', 'Price Drop': 'badge-drop', 'Exclusive': 'badge-exclusive' };
  return map[badge] || 'badge-new';
}

function getMonthlyPayment(price) {
  const down = price * 0.1;
  const rate = 0.069 / 12;
  const loan = price - down;
  const term = 60;
  if (rate === 0) return loan / term;
  return Math.round(loan * rate * Math.pow(1 + rate, term) / (Math.pow(1 + rate, term) - 1));
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let s = '';
  for (let i = 0; i < full; i++) s += '★';
  if (half) s += '½';
  return s;
}

function isFav(id) { return state.favorites.includes(id); }
function isCompare(id) { return state.compareList.includes(id); }

function saveFavs() { localStorage.setItem('favs', JSON.stringify(state.favorites)); }
function saveCompare() { localStorage.setItem('compare', JSON.stringify(state.compareList)); }

function toggleFav(id) {
  const idx = state.favorites.indexOf(id);
  if (idx >= 0) {
    state.favorites.splice(idx, 1);
    toast('Removed from saved cars', 'info', '🗑️');
  } else {
    state.favorites.push(id);
    toast('Saved to your favorites! ❤️', 'success', '❤️');
  }
  saveFavs();
  updateFavBadge();
  document.querySelectorAll(`.card-fav[data-id="${id}"]`).forEach(btn => {
    btn.classList.toggle('active', isFav(id));
    btn.textContent = isFav(id) ? '❤️' : '🤍';
  });
  if (state.page === 'favorites') renderFavorites();
}

function toggleCompare(id) {
  const idx = state.compareList.indexOf(id);
  if (idx >= 0) {
    state.compareList.splice(idx, 1);
    toast('Removed from comparison', 'info', '⊖');
  } else {
    if (state.compareList.length >= 3) {
      toast('You can compare up to 3 cars', 'error', '⚠️');
      return;
    }
    state.compareList.push(id);
    toast('Added to comparison tray', 'success', '⚖️');
  }
  saveCompare();
  updateCompareTray();
  document.querySelectorAll(`.card-compare[data-id="${id}"]`).forEach(btn => {
    btn.classList.toggle('in-compare', isCompare(id));
    btn.innerHTML = isCompare(id) ? '⊖ Remove' : '⊕ Compare';
  });
}

function updateFavBadge() {
  const badge = document.querySelector('.fav-badge');
  if (badge) {
    badge.textContent = state.favorites.length;
    badge.style.display = state.favorites.length ? 'flex' : 'none';
  }
}

function updateCompareTray() {
  const tray = document.getElementById('compareTray');
  const carsInCompare = CAR_DATA.filter(c => isCompare(c.id));
  tray.classList.toggle('visible', carsInCompare.length > 0);

  const carsEl = document.getElementById('trayCarsList');
  let html = '';
  carsInCompare.forEach(c => {
    html += `<div class="tray-car">
      <img src="${c.image}" alt="${c.make} ${c.model}" onerror="this.src='https://placehold.co/48x32/1a2550/fff?text=Car'">
      <span>${c.year} ${c.make}</span>
      <span class="remove-tray" onclick="toggleCompare(${c.id})">✕</span>
    </div>`;
  });
  for (let i = carsInCompare.length; i < 3; i++) {
    html += `<div class="tray-car-slot">+ Add Car</div>`;
  }
  carsEl.innerHTML = html;
  document.getElementById('compareBadge').textContent = state.compareList.length || '';
  document.getElementById('compareBadge').style.display = state.compareList.length ? 'flex' : 'none';
}

/* ===== TOAST ===== */
function toast(msg, type = 'info', icon = 'ℹ️') {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${icon}</span><span>${msg}</span><span class="toast-close">✕</span>`;
  el.querySelector('.toast-close').onclick = () => removeToast(el);
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => removeToast(el), 3500);
}
function removeToast(el) {
  el.classList.remove('show');
  setTimeout(() => el.remove(), 350);
}

/* ===== CAR CARD TEMPLATE ===== */
function carCardHTML(car, listView = false) {
  const monthly = getMonthlyPayment(car.price);
  const favClass = isFav(car.id) ? 'active' : '';
  const favIcon = isFav(car.id) ? '❤️' : '🤍';
  const cmpClass = isCompare(car.id) ? 'in-compare' : '';
  const cmpText = isCompare(car.id) ? '⊖ Remove' : '⊕ Compare';
  const evTag = car.isEV ? `<span class="ev-badge">⚡ EV</span>` : car.isHybrid ? `<span class="ev-badge" style="background:rgba(245,158,11,0.12);color:var(--warning)">🔋 Hybrid</span>` : '';
  const pxTag = (car.partExchange && car.partExchange.open) ? `<span class="badge-px">🔄 PX</span>` : '';

  if (listView) {
    return `<div class="car-card-list" onclick="openCar(${car.id})">
      <div class="car-card-img">
        <span class="card-badge ${getBadgeClass(car.badge)}">${car.badge}</span>
        <img src="${car.image || carImgPlaceholder(car.make, car.model)}" alt="${car.make} ${car.model}" loading="lazy" onerror="this.src=carImgPlaceholder('${car.make}','${car.model}')">
      </div>
      <div class="car-card-body">
        <div class="car-title">${car.year} ${car.make} ${car.model} ${evTag} ${pxTag}</div>
        <div class="car-sub">
          <span>${car.type}</span><span class="dot"></span>
          <span>${car.drivetrain}</span><span class="dot"></span>
          <span>${car.transmission}</span>
        </div>
        <div class="car-specs">
          <div class="car-spec"><span class="spec-val">${car.horsepower}</span><span class="spec-key">HP</span></div>
          <div class="car-spec"><span class="spec-val">${fmtMi(car.mileage)}</span><span class="spec-key">Miles</span></div>
          <div class="car-spec"><span class="spec-val">${car.mpg.city}/${car.mpg.highway}</span><span class="spec-key">${car.mpg.unit || 'MPG'}</span></div>
        </div>
        <div style="font-size:13px;color:var(--text-muted)">📍 ${car.location} · ${car.distance} mi away</div>
      </div>
      <div class="car-card-action">
        <div>
          <div class="car-price">${fmt(car.price)}</div>
          <div class="car-price-mo">${fmt(monthly)}/mo est.</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;width:100%">
          <button class="btn-cta" style="width:100%;padding:10px;font-size:13px;" onclick="event.stopPropagation();openCar(${car.id})">View Details</button>
          <button class="card-fav ${favClass}" data-id="${car.id}" onclick="event.stopPropagation();toggleFav(${car.id})" style="position:static;width:100%;border-radius:var(--radius);background:var(--bg-input);color:var(--text);padding:8px;font-size:13px;display:flex;align-items:center;justify-content:center;gap:4px;">${favIcon} Save</button>
        </div>
      </div>
    </div>`;
  }

  return `<div class="car-card reveal" onclick="openCar(${car.id})">
    <div class="car-card-img">
      <span class="card-badge ${getBadgeClass(car.badge)}">${car.badge}</span>
      <button class="card-fav ${favClass}" data-id="${car.id}" onclick="event.stopPropagation();toggleFav(${car.id})">${favIcon}</button>
      <button class="card-compare ${cmpClass}" data-id="${car.id}" onclick="event.stopPropagation();toggleCompare(${car.id})">${cmpText}</button>
      <img src="${car.image || carImgPlaceholder(car.make, car.model)}" alt="${car.make} ${car.model}" loading="lazy" onerror="this.src=carImgPlaceholder('${car.make}','${car.model}')">
    </div>
    <div class="car-card-body">
      <div class="car-title">${car.year} ${car.make} ${car.model} ${evTag} ${pxTag}</div>
      <div class="car-sub">
        <span>${car.condition}</span><span class="dot"></span>
        <span>${car.type}</span><span class="dot"></span>
        <span>📍 ${car.distance} mi</span>
      </div>
      <div class="car-specs">
        <div class="car-spec"><span class="spec-val">${car.horsepower}hp</span><span class="spec-key">Power</span></div>
        <div class="car-spec"><span class="spec-val">${fmtMi(car.mileage)}</span><span class="spec-key">Miles</span></div>
        <div class="car-spec"><span class="spec-val">${car.mpg.city}/${car.mpg.highway}</span><span class="spec-key">${car.mpg.unit || 'MPG'}</span></div>
      </div>
      <div class="car-footer">
        <div>
          <div class="car-price">${fmt(car.price)}</div>
          <span class="car-price-mo">est. ${fmt(monthly)}/mo</span>
        </div>
        <div class="car-rating">
          <span style="color:var(--warning)">★</span>
          ${car.rating}
          <span class="count">(${car.reviews})</span>
        </div>
      </div>
    </div>
  </div>`;
}

/* ===== HOME PAGE ===== */
function renderHome() {
  const featured = CAR_DATA.slice(0, 8);
  const grid = document.getElementById('featuredGrid');
  if (grid) grid.innerHTML = featured.map(c => carCardHTML(c)).join('');

  const evCars = CAR_DATA.filter(c => c.isEV).slice(0, 4);
  const evGrid = document.getElementById('evGrid');
  if (evGrid) evGrid.innerHTML = evCars.map(c => carCardHTML(c)).join('');

  renderRecentlyViewed();
  initReveal();
}

/* ===== BROWSE PAGE ===== */
function getFilteredCars() {
  let cars = [...CAR_DATA, ...getUserListings()];
  const f = state.filters;
  const q = state.searchQuery.toLowerCase();

  if (q) cars = cars.filter(c =>
    `${c.year} ${c.make} ${c.model} ${c.type} ${c.fuel} ${c.color}`.toLowerCase().includes(q)
  );
  if (f.make) cars = cars.filter(c => c.make === f.make);
  if (f.type && f.type !== 'All') cars = cars.filter(c => c.type === f.type);
  if (f.fuel && f.fuel !== 'All') cars = cars.filter(c => c.fuel === f.fuel);
  if (f.condition && f.condition !== 'All') cars = cars.filter(c => c.condition === f.condition);
  if (f.category && f.category !== 'All') cars = cars.filter(c => c.category === f.category);
  if (f.isEV) cars = cars.filter(c => c.isEV);
  if (f.isHybrid) cars = cars.filter(c => c.isHybrid);
  if (f.noAccident) cars = cars.filter(c => c.accidentFree);
  if (f.carfax) cars = cars.filter(c => c.carfax);
  if (f.pxOnly) {
    cars = cars.filter(c => c.partExchange && c.partExchange.open);
    if (f.pxMyMake) {
      cars = cars.filter(c => {
        const px = c.partExchange;
        if (!px || !px.acceptedMakes) return true;
        return px.acceptedMakes.includes('Any') || px.acceptedMakes.some(m => m.toLowerCase() === f.pxMyMake.toLowerCase());
      });
    }
    if (f.pxMyEngineL > 0) {
      cars = cars.filter(c => {
        const px = c.partExchange;
        if (!px || !px.minEngineL) return true;
        return px.minEngineL <= f.pxMyEngineL;
      });
    }
    if (f.pxMyYear > 0) {
      cars = cars.filter(c => {
        const px = c.partExchange;
        if (!px || !px.minYear) return true;
        return px.minYear <= f.pxMyYear;
      });
    }
  }
  cars = cars.filter(c => c.price >= f.minPrice && c.price <= f.maxPrice);
  cars = cars.filter(c => c.mileage <= f.maxMileage);

  switch (state.sort) {
    case 'price-low': cars.sort((a, b) => a.price - b.price); break;
    case 'price-high': cars.sort((a, b) => b.price - a.price); break;
    case 'mileage': cars.sort((a, b) => a.mileage - b.mileage); break;
    case 'year': cars.sort((a, b) => b.year - a.year); break;
    case 'rating': cars.sort((a, b) => b.rating - a.rating); break;
    case 'distance': cars.sort((a, b) => a.distance - b.distance); break;
    default: break;
  }
  return cars;
}

function renderBrowse() {
  const cars = getFilteredCars();
  const total = cars.length;
  const start = (state.page_num - 1) * state.perPage;
  const paginated = cars.slice(start, start + state.perPage);

  document.getElementById('browseCount').innerHTML = `<strong>${total}</strong> vehicles found`;

  const activeFilters = document.getElementById('activeFilters');
  const tags = [];
  if (state.filters.make) tags.push({ label: state.filters.make, key: 'make' });
  if (state.filters.type && state.filters.type !== 'All') tags.push({ label: state.filters.type, key: 'type' });
  if (state.filters.fuel && state.filters.fuel !== 'All') tags.push({ label: state.filters.fuel, key: 'fuel' });
  if (state.filters.category && state.filters.category !== 'All') tags.push({ label: state.filters.category, key: 'category' });
  if (state.filters.pxOnly) tags.push({ label: '🔄 PX Welcome', key: 'px' });
  if (state.searchQuery) tags.push({ label: `"${state.searchQuery}"`, key: 'q' });

  activeFilters.innerHTML = tags.map(t =>
    `<span class="filter-tag">${t.label}<button onclick="clearFilter('${t.key}')">✕</button></span>`
  ).join('');

  const grid = document.getElementById('carsGrid');
  if (paginated.length === 0) {
    grid.innerHTML = `<div class="no-results" style="grid-column:1/-1">
      <div class="no-results-icon">🔍</div>
      <h3>No cars found</h3>
      <p>Try adjusting your filters or search query to find more results.</p>
      <button class="btn-primary" onclick="clearAllFilters()">Clear All Filters</button>
    </div>`;
  } else {
    if (state.viewMode === 'list') {
      grid.style.display = 'block';
      grid.innerHTML = `<div class="cars-list">${paginated.map(c => carCardHTML(c, true)).join('')}</div>`;
    } else {
      grid.style.display = '';
      grid.className = 'cars-grid';
      grid.innerHTML = paginated.map(c => carCardHTML(c)).join('');
    }
  }

  renderPagination(total);
  initReveal();

  // Update price range display
  const priceMin = document.getElementById('priceMinVal');
  const priceMax = document.getElementById('priceMaxVal');
  if (priceMin) priceMin.textContent = fmt(state.filters.minPrice);
  if (priceMax) priceMax.textContent = fmt(state.filters.maxPrice);
}

function clearFilter(key) {
  if (key === 'q') { state.searchQuery = ''; document.getElementById('headerSearch').value = ''; }
  else if (key === 'px') {
    state.filters.pxOnly = false;
    state.filters.pxMyMake = '';
    state.filters.pxMyEngineL = 0;
    state.filters.pxMyYear = 0;
    const filterPX = document.getElementById('filterPX');
    if (filterPX) filterPX.checked = false;
    const pxWrap = document.getElementById('pxFilterWrap');
    if (pxWrap) pxWrap.style.display = 'none';
    ['pxMyMake','pxMyEngine','pxMyYear'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  } else state.filters[key] = key === 'category' ? 'All' : '';
  state.page_num = 1;
  renderBrowse();
}

function clearAllFilters() {
  state.filters = { make: '', type: '', fuel: '', condition: '', minPrice: 0, maxPrice: 300000, maxMileage: 200000, category: 'All', isEV: false, isHybrid: false, noAccident: false, carfax: false, pxOnly: false, pxMyMake: '', pxMyEngineL: 0, pxMyYear: 0 };
  state.searchQuery = '';
  state.page_num = 1;
  document.getElementById('filterMake').value = '';
  document.getElementById('filterType').value = '';
  document.getElementById('filterFuel').value = '';
  document.getElementById('filterCondition').value = '';
  document.getElementById('headerSearch').value = '';
  const filterPX = document.getElementById('filterPX');
  if (filterPX) filterPX.checked = false;
  const pxWrap = document.getElementById('pxFilterWrap');
  if (pxWrap) pxWrap.style.display = 'none';
  ['pxMyMake', 'pxMyEngine', 'pxMyYear'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderBrowse();
  toast('All filters cleared', 'info', '✨');
}

function renderPagination(total) {
  const pages = Math.ceil(total / state.perPage);
  const el = document.getElementById('pagination');
  if (!el || pages <= 1) { if (el) el.innerHTML = ''; return; }

  let html = `<button class="page-btn" ${state.page_num === 1 ? 'disabled' : ''} onclick="changePage(${state.page_num - 1})">‹</button>`;
  for (let i = 1; i <= pages; i++) {
    if (pages > 7 && i > 2 && i < pages - 1 && Math.abs(i - state.page_num) > 1) {
      if (i === 3 || i === pages - 2) html += `<span class="page-btn" style="border:none;cursor:default">…</span>`;
      continue;
    }
    html += `<button class="page-btn ${state.page_num === i ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" ${state.page_num === pages ? 'disabled' : ''} onclick="changePage(${state.page_num + 1})">›</button>`;
  el.innerHTML = html;
}

function changePage(n) {
  state.page_num = n;
  renderBrowse();
  document.getElementById('carsGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ===== CAR DETAIL ===== */
function trackViewed(id) {
  let viewed = JSON.parse(localStorage.getItem('ad_viewed') || '[]');
  viewed = [id, ...viewed.filter(i => i !== id)].slice(0, 6);
  localStorage.setItem('ad_viewed', JSON.stringify(viewed));
}

function renderRecentlyViewed() {
  const section = document.getElementById('recentlyViewedSection');
  if (!section) return;
  const ids = JSON.parse(localStorage.getItem('ad_viewed') || '[]');
  const allCars = [...CAR_DATA, ...getUserListings()];
  const cars = ids.map(id => allCars.find(c => c.id === id)).filter(Boolean);
  if (cars.length === 0) { section.style.display = 'none'; return; }
  section.style.display = '';
  document.getElementById('recentlyViewedGrid').innerHTML = cars.map(c => carCardHTML(c)).join('');
  initReveal();
}

function openCar(id) {
  state.selectedCar = [...CAR_DATA, ...getUserListings()].find(c => c.id === id);
  state.currentGalleryImg = 0;
  state.detailTab = 'specs';
  trackViewed(id);
  navigate('detail');
}

function renderDetail(car) {
  document.getElementById('detailBreadcrumb').textContent = `${car.year} ${car.make} ${car.model}`;
  document.getElementById('detailTitle').textContent = `${car.year} ${car.make} ${car.model}`;
  document.getElementById('detailSub').textContent = `${car.condition} · ${car.type} · ${car.color} · ${car.condition === 'New' ? '0' : car.mileage.toLocaleString()} miles`;
  document.getElementById('detailPrice').textContent = fmt(car.price);

  const monthly = getMonthlyPayment(car.price);
  document.getElementById('detailMonthly').innerHTML = `Est. <span>${fmt(monthly)}/mo</span> with 10% deposit, 6.9% APR, 60 months`;

  // Gallery
  const mainImg = document.getElementById('galleryMain');
  mainImg.src = car.images[0];
  mainImg.onerror = () => mainImg.src = carImgPlaceholder(car.make, car.model);
  const thumbsEl = document.getElementById('galleryThumbs');
  thumbsEl.innerHTML = car.images.map((img, i) =>
    `<div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="setGalleryImg(${i})">
      <img src="${img}" alt="" onerror="this.src='https://placehold.co/120x80/1a2550/fff?text=Car'">
    </div>`
  ).join('');

  // Specs
  document.getElementById('detailSpecs').innerHTML = `
    <div class="spec-grid">
      <div class="spec-item"><div class="spec-icon">⚡</div><div><div class="spec-label">Engine</div><div class="spec-value">${car.engine}</div></div></div>
      <div class="spec-item"><div class="spec-icon">🏎️</div><div><div class="spec-label">Horsepower</div><div class="spec-value">${car.horsepower} HP</div></div></div>
      <div class="spec-item"><div class="spec-icon">🔩</div><div><div class="spec-label">Torque</div><div class="spec-value">${car.torque} lb-ft</div></div></div>
      <div class="spec-item"><div class="spec-icon">⛽</div><div><div class="spec-label">Fuel Economy</div><div class="spec-value">${car.mpg.city}/${car.mpg.highway} ${car.mpg.unit || 'MPG'}</div></div></div>
      <div class="spec-item"><div class="spec-icon">🚗</div><div><div class="spec-label">Drivetrain</div><div class="spec-value">${car.drivetrain}</div></div></div>
      <div class="spec-item"><div class="spec-icon">⚙️</div><div><div class="spec-label">Transmission</div><div class="spec-value">${car.transmission}</div></div></div>
      <div class="spec-item"><div class="spec-icon">🎨</div><div><div class="spec-label">Color</div><div class="spec-value">${car.color}</div></div></div>
      <div class="spec-item"><div class="spec-icon">📅</div><div><div class="spec-label">Year</div><div class="spec-value">${car.year}</div></div></div>
      ${car.range ? `<div class="spec-item"><div class="spec-icon">🔋</div><div><div class="spec-label">Range</div><div class="spec-value">${car.range} miles</div></div></div>` : ''}
    </div>`;

  // Features
  document.getElementById('detailFeatures').innerHTML =
    `<div class="features-list">${car.features.map(f => `<div class="feature-item">${f}</div>`).join('')}</div>`;

  // History
  document.getElementById('detailHistory').innerHTML = `
    <div class="history-badges">
      ${car.accidentFree ? '<span class="history-badge badge-ok">✓ No Accidents Reported</span>' : '<span class="history-badge badge-warn">⚠ 1 Accident Reported</span>'}
      <span class="history-badge badge-ok">✓ ${car.owners} Owner${car.owners > 1 ? 's' : ''}</span>
      ${car.carfax ? '<span class="history-badge badge-ok">✓ CARFAX® Report Available</span>' : ''}
      <span class="history-badge badge-ok">✓ ${car.condition} Condition</span>
    </div>
    <p style="margin-top:16px;font-size:14px;color:var(--text-muted)">VIN: <strong style="color:var(--text)">${car.vin}</strong></p>
    <p style="margin-top:8px;font-size:13px;color:var(--text-muted)">Listed ${car.daysOnMarket} days ago · ${car.location}</p>`;

  // Price chart
  renderPriceChart(car.priceHistory);

  // Dealer
  document.getElementById('dealerName').textContent = car.dealer;
  document.getElementById('dealerLocation').textContent = car.location;
  document.getElementById('dealerRating').innerHTML = `<span style="color:var(--warning)">★★★★★</span> ${car.rating} (${car.reviews} reviews)`;

  // Pre-fill mini calculator in sidebar
  state.calcValues.price = car.price;
  state.calcValues.down = Math.round(car.price * 0.1);
  const dcDown = document.getElementById('detailCalcDown');
  if (dcDown) dcDown.value = state.calcValues.down;
  updateDetailCalc();

  // Part Exchange section
  const pxEl = document.getElementById('detailPXSection');
  if (pxEl) {
    const px = car.partExchange;
    if (px && px.open) {
      const makes = px.acceptedMakes && !px.acceptedMakes.includes('Any') ? px.acceptedMakes.join(', ') : null;
      const reqs = [
        makes        ? { label: 'Accepted makes',  val: makes }                    : null,
        px.minEngineL ? { label: 'Min engine size', val: px.minEngineL + 'L+' }   : null,
        px.minYear    ? { label: 'Min year',        val: px.minYear + ' or newer' } : null,
      ].filter(Boolean);
      const rowsHTML = reqs.length ? reqs.map((r, i, arr) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 13px;font-size:13px;${i < arr.length - 1 ? 'border-bottom:1px solid rgba(245,158,11,0.14);' : ''}">
          <span style="color:var(--text-muted)">${r.label}</span>
          <strong style="color:var(--text);font-weight:600">${r.val}</strong>
        </div>`).join('') : '';
      pxEl.innerHTML = `
        <div style="margin-top:12px;border-radius:12px;overflow:hidden;border:1px solid rgba(245,158,11,0.3);background:rgba(245,158,11,0.06);">
          <div style="padding:11px 14px;border-bottom:1px solid rgba(245,158,11,0.15);">
            <span style="display:inline-flex;align-items:center;gap:5px;background:rgba(245,158,11,0.18);color:#D97706;border:1px solid rgba(245,158,11,0.32);padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:0.3px;">🔄 Part Exchange Welcome</span>
          </div>
          <div style="padding:10px 14px 6px;font-size:13px;color:var(--text-muted);line-height:1.5;">This seller is open to a part exchange on your current car.</div>
          ${rowsHTML ? `<div>${rowsHTML}</div>` : `<div style="padding:2px 14px 12px;font-size:13px;color:var(--text-muted);font-style:italic;">Accepting any make, age, or engine size.</div>`}
        </div>`;
    } else {
      pxEl.innerHTML = `
        <div style="margin-top:12px;border-radius:10px;background:var(--bg-input);border:1px solid var(--border);padding:10px 14px;display:flex;align-items:center;gap:8px;">
          <span style="font-size:15px;opacity:0.7">🚫</span>
          <span style="font-size:13px;font-weight:600;color:var(--text-muted);">Not accepting part exchanges</span>
        </div>`;
    }
  }

  // Fav btn
  const favBtn = document.getElementById('detailFavBtn');
  if (favBtn) {
    favBtn.textContent = isFav(car.id) ? '❤️ Saved' : '🤍 Save Car';
    favBtn.onclick = () => {
      toggleFav(car.id);
      favBtn.textContent = isFav(car.id) ? '❤️ Saved' : '🤍 Save Car';
    };
  }
}

function setGalleryImg(idx) {
  const car = state.selectedCar;
  if (!car) return;
  state.currentGalleryImg = idx;
  document.getElementById('galleryMain').src = car.images[idx];
  document.querySelectorAll('.gallery-thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
}

function galleryNav(dir) {
  const car = state.selectedCar;
  if (!car) return;
  const next = (state.currentGalleryImg + dir + car.images.length) % car.images.length;
  setGalleryImg(next);
}

function switchTab(tab) {
  state.detailTab = tab;
  document.querySelectorAll('.detail-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.toggle('active', t.id === `tab-${tab}`));
}

/* ===== PRICE CHART ===== */
function renderPriceChart(history) {
  const canvas = document.getElementById('priceChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 400;
  const H = 120;
  canvas.width = W;
  canvas.height = H;

  const min = Math.min(...history) * 0.995;
  const max = Math.max(...history) * 1.005;
  const pad = { t: 10, r: 10, b: 30, l: 60 };
  const pw = W - pad.l - pad.r;
  const ph = H - pad.t - pad.b;

  ctx.clearRect(0, 0, W, H);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#8B92A9' : '#6B7280';
  const lineColor = '#3563E9';
  const fillColor = 'rgba(53,99,233,0.1)';
  const gridColor = isDark ? '#2D3148' : '#E8ECF0';

  // Grid lines
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) {
    const y = pad.t + (ph / 3) * i;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(W - pad.r, y);
    ctx.stroke();
    const val = max - ((max - min) / 3) * i;
    ctx.fillStyle = textColor;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('£' + Math.round(val / 1000) + 'k', pad.l - 4, y + 4);
  }

  const pts = history.map((v, i) => ({
    x: pad.l + (i / (history.length - 1)) * pw,
    y: pad.t + (1 - (v - min) / (max - min)) * ph
  }));

  // Fill
  ctx.beginPath();
  ctx.moveTo(pts[0].x, H - pad.b);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length - 1].x, H - pad.b);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Line
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Points
  pts.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();
    ctx.strokeStyle = isDark ? '#1A1D27' : '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    const months = ['5mo ago', '4mo ago', '3mo ago', '2mo ago', 'Now'];
    const lbl = months[history.length <= 5 ? history.length - 1 - (history.length - 1 - i) : i];
    if (lbl) {
      ctx.fillStyle = textColor;
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lbl, p.x, H - pad.b + 16);
    }
  });
}

/* ===== LOAN CALCULATOR ===== */
function updateCalc() {
  const price = parseFloat(document.getElementById('calcPrice').value) || 0;
  const down = parseFloat(document.getElementById('calcDown').value) || 0;
  const rate = parseFloat(document.getElementById('calcRate').value) || 0;
  const term = parseInt(document.getElementById('calcTerm').value) || 60;

  const loan = Math.max(0, price - down);
  const monthRate = rate / 100 / 12;
  let monthly = 0;
  if (monthRate === 0) {
    monthly = loan / term;
  } else {
    monthly = loan * monthRate * Math.pow(1 + monthRate, term) / (Math.pow(1 + monthRate, term) - 1);
  }
  const totalPaid = monthly * term;
  const totalInterest = totalPaid - loan;

  document.getElementById('calcMonthly').textContent = '£' + Math.round(monthly).toLocaleString();
  document.getElementById('calcLoan').textContent = '£' + Math.round(loan).toLocaleString();
  document.getElementById('calcInterest').textContent = '£' + Math.round(totalInterest).toLocaleString();
  document.getElementById('calcTotal').textContent = '£' + Math.round(totalPaid).toLocaleString();
}

/* ===== DETAIL MINI CALCULATOR ===== */
function updateDetailCalc() {
  const car = state.selectedCar;
  if (!car) return;
  const down = parseFloat(document.getElementById('detailCalcDown')?.value) || 0;
  const rate = parseFloat(document.getElementById('detailCalcRate')?.value) || 6.9;
  const term = parseInt(document.getElementById('detailCalcTerm')?.value) || 60;
  const loan = Math.max(0, car.price - down);
  const monthRate = rate / 100 / 12;
  let monthly = 0;
  if (monthRate === 0) { monthly = loan / term; }
  else { monthly = loan * monthRate * Math.pow(1 + monthRate, term) / (Math.pow(1 + monthRate, term) - 1); }
  const el = document.getElementById('detailCalcMonthly');
  if (el) el.textContent = '£' + Math.round(monthly).toLocaleString() + '/mo';
}

/* ===== TRADE-IN ESTIMATOR ===== */
function estimateTradeIn() {
  const make = document.getElementById('tradeMake').value;
  const year = parseInt(document.getElementById('tradeYear').value);
  const mileage = parseInt(document.getElementById('tradeMileage').value);
  const condition = document.getElementById('tradeCondition').value;

  if (!make || !year || !mileage || !condition) {
    toast('Please fill in all fields', 'error', '⚠️');
    return;
  }

  const baseValues = { 'BMW': 28000, 'Tesla': 32000, 'Toyota': 22000, 'Honda': 18000, 'Ford': 20000, 'Chevrolet': 19000, 'Mercedes-Benz': 30000, 'Porsche': 45000, 'Audi': 26000 };
  const base = baseValues[make] || 20000;
  const age = 2024 - year;
  const ageFactor = Math.max(0.3, 1 - age * 0.08);
  const mileFactor = Math.max(0.5, 1 - (mileage / 100000) * 0.25);
  const condFactor = { excellent: 1, good: 0.9, fair: 0.75, poor: 0.55 }[condition] || 0.8;

  const low = Math.round(base * ageFactor * mileFactor * condFactor * 0.9);
  const high = Math.round(base * ageFactor * mileFactor * condFactor * 1.1);

  document.getElementById('tradeRange').textContent = `${fmt(low)} – ${fmt(high)}`;
  document.getElementById('tradeResult').classList.add('show');
  toast('Trade-in estimate ready!', 'success', '✅');
}

/* ===== COMPARE PAGE ===== */
function renderCompare() {
  const cars = CAR_DATA.filter(c => isCompare(c.id));
  const el = document.getElementById('compareContent');
  if (!el) return;

  if (cars.length === 0) {
    el.innerHTML = `<div class="empty-compare">
      <div style="font-size:56px;margin-bottom:16px">⚖️</div>
      <h2 style="margin-bottom:8px;font-size:22px;font-weight:800">No Cars to Compare</h2>
      <p style="color:var(--text-muted);margin-bottom:28px;font-size:15px">Browse cars and click "⊕ Compare" to add up to 3 vehicles here.</p>
      <button class="btn-cta" onclick="navigate('browse')">Browse Cars</button>
    </div>`;
    return;
  }

  const cols = cars.length + 1;
  const gridStyle = `grid-template-columns: 160px repeat(${cars.length}, 1fr)`;
  const rows = [
    ['Price', cars.map(c => fmt(c.price))],
    ['Year', cars.map(c => c.year)],
    ['Mileage', cars.map(c => fmtMi(c.mileage))],
    ['Engine', cars.map(c => c.engine)],
    ['Horsepower', cars.map(c => c.horsepower + ' HP')],
    ['Torque', cars.map(c => c.torque + ' lb-ft')],
    ['Fuel Economy', cars.map(c => `${c.mpg.city}/${c.mpg.highway} ${c.mpg.unit || 'MPG'}`)],
    ['Drivetrain', cars.map(c => c.drivetrain)],
    ['Transmission', cars.map(c => c.transmission)],
    ['Fuel Type', cars.map(c => c.fuel)],
    ['Owners', cars.map(c => c.owners)],
    ['Rating', cars.map(c => `★ ${c.rating}`)],
    ['Location', cars.map(c => c.location)],
  ];

  const numericRows = {
    'Price': cars.map(c => c.price),
    'Horsepower': cars.map(c => c.horsepower),
    'Torque': cars.map(c => c.torque),
    'Mileage': cars.map(c => c.mileage),
    'Rating': cars.map(c => c.rating),
  };

  function bestWorst(label, idx) {
    if (!numericRows[label]) return '';
    const vals = numericRows[label];
    const v = vals[idx];
    const isGoodHigh = ['Horsepower', 'Torque', 'Rating'].includes(label);
    const isGoodLow = ['Price', 'Mileage'].includes(label);
    if (isGoodHigh && v === Math.max(...vals)) return 'best';
    if (isGoodHigh && v === Math.min(...vals)) return 'worst';
    if (isGoodLow && v === Math.min(...vals)) return 'best';
    if (isGoodLow && v === Math.max(...vals)) return 'worst';
    return '';
  }

  el.innerHTML = `
    <div class="compare-table">
      <div class="compare-grid" style="${gridStyle}">
        <div class="compare-header-row" style="${gridStyle};grid-column:1/-1;display:grid">
          <div class="compare-car-col" style="background:var(--bg-input)"></div>
          ${cars.map(c => `
            <div class="compare-car-col">
              <button class="compare-remove" onclick="removeFromCompare(${c.id})">✕</button>
              <img class="compare-car-img" src="${c.image}" alt="${c.make}" onerror="this.src='https://placehold.co/300x140/1a2550/fff?text=${c.make}'">
              <div class="compare-car-name">${c.year} ${c.make} ${c.model}</div>
              <div class="compare-car-price">${fmt(c.price)}</div>
            </div>`).join('')}
        </div>
        ${rows.map(([label, vals]) => `
          <div class="compare-row" style="${gridStyle};grid-column:1/-1;display:grid">
            <div class="compare-label">${label}</div>
            ${vals.map((v, i) => `<div class="compare-val ${bestWorst(label, i)}">${v}</div>`).join('')}
          </div>`).join('')}
      </div>
    </div>`;
}

function removeFromCompare(id) {
  state.compareList = state.compareList.filter(i => i !== id);
  saveCompare();
  updateCompareTray();
  renderCompare();
  document.querySelectorAll(`.card-compare[data-id="${id}"]`).forEach(btn => {
    btn.classList.remove('in-compare');
    btn.textContent = '⊕ Compare';
  });
}

/* ===== FAVORITES PAGE ===== */
function renderFavorites() {
  const cars = CAR_DATA.filter(c => isFav(c.id));
  const el = document.getElementById('favoritesGrid');
  if (!el) return;

  if (cars.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:80px 24px;grid-column:1/-1">
      <div style="font-size:56px;margin-bottom:16px">🤍</div>
      <h2 style="margin-bottom:8px">No Saved Cars Yet</h2>
      <p style="color:var(--text-muted);margin-bottom:24px">Tap the heart icon on any car to save it here.</p>
      <button class="btn-primary" onclick="navigate('browse')">Browse Cars</button>
    </div>`;
  } else {
    el.innerHTML = cars.map(c => carCardHTML(c)).join('');
    initReveal();
  }
  document.getElementById('favCount').textContent = `${cars.length} saved car${cars.length !== 1 ? 's' : ''}`;
}

/* ===== SEARCH ===== */
function doSearch(q) {
  state.searchQuery = q;
  state.page_num = 1;
  if (state.page !== 'browse') navigate('browse');
  else renderBrowse();
}

/* ===== CATEGORY FILTER ===== */
function setCatFilter(cat) {
  state.filters.category = cat;
  state.page_num = 1;
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.toggle('active', p.dataset.cat === cat));
  if (state.page === 'browse') renderBrowse();
}

/* ===== INTERSECTION OBSERVER FOR REVEAL ===== */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
}

/* ===== DARK MODE ===== */
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
  document.getElementById('themeBtn').textContent = isDark ? '🌙' : '☀️';
  if (state.selectedCar) setTimeout(() => renderPriceChart(state.selectedCar.priceHistory), 100);
}

/* ===== MOBILE MENU ===== */
function toggleMenu() {
  const nav = document.querySelector('.header-nav');
  nav.classList.toggle('mobile-open');
}

function toggleMobileFilters() {
  document.getElementById('filterSidebar').classList.toggle('mobile-open');
  document.getElementById('sidebarBackdrop')?.classList.toggle('visible');
}

/* ===== MODALS ===== */
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

function openContactModal() {
  const car = state.selectedCar;
  if (car) document.getElementById('contactCarName').textContent = `${car.year} ${car.make} ${car.model}`;
  openModal('contactModal');
}

function submitContact() {
  toast('Message sent to dealer! They\'ll be in touch shortly.', 'success', '📧');
  closeModal('contactModal');
}

function openAlertModal() {
  openModal('alertModal');
}

function submitAlert() {
  toast('Price alert set! We\'ll notify you of any drops.', 'success', '🔔');
  closeModal('alertModal');
}

function openTestDriveModal() {
  openModal('testDriveModal');
}

function submitTestDrive() {
  toast('Test drive scheduled! Check your email for confirmation.', 'success', '🚗');
  closeModal('testDriveModal');
}

/* ===== PART EXCHANGE FILTER HELPERS ===== */
function togglePXFilter(checked) {
  state.filters.pxOnly = checked;
  const wrap = document.getElementById('pxFilterWrap');
  if (wrap) wrap.style.display = checked ? '' : 'none';
  state.page_num = 1;
  renderBrowse();
}

function updatePXFilters() {
  state.filters.pxMyMake = document.getElementById('pxMyMake')?.value.trim() || '';
  state.filters.pxMyEngineL = parseFloat(document.getElementById('pxMyEngine')?.value) || 0;
  state.filters.pxMyYear = parseInt(document.getElementById('pxMyYear')?.value) || 0;
  state.page_num = 1;
  renderBrowse();
}

function toggleSellPX(checked) {
  const panel = document.getElementById('pxSellPanel');
  if (panel) panel.style.display = checked ? '' : 'none';
}

/* ===== SETUP FILTERS ===== */
function setupFilters() {
  const makeSelect = document.getElementById('filterMake');
  if (makeSelect) {
    makeSelect.innerHTML = `<option value="">All Makes</option>` + MAKES.map(m => `<option>${m}</option>`).join('');
    makeSelect.onchange = () => { state.filters.make = makeSelect.value; state.page_num = 1; renderBrowse(); };
  }

  const typeSelect = document.getElementById('filterType');
  if (typeSelect) {
    typeSelect.onchange = () => { state.filters.type = typeSelect.value; state.page_num = 1; renderBrowse(); };
  }

  const fuelSelect = document.getElementById('filterFuel');
  if (fuelSelect) {
    fuelSelect.onchange = () => { state.filters.fuel = fuelSelect.value; state.page_num = 1; renderBrowse(); };
  }

  const condSelect = document.getElementById('filterCondition');
  if (condSelect) {
    condSelect.onchange = () => { state.filters.condition = condSelect.value; state.page_num = 1; renderBrowse(); };
  }

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.onchange = () => { state.sort = sortSelect.value; state.page_num = 1; renderBrowse(); };
  }

  const heroMake = document.getElementById('heroMake');
  if (heroMake) {
    heroMake.innerHTML = `<option value="">Any Make</option>` + MAKES.map(m => `<option>${m}</option>`).join('');
  }
}

/* ===== HERO SEARCH ===== */
function heroSearch() {
  const make = document.getElementById('heroMake')?.value || '';
  const type = document.getElementById('heroType')?.value || '';
  const maxPrice = document.getElementById('heroMaxPrice')?.value || '';

  if (make) state.filters.make = make;
  if (type) state.filters.type = type;
  if (maxPrice) state.filters.maxPrice = parseInt(maxPrice);
  state.page_num = 1;
  navigate('browse');
}

/* ===== FOOTER HELPERS ===== */
function scrollToSection(page, id) {
  navigate(page);
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 120);
}

function decodeVIN() {
  const input = document.getElementById('vinInput');
  const vin = (input ? input.value : '').trim().toUpperCase();
  const resultEl = document.getElementById('vinResult');
  if (!resultEl) return;
  if (vin.length !== 17) {
    toast('Please enter a valid 17-character VIN', 'error', '⚠️');
    return;
  }
  const wmi = { 'WBS':'BMW','WBA':'BMW','5YJ':'Tesla','WP0':'Porsche','1G1':'Chevrolet',
    'JH4':'Honda','JTD':'Toyota','JTM':'Toyota','1FT':'Ford','1FA':'Ford','SAL':'Land Rover',
    'ZHW':'Lamborghini','WDD':'Mercedes-Benz','WAU':'Audi','WVW':'Volkswagen','SCA':'Rolls-Royce',
    'SAJ':'Jaguar','SAR':'Range Rover','VF1':'Renault','VF3':'Peugeot','VS6':'SEAT' };
  const yearMap = { 'A':2010,'B':2011,'C':2012,'D':2013,'E':2014,'F':2015,'G':2016,
    'H':2017,'J':2018,'K':2019,'L':2020,'M':2021,'N':2022,'P':2023,'R':2024,'S':2025 };
  const make = wmi[vin.slice(0,3)] || 'Unknown';
  const year = yearMap[vin[9]] || 'Unknown';
  const country = { 'W':'Germany','5':'USA','J':'Japan','S':'UK','V':'France','Z':'Italy','1':'USA' }[vin[0]] || 'Unknown';
  resultEl.innerHTML = `
    <div style="background:var(--bg-input);border-radius:var(--radius);padding:16px;margin-top:4px">
      ${[['Make', make],['Model Year', year],['Country of Origin', country],['Serial No.', vin.slice(11)],['Full VIN', vin]]
        .map(([k,v]) => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:14px">
          <span style="color:var(--text-muted)">${k}</span><strong>${v}</strong></div>`).join('')}
    </div>`;
}

function submitFinancing() {
  closeModal('financingModal');
  toast('Pre-approval submitted! You\'ll receive your rate by email within 2 minutes.', 'success', '🏦');
}

/* ===== ALERT BANNER ===== */
function dismissAlert() {
  const banner = document.getElementById('alertBanner');
  if (banner) { banner.style.display = 'none'; }
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  // Theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  setupFilters();
  renderHome();
  updateFavBadge();
  updateCompareTray();
  updateAuthUI();
  checkCookieConsent();
  navigate('home');

  // Header search
  const searchInput = document.getElementById('headerSearch');
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', e => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        if (e.target.value.length > 1 || e.target.value === '') doSearch(e.target.value);
      }, 350);
    });
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') doSearch(e.target.value);
    });
  }

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Keyboard: Escape closes modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
    }
  });
});

/* ===== MISSING STUBS ===== */
function goToBrowse(cat) {
  state.filters.category = cat || 'All';
  state.page_num = 1;
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.toggle('active', p.dataset.cat === cat));
  navigate('browse');
}

function setHeroTab(el, tab) {
  document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  if (tab === 'electric') {
    state.filters.isEV = true;
    state.filters.isHybrid = false;
  } else if (tab === 'certified') {
    state.filters.condition = 'Used';
  } else if (tab === 'new') {
    state.filters.condition = 'New';
    state.filters.isEV = false;
  } else {
    state.filters.condition = '';
    state.filters.isEV = false;
  }
}

function subscribeNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  if (input) input.value = '';
  toast('You\'re subscribed! Watch your inbox for the best deals.', 'success', '🔔');
}

function filterNoAccident(checked) {
  state.filters.noAccident = checked;
  state.page_num = 1;
  renderBrowse();
}

function filterCarfax(checked) {
  state.filters.carfax = checked;
  state.page_num = 1;
  renderBrowse();
}

function updatePriceRange() {
  const minEl = document.getElementById('priceMin');
  const maxEl = document.getElementById('priceMax');
  const fillEl = document.getElementById('priceFill');
  if (!minEl || !maxEl) return;
  let min = parseInt(minEl.value), max = parseInt(maxEl.value);
  if (min > max) { [min, max] = [max, min]; minEl.value = min; maxEl.value = max; }
  state.filters.minPrice = min;
  state.filters.maxPrice = max;
  document.getElementById('priceMinVal').textContent = fmt(min);
  document.getElementById('priceMaxVal').textContent = fmt(max);
  if (fillEl) {
    const pct1 = (min / 300000) * 100, pct2 = (max / 300000) * 100;
    fillEl.style.left = pct1 + '%';
    fillEl.style.right = (100 - pct2) + '%';
  }
  state.page_num = 1;
  renderBrowse();
}

function updateMileageRange() {
  const el = document.getElementById('mileageMax');
  const fillEl = document.getElementById('mileageFill');
  if (!el) return;
  const val = parseInt(el.value);
  state.filters.maxMileage = val;
  document.getElementById('mileageMaxVal').textContent = val >= 200000 ? '200K+ mi' : (val / 1000).toFixed(0) + 'K mi';
  if (fillEl) { fillEl.style.left = '0'; fillEl.style.right = (100 - (val / 200000) * 100) + '%'; }
  state.page_num = 1;
  renderBrowse();
}

function addCurrentToCompare() {
  const car = state.selectedCar;
  if (!car) return;
  toggleCompare(car.id);
}

function setView(v) {
  state.view = v;
  document.getElementById('viewGrid').classList.toggle('active', v === 'grid');
  document.getElementById('viewList').classList.toggle('active', v === 'list');
  renderBrowse();
}
