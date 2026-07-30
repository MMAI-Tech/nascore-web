// ============================================================
// SUPABASE SETUP — apna Project URL aur anon public key yahan daalein
// Supabase Dashboard -> Settings -> API me se milegi
// ============================================================
const SUPABASE_URL = 'https://oymcltdgbdukjciywmwk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pyuFGgwQABWhyPM1W5fztw_Tn76NRvv';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PRODUCTS_BUCKET = 'products'; // storage bucket ka naam

let products = [];
let pendingImageFile = null; // ab base64 nahi, seedha File object rakhte hain (upload ke liye)

const byId = id => document.getElementById(id);

// -------- DB row (snake_case) ko app ke format (camelCase) me convert karna --------
function rowToProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    originalPrice: row.original_price !== null && row.original_price !== undefined ? Number(row.original_price) : null,
    image: row.image_url,
    badge: row.badge,
    description: row.description,
    inStock: row.in_stock,
    hasSizes: row.has_sizes
  };
}

// -------- Login (Supabase Auth: email + password) --------
byId('loginForm').addEventListener('submit', async event => {
  event.preventDefault();
  const email = byId('loginUsername').value.trim();
  const password = byId('loginPassword').value;
  const error = byId('loginError');

  error.classList.add('hidden');
  const { error: authError } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (authError) {
    error.textContent = 'Incorrect email or password.';
    error.classList.remove('hidden');
    return;
  }

  byId('loginPassword').value = '';
  await enterPortal();
});

async function enterPortal() {
  byId('loginScreen').classList.add('hidden');
  byId('adminPortal').classList.remove('hidden');
  await loadProducts();
}

// Agar admin pehle se logged in he (session yaad rehti he), to seedha portal dikhao
(async function restoreSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) await enterPortal();
})();

byId('productForm').addEventListener('submit', saveProduct);
byId('productImage').addEventListener('change', readImage);

function togglePassword() {
  const input = byId('loginPassword');
  const visible = input.type === 'password';
  input.type = visible ? 'text' : 'password';
  byId('passwordIcon').className = visible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
}

async function logout() {
  await supabaseClient.auth.signOut();
  byId('adminPortal').classList.add('hidden');
  byId('loginScreen').classList.remove('hidden');
  byId('loginForm').reset();
  closeProductForm();
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
}

// -------- Products load karna (Supabase se, sab logged-in admins ke liye common data) --------
async function loadProducts() {
  const { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
  if (error) {
    alert('Products load karne me masla aaya: ' + error.message);
    return;
  }
  products = (data || []).map(rowToProduct);
  renderProducts();
}

function renderProducts() {
  const grid = byId('productGrid');
  const emptyState = byId('emptyState');
  byId('productCount').textContent = `${products.length} product${products.length === 1 ? '' : 's'}`;
  emptyState.classList.toggle('hidden', products.length > 0);
  grid.innerHTML = products.map(product => `
    <article class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:rounded-2xl">
      <div class="relative aspect-square bg-gray-100 dark:bg-gray-800 sm:aspect-[4/3]"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="h-full w-full object-cover">${product.inStock === false ? '<span class="absolute inset-0 grid place-items-center bg-black/55 px-1 text-center text-[9px] font-black uppercase tracking-wider text-white sm:text-xs">Out of Stock</span>' : ''}</div>
      <div class="p-2.5 sm:p-4"><div class="mb-2 sm:mb-3"><p class="text-[9px] font-bold uppercase tracking-wider text-brand-600 sm:text-[10px]">${escapeHtml(product.category)}</p><h2 class="truncate text-xs font-bold text-gray-900 dark:text-white sm:text-base">${escapeHtml(product.name)}</h2><div class="mt-1 flex flex-wrap items-center gap-1 sm:gap-2"><span class="text-xs font-black text-gray-900 dark:text-white sm:text-base">Rs. ${Number(product.price).toLocaleString()}</span>${product.originalPrice ? `<span class="text-[10px] text-gray-500 dark:text-gray-400 line-through sm:text-xs">Rs. ${Number(product.originalPrice).toLocaleString()}</span>` : ''}</div><p class="mt-1 hidden text-[10px] font-semibold text-gray-500 dark:text-gray-400 sm:block"><i class="fa-solid fa-ruler-combined mr-1"></i>${product.hasSizes === false ? 'No sizes' : 'Sizes available'}</p></div><div class="flex gap-1.5 border-t border-gray-100 pt-2 dark:border-gray-800 sm:gap-2 sm:pt-3"><button onclick="editProduct(${Number(product.id)})" class="flex-1 rounded-lg bg-brand-50 px-2 py-2 text-[10px] font-bold text-brand-700 hover:bg-brand-100 dark:bg-gray-800 dark:text-brand-300 sm:rounded-xl sm:px-3 sm:text-xs"><i class="fa-solid fa-pen sm:mr-1"></i><span class="hidden sm:inline">Edit</span></button><button onclick="deleteProduct(${Number(product.id)})" class="rounded-lg bg-red-50 px-2 py-2 text-[10px] font-bold text-red-600 hover:bg-red-100 dark:bg-red-950/30 sm:rounded-xl sm:px-3 sm:text-xs"><i class="fa-solid fa-trash"></i></button></div></div>
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
  pendingImageFile = null;
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
  byId('productHasSizes').checked = product.hasSizes !== false;
  const preview = byId('imagePreview');
  preview.src = product.image;
  preview.classList.remove('hidden');
  byId('formTitle').textContent = 'Edit Product';
  byId('saveLabel').textContent = 'Save Changes';
  showModal();
}

// -------- Image select hone par sirf preview dikhate hain, actual upload save ke waqt hoga --------
function readImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 700 * 1024) {
    alert('Please choose a JPG, PNG, or WebP image smaller than 700 KB.');
    event.target.value = '';
    return;
  }
  pendingImageFile = file;
  const reader = new FileReader();
  reader.onload = () => {
    const preview = byId('imagePreview');
    preview.src = reader.result;
    preview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

// -------- Supabase Storage ke 'products' bucket me image upload karna --------
async function uploadImage(file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabaseClient.storage.from(PRODUCTS_BUCKET).upload(path, file);
  if (error) throw error;
  const { data } = supabaseClient.storage.from(PRODUCTS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function saveProduct(event) {
  event.preventDefault();
  const saveLabel = byId('saveLabel');
  const originalLabel = saveLabel.textContent;
  saveLabel.textContent = 'Saving...';

  try {
    const id = Number(byId('productId').value) || null;
    const oldProduct = id ? products.find(item => Number(item.id) === id) : null;

    let imageUrl = oldProduct ? oldProduct.image : null;
    if (pendingImageFile) {
      imageUrl = await uploadImage(pendingImageFile);
    }
    if (!imageUrl) {
      alert('Please upload a product image.');
      return;
    }

    const originalInput = byId('productOriginalPrice').value;
    const row = {
      name: byId('productName').value.trim(),
      price: Number(byId('productPrice').value),
      original_price: originalInput === '' ? null : Number(originalInput),
      image_url: imageUrl,
      category: byId('productCategory').value,
      badge: byId('productBadge').value.trim(),
      description: byId('productDescription').value.trim(),
      in_stock: byId('productInStock').checked,
      has_sizes: byId('productHasSizes').checked
    };

    if (!row.name || !row.description || row.price < 0 || (row.original_price !== null && row.original_price < 0)) return;

    let error;
    if (id) {
      ({ error } = await supabaseClient.from('products').update(row).eq('id', id));
    } else {
      ({ error } = await supabaseClient.from('products').insert(row));
    }

    if (error) {
      alert('Product save nahi ho saka: ' + error.message);
      return;
    }

    await loadProducts();
    closeProductForm();
  } catch (err) {
    alert('Image upload me masla aaya: ' + err.message);
  } finally {
    saveLabel.textContent = originalLabel;
  }
}

async function deleteProduct(id) {
  const product = products.find(item => Number(item.id) === id);
  if (!product || !confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
  const { error } = await supabaseClient.from('products').delete().eq('id', id);
  if (error) {
    alert('Delete nahi ho saka: ' + error.message);
    return;
  }
  await loadProducts();
}
