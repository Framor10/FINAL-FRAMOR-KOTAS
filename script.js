// Shopping Cart Functionality
let cart = [];
const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const orderModal = document.getElementById('order-modal');
const orderForm = document.getElementById('order-form');
const orderNowBtn = document.getElementById('order-now-btn');
const checkoutBtn = document.getElementById('checkout-btn');
const clearCartBtn = document.getElementById('clear-cart');
const successMessage = document.getElementById('success-message');
const successMessageText = document.getElementById('success-message-text');
const floatingWhatsapp = document.getElementById('floating-whatsapp');
const cartCount = document.querySelector('.cart-count');

// Add to Cart Event Listeners
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        const name = card.querySelector('.product-info h3').textContent;
        const price = parseFloat(card.querySelector('.price').dataset.price);
        const qty = parseInt(card.querySelector('.qty-input').value);
        
        addToCart(name, price, qty);
    });
});

// Quantity Controls
document.querySelectorAll('.qty-increase').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const input = e.target.previousElementSibling;
        input.value = parseInt(input.value) + 1;
    });
});

document.querySelectorAll('.qty-decrease').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const input = e.target.nextElementSibling;
        if (parseInt(input.value) > 1) {
            input.value = parseInt(input.value) - 1;
        }
    });
});

// Add to Cart Function
function addToCart(name, price, quantity) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ name, price, quantity });
    }
    
    updateCartUI();
    showSuccessMessage('Item added to cart!');
}

// Update Cart UI
function updateCartUI() {
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message" style="text-align: center; padding: 40px 20px; color: #777;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                <h3>Your cart is empty</h3>
                <p>Add some delicious items from our menu!</p>
            </div>
        `;
        checkoutBtn.disabled = true;
        cartTotalElement.textContent = 'R0.00';
    } else {
        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-img">
                    <i class="fas fa-utensils"></i>
                </div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">R${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <button class="remove-item" onclick="removeFromCart(${index})" title="Remove">×</button>
            </div>
        `).join('');
        checkoutBtn.disabled = false;
        updateCartTotal();
    }
}

// Update Cart Quantity
function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        updateCartUI();
    }
}

// Remove from Cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// Update Cart Total
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = `R${total.toFixed(2)}`;
    document.getElementById('order-summary-total').textContent = `Total: R${total.toFixed(2)}`;
}

// Cart Modal Controls
cartIcon.addEventListener('click', () => {
    cartModal.classList.add('active');
});

closeCartBtn.addEventListener('click', () => {
    cartModal.classList.remove('active');
});

cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.classList.remove('active');
    }
});

// Clear Cart
clearCartBtn.addEventListener('click', () => {
    cart = [];
    updateCartUI();
});

// Order Now Button
orderNowBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        showSuccessMessage('Please add items to cart first!');
        return;
    }
    cartModal.classList.remove('active');
    orderModal.classList.add('active');
    populateOrderSummary();
});

// Populate Order Summary
function populateOrderSummary() {
    const orderItemsList = document.getElementById('order-items-list');
    orderItemsList.innerHTML = cart.map(item => `
        <div class="order-item">
            <span>${item.name} x${item.quantity}</span>
            <span>R${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    updateCartTotal();
}

// Checkout Button
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        showSuccessMessage('Please add items to cart first!');
        return;
    }
    cartModal.classList.remove('active');
    orderModal.classList.add('active');
    populateOrderSummary();
});

// Order Method Selection
document.querySelectorAll('.order-method').forEach(method => {
    method.addEventListener('click', () => {
        document.querySelectorAll('.order-method').forEach(m => m.classList.remove('active'));
        method.classList.add('active');
    });
});

// Order Form Submission
orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const email = document.getElementById('customer-email').value;
    const address = document.getElementById('customer-address').value;
    const deliveryTime = document.getElementById('delivery-time').value;
    const orderMethod = document.querySelector('.order-method.active').dataset.method;
    
    const orderSummary = cart.map(item => `${item.name} x${item.quantity} - R${(item.price * item.quantity).toFixed(2)}`).join('\n');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const message = `
Order from Framor Kotas:

Customer Name: ${name}
Phone: ${phone}
Email: ${email}
Address: ${address}
Delivery Time: ${deliveryTime}

Items:
${orderSummary}

Total: R${total.toFixed(2)}
    `.trim();
    
    if (orderMethod === 'whatsapp') {
        const whatsappUrl = `https://wa.me/27609050450?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    } else if (orderMethod === 'email') {
        const mailtoUrl = `mailto:morganfrans6@gmail.com?subject=${encodeURIComponent('Framor Kotas Order')}&body=${encodeURIComponent(message)}`;
        window.open(mailtoUrl, '_blank');
    }
    
    // Show success message
    successMessageText.textContent = `Your order has been sent via ${orderMethod === 'whatsapp' ? 'WhatsApp' : 'Email'}.`;
    successMessage.classList.add('show');
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 3000);
    
    // Reset form and close modal
    orderForm.reset();
    orderModal.classList.remove('active');
    cart = [];
    updateCartUI();
});

// Floating WhatsApp Button
floatingWhatsapp.addEventListener('click', () => {
    const message = 'Hi! I\'m interested in ordering from Framor Kotas. Can you tell me more about your menu and delivery options?';
    window.open(`https://wa.me/27609050450?text=${encodeURIComponent(message)}`, '_blank');
});

// Category Navigation
document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Show Success Message
function showSuccessMessage(message) {
    successMessageText.textContent = message;
    successMessage.classList.add('show');
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
});
