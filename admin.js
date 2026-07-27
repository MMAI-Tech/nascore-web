const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'nascore2026';
const PRODUCTS_KEY = 'NAScore_products';
let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || localStorage.getItem('nascore_products') || '[]');
let pendingImage = '';

const byId = id => document.getElementById(id);

byId('loginForm').addEventListener('submit', event => {
  event.preventDefault();
  const username = byId('loginUsername').value.trim();
  const password = byId('loginPassword').value;
  const error = byId('loginError');
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    error.textContent = 'Incorrect username or password.';
    error.classList.remove('hidden');
    return;
  }
  error.classList.add('hidden');
  byId('loginPassword').value = '';
  byId('loginScreen').classList.add('hidden');
  byId('adminPortal').classList.remove('hidden');
  renderProducts();
});

byId('productForm').addEventListener('submit', saveProduct);
byId('productImage').addEventListener('change', readImage);

function togglePassword() {
  const input = byId('loginPassword');
  const visible = input.type === 'password';
  input.type = visible ? 'text' : 'password';
  byId('passwordIcon').className = visible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
}

function logout() {
  byId('adminPortal').classList.add('hidden');
  byId('loginScreen').classList.remove('hidden');
  byId('loginForm').reset();
  closeProductForm();
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
}

function renderProducts() {
  const grid = byId('productGrid');
  const emptyState = byId('emptyState');
  byId('productCount').textContent = `${products.length} product${products.length === 1 ? '' : 's'}`;
  emptyState.classList.toggle('hidden', products.length > 0);
  grid.innerHTML = products.map(product => `
    <article class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div class="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="h-full w-full object-cover">${product.inStock === false ? '<span class="absolute inset-0 grid place-items-center bg-black/55 text-xs font-black uppercase tracking-wider text-white">Out of Stock</span>' : ''}</div>
      <div class="p-4"><div class="mb-3"><p class="text-[10px] font-bold uppercase tracking-wider text-brand-600">${escapeHtml(product.category)}</p><h2 class="truncate font-bold text-gray-900 dark:text-white">${escapeHtml(product.name)}</h2><div class="mt-1 flex items-center gap-2"><span class="font-black text-gray-900 dark:text-white">Rs. ${Number(product.price).toLocaleString()}</span>${product.originalPrice ? `<span class="text-xs text-gray-400 line-through">Rs. ${Number(product.originalPrice).toLocaleString()}</span>` : ''}</div></div><div class="flex gap-2 border-t border-gray-100 pt-3 dark:border-gray-800"><button onclick="editProduct(${Number(product.id)})" class="flex-1 rounded-xl bg-brand-50 px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 dark:bg-gray-800 dark:text-brand-300"><i class="fa-solid fa-pen mr-1"></i>Edit</button><button onclick="deleteProduct(${Number(product.id)})" class="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 dark:bg-red-950/30"><i class="fa-solid fa-trash"></i></button></div></div>
    </article>`).join('');
}

function openProductForm() {
  resetForm();
  byId('formTitle').textContent = 'Add Product';
  byId('saveLabel').textContent = 'Add Product';
  showModal();
}

function closeProductForm() {
  byId('productModal').classList.add('pointer-events-none', 'opacity-0');
}

function showModal() {
  byId('productModal').classList.remove('pointer-events-none', 'opacity-0');
}

function resetForm() {
  byId('productForm').reset();
  byId('productId').value = '';
  pendingImage = '';
  const preview = byId('imagePreview');
  preview.src = '';
  preview.classList.add('hidden');
}

function editProduct(id) {
  const product = products.find(item => Number(item.id) === id);
  if (!product) return;
  resetForm();
  byId('productId').value = product.id;
  byId('productName').value = product.name;
  byId('productPrice').value = product.price;
  byId('productOriginalPrice').value = product.originalPrice || '';
  byId('productCategory').value = product.category;
  byId('productBadge').value = product.badge || '';
  byId('productDescription').value = product.description;
  byId('productInStock').checked = product.inStock !== false;
  const preview = byId('imagePreview');
  preview.src = product.image;
  preview.classList.remove('hidden');
  byId('formTitle').textContent = 'Edit Product';
  byId('saveLabel').textContent = 'Save Changes';
  showModal();
}

function readImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 700 * 1024) {
    alert('Please choose a JPG, PNG, or WebP image smaller than 700 KB.');
    event.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    pendingImage = reader.result;
    const preview = byId('imagePreview');
    preview.src = pendingImage;
    preview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function saveProducts() {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return true;
  } catch {
    alert('Browser storage is full. Use smaller images or remove unused products.');
    return false;
  }
}

function saveProduct(event) {
  event.preventDefault();
  const id = Number(byId('productId').value);
  const oldProduct = id ? products.find(item => Number(item.id) === id) : null;
  const image = pendingImage || oldProduct?.image;
  if (!image) return alert('Please upload a product image.');
  const originalInput = byId('productOriginalPrice').value;
  const product = { id: id || Date.now(), name: byId('productName').value.trim(), price: Number(byId('productPrice').value), originalPrice: originalInput === '' ? null : Number(originalInput), image, category: byId('productCategory').value, badge: byId('productBadge').value.trim(), description: byId('productDescription').value.trim(), inStock: byId('productInStock').checked };
  if (!product.name || !product.description || product.price < 0 || (product.originalPrice !== null && product.originalPrice < 0)) return;
  const previous = products;
  products = id ? products.map(item => Number(item.id) === id ? { ...item, ...product } : item) : [product, ...products];
  if (!saveProducts()) { products = previous; return; }
  renderProducts();
  closeProductForm();
}

function deleteProduct(id) {
  const product = products.find(item => Number(item.id) === id);
  if (!product || !confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
  const previous = products;
  products = products.filter(item => Number(item.id) !== id);
  if (!saveProducts()) { products = previous; return; }
  renderProducts();
}
