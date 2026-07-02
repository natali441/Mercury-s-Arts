const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const overlay = document.getElementById('sidebar-overlay');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const menuToggle = document.getElementById('menu-toggle');
const siteNav = document.getElementById('site-nav');

let cart = [];

try {
    const savedCart = localStorage.getItem('mercurys_cart');
    cart = savedCart ? JSON.parse(savedCart) : [];
} catch (error) {
    console.warn('Could not load cart from localStorage:', error);
    cart = [];
}

function toggleCart(forceOpen) {
    if (cartSidebar && overlay) {
        const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !cartSidebar.classList.contains('open');
        cartSidebar.classList.toggle('open', shouldOpen);
        overlay.classList.toggle('open', shouldOpen);
    }
}

if (cartBtn) cartBtn.addEventListener('click', () => toggleCart());
if (closeCartBtn) closeCartBtn.addEventListener('click', () => toggleCart(false));
if (overlay) overlay.addEventListener('click', () => toggleCart(false));

function toggleMenu(forceOpen) {
    if (menuToggle && siteNav) {
        const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !siteNav.classList.contains('open');
        siteNav.classList.toggle('open', shouldOpen);
        menuToggle.classList.toggle('active', shouldOpen);
        menuToggle.setAttribute('aria-expanded', shouldOpen.toString());
    }
}

if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => toggleMenu());
    siteNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });
}

const cookiePopup = document.getElementById('cookie-popup');
if (cookiePopup) {
    const cookieButtons = cookiePopup.querySelectorAll('.cookie-btn');
    cookieButtons.forEach(button => {
        button.addEventListener('click', () => {
            cookiePopup.style.display = 'none';
        });
    });
}

function addItemToCart(id, name, price) {
    const existingItem = cart.find(item => String(item.id) === String(id));

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }

    updateCartUI();
    toggleCart(true);
}

function removeItemFromCart(id) {
    cart = cart.filter(item => String(item.id) !== String(id));
    updateCartUI();
}

function updateCartUI() {
    try {
        localStorage.setItem('mercurys_cart', JSON.stringify(cart));
    } catch (error) {
        console.warn('Could not save cart to localStorage:', error);
    }

    if (!cartItemsContainer) {
        if (cartCount) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.innerText = totalItems;
        }
        return;
    }

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is currently empty.</p>';
        if (cartCount) cartCount.innerText = '0';
        if (cartTotal) cartTotal.innerText = '0.00 ₾';
        return;
    }

    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        totalItems += item.quantity;
        totalPrice += Number(item.price) * item.quantity;

        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>₾${Number(item.price).toFixed(2)} x ${item.quantity}</p>
            </div>
            <i class="fas fa-trash remove-item" data-id="${item.id}"></i>
        `;

        itemElement.querySelector('.remove-item').addEventListener('click', () => {
            removeItemFromCart(item.id);
        });

        cartItemsContainer.appendChild(itemElement);
    });

    if (cartCount) cartCount.innerText = totalItems;
    if (cartTotal) cartTotal.innerText = `₾${totalPrice.toFixed(2)}`;
}

function initCart() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));

            if (!id || Number.isNaN(price)) {
                return;
            }

            addItemToCart(id, name, price);
        });
    });

    updateCartUI();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
} else {
    initCart();
}