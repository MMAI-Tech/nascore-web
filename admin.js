const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'nascore2026';
const PRODUCTS_KEY = 'NAScore_products';
let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || localStorage.getItem('nascore_products') || '[]');
products = products.map(product => ({ ...product, inStock: product.inStock !== false, hasSizes: product.hasSizes !== false }));
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
    <article class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:rounded-2xl">
      <div class="relative aspect-square bg-gray-100 dark:bg-gray-800 sm:aspect-[4/3]"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="h-full w-full object-cover">${product.inStock === false ? '<span class="absolute inset-0 grid place-items-center bg-black/55 px-1 text-center text-[9px] font-black uppercase tracking-wider text-white sm:text-xs">Out of Stock</span>' : ''}</div>
      <div class="p-2.5 sm:p-4"><div class="mb-2 sm:mb-3"><p class="text-[9px] font-bold uppercase tracking-wider text-brand-600 sm:text-[10px]">${escapeHtml(product.category)}</p><h2 class="truncate text-xs font-bold text-gray-900 dark:text-white sm:text-base">${escapeHtml(product.name)}</h2><div class="mt-1 flex flex-wrap items-center gap-1 sm:gap-2"><span class="text-xs font-black text-gray-900 dark:text-white sm:text-base">Rs. ${Number(product.price).toLocaleString()}</span>${product.originalPrice ? `<span class="text-[10px] text-gray-400 line-through sm:text-xs">Rs. ${Number(product.originalPrice).toLocaleString()}</span>` : ''}</div><p class="mt-1 hidden text-[10px] font-semibold text-gray-400 sm:block"><i class="fa-solid fa-ruler-combined mr-1"></i>${product.hasSizes === false ? 'No sizes' : 'Sizes available'}</p></div><div class="flex gap-1.5 border-t border-gray-100 pt-2 dark:border-gray-800 sm:gap-2 sm:pt-3"><button onclick="editProduct(${Number(product.id)})" class="flex-1 rounded-lg bg-brand-50 px-2 py-2 text-[10px] font-bold text-brand-700 hover:bg-brand-100 dark:bg-gray-800 dark:text-brand-300 sm:rounded-xl sm:px-3 sm:text-xs"><i class="fa-solid fa-pen sm:mr-1"></i><span class="hidden sm:inline">Edit</span></button><button onclick="deleteProduct(${Number(product.id)})" class="rounded-lg bg-red-50 px-2 py-2 text-[10px] font-bold text-red-600 hover:bg-red-100 dark:bg-red-950/30 sm:rounded-xl sm:px-3 sm:text-xs"><i class="fa-solid fa-trash"></i></button></div></div>
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
  byId('productPrice').value = product.price;he
  byId('productOriginalPrice').value = product.originalPrice || '';
  byId('productCategory').value = product.category;
  byId('productBadge').value = product.badge || '';
  byId('productDescription').value = product.description;
  byId('productInStock').checked = product.inStock !== false;
  byId('productHasSizes').checked = product.hasSizes !== false;
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
  const product = { id: id || Date.now(), name: byId('productName').value.trim(), price: Number(byId('productPrice').value), originalPrice: originalInput === '' ? null : Number(originalInput), image, category: byId('productCategory').value, badge: byId('productBadge').value.trim(), description: byId('productDescription').value.trim(), inStock: byId('productInStock').checked, hasSizes: byId('productHasSizes').checked };
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
