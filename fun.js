// Sample Product List (Category Based)
const products = [
  {
    id: 1,
    name: "Classic Casual Shirt",
    price: 1850,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80",
    description: "High quality breathable cotton shirt perfect for summer occasions and casual events."
  },
  {
    id: 2,
    name: "Slim Fit Denim Jacket",
    price: 3499,
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=500&q=80",
    description: "Durable blue denim jacket crafted with premium stitching and timeless style."
  },
  {
    id: 3,
    name: "Urban Street Hoodie",
    price: 2600,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=500&q=80",
    description: "Cozy fleece-lined hoodie featuring a modern streetwear aesthetic."
  },
  {
    id: 4,
    name: "Minimalist Polo Tee",
    price: 1200,
    image: "https://images.unsplash.com/photo-1625910513413-3fc3333e8fdd?auto=format&fit=crop&w=500&q=80",
    description: "Soft polo t-shirt available in versatile neutral tones."
  }
];

// WhatsApp Number Setup (Country code + number without plus sign)
const SELLER_WHATSAPP = "923001234567"; // CHANGE THIS NUMBER

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Render Products on Page Load
function renderProducts() {
  const container = document.getElementById('productGrid');
  container.innerHTML = products.map(product => `
    <div class="product-card bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between">
      <div class="cursor-pointer" onclick="openModal(${product.id})">
        <div class="overflow-hidden rounded-xl mb-3 aspect-square bg-gray-100">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover hover:scale-110 transition duration-500">
        </div>
        <h3 class="font-bold text-gray-800 text-lg line-clamp-1">${product.name}</h3>
        <p class="text-sm text-gray-500 line-clamp-2 mt-1">${product.description}</p>
        <p class="text-indigo-600 font-extrabold text-xl mt-2">Rs. ${product.price}</p>
      </div>
      <button onclick="addToCart(${product.id})" class="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 active:scale-95">
        <i class="fa-solid fa-plus"></i> Add to Cart
      </button>
    </div>
  `).join('');
}

// Product Modal Handling
function openModal(productId) {
  const product = products.find(p => p.id === productId);
  if(!product) return;

  const modalContent = document.getElementById('modalContent');
  modalContent.innerHTML = `
    <div class="overflow-hidden rounded-xl aspect-square mb-4 bg-gray-100">
      <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
    </div>
    <h2 class="text-2xl font-bold text-gray-900 mb-2">${product.name}</h2>
    <p class="text-gray-600 text-sm mb-4 leading-relaxed">${product.description}</p>
    <div class="flex items-center justify-between mt-6">
      <span class="text-2xl font-extrabold text-indigo-600">Rs. ${product.price}</span>
      <button onclick="addToCart(${product.id}); closeModal();" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl transition shadow-md active:scale-95">
        Add to Cart
      </button>
    </div>
  `;

  const modal = document.getElementById('productModal');
  const container = document.getElementById('modalContainer');
  modal.classList.remove('opacity-0', 'pointer-events-none');
  container.classList.remove('scale-95');
  container.classList.add('scale-100');
}

function closeModal() {
  const modal = document.getElementById('productModal');
  const container = document.getElementById('modalContainer');
  container.classList.remove('scale-100');
  container.classList.add('scale-95');
  modal.classList.add('opacity-0', 'pointer-events-none');
}

// Cart Toggle logic
function toggleCart() {
  const drawer = document.getElementById('cartDrawer');
  const container = document.getElementById('drawerContainer');
  
  if (drawer.classList.contains('pointer-events-none')) {
    drawer.classList.remove('opacity-0', 'pointer-events-none');
    container.classList.remove('translate-x-full');
  } else {
    container.classList.add('translate-x-full');
    drawer.classList.add('opacity-0', 'pointer-events-none');
  }
}

// Add Item to Cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCart();
}

// Update Cart Storage & Display UI
function updateCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Total Items Count
  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  document.getElementById('cartCount').innerText = totalCount;

  // Render Items
  const cartContainer = document.getElementById('cartItems');
  if (cart.length === 0) {
    cartContainer.innerHTML = `<p class="text-center text-gray-400 py-10">Your cart is empty.</p>`;
  } else {
    cartContainer.innerHTML = cart.map(item => `
      <div class="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
        <div class="flex items-center gap-3">
          <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded-lg">
          <div>
            <h4 class="font-bold text-gray-800 text-sm line-clamp-1">${item.name}</h4>
            <p class="text-xs text-gray-500">Rs. ${item.price} x ${item.quantity}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="changeQuantity(${item.id}, -1)" class="w-6 h-6 rounded bg-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-300">-</button>
          <span class="text-sm font-bold">${item.quantity}</span>
          <button onclick="changeQuantity(${item.id}, 1)" class="w-6 h-6 rounded bg-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-300">+</button>
        </div>
      </div>
    `).join('');
  }

  // Calculate Total Amount
  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  document.getElementById('cartTotal').innerText = `Rs. ${totalAmount}`;
}

function changeQuantity(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  updateCart();
}

// WhatsApp Order Integration
function checkoutWhatsApp() {
  if (cart.length === 0) {
    alert("Please add items to your cart first!");
    return;
  }

  let textMessage = `*New Order from NAScore!*%0A%0A`;
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    textMessage += `${index + 1}. *${item.name}*%0A   Qty: ${item.quantity} x Rs. ${item.price} = Rs. ${itemTotal}%0A`;
  });

  textMessage += `%0A*Total Amount:* Rs. ${total}%0A%0A*Please confirm my order.*`;

  const whatsappUrl = `https://wa.me/${SELLER_WHATSAPP}?text=${textMessage}`;
  window.open(whatsappUrl, '_blank');
}

// Initial Setup Call
renderProducts();
updateCart();