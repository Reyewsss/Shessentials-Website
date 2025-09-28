// Checkout cart functionality with enhanced promo support
document.addEventListener('DOMContentLoaded', function() {
    loadCheckoutCart();
    setupEventListeners();
});

// Promo code database
const promoDatabase = {
    'WELCOME25': {
        code: 'WELCOME25',
        description: '25% Off Entire Order',
        discountType: 'percentage',
        discountValue: 0.25,
        applicableProducts: ['all'],
        minPurchase: 0,
        maxDiscount: 1000
    },
    'AKOSITULBA': {
        code: 'AKOSITULBA',
        description: '45% Off Body Scrub',
        discountType: 'percentage',
        discountValue: 0.45,
        applicableProducts: ['body scrub', 'scrub'],
        minPurchase: 0,
        maxDiscount: 1000
    },
    'CARLOSYULO': {
        code: 'CARLOSYULO',
        description: '₱55.00 Off Glow All Day Bundle',
        discountType: 'fixed',
        discountValue: 55,
        applicableProducts: ['glow all day', 'bundle'],
        minPurchase: 0,
        maxDiscount: 55
    },
    'EMILOU20': {
        code: 'EMILOU20',
        description: '20% Off Matte Lipstick',
        discountType: 'percentage',
        discountValue: 0.20,
        applicableProducts: ['matte lipstick', 'lipstick'],
        minPurchase: 0,
        maxDiscount: 500
    },
    'SAWAKASTAPOSNA': {
        code: 'SAWAKASTAPOSNA',
        description: '50% Off Cream Concealer',
        discountType: 'percentage',
        discountValue: 0.50,
        applicableProducts: ['cream concealer', 'concealer'],
        minPurchase: 0,
        maxDiscount: 300
    },
    'WELCOMES': {
        code: 'WELCOMES',
        description: '15% Off Entire Order',
        discountType: 'percentage',
        discountValue: 0.15,
        applicableProducts: ['all'],
        minPurchase: 0,
        maxDiscount: 500
    }
};

function loadCheckoutCart() {
    try {
        // Load cart from localStorage
        const savedCart = localStorage.getItem('shessentialsCart');
        const cart = savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
        
        const cartItemsContainer = document.getElementById('checkoutCartItems');
        const emptyCartMessage = document.getElementById('emptyCartMessage');
        
        // Clear existing dynamic content
        const existingItems = cartItemsContainer.querySelectorAll('.shess-checkout-cart-item');
        existingItems.forEach(item => {
            if (!item.classList.contains('static-item')) {
                item.remove();
            }
        });
        
        if (cart.items.length === 0) {
            emptyCartMessage.style.display = 'block';
            updateCheckoutTotals(cart);
            disableCheckout();
            return;
        }
        
        emptyCartMessage.style.display = 'none';
        enableCheckout();
        
        // Add each cart item to checkout display
        cart.items.forEach(item => {
            const cartItemHTML = `
                <div class="shess-checkout-cart-item" data-product-id="${item.id}" data-product-name="${item.name.toLowerCase()}">
                    <div class="shess-checkout-item-image">
                        ${item.image ? 
                            `<img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                             <i class="bi bi-bag" style="display: none;"></i>` : 
                            `<i class="bi bi-bag"></i>`
                        }
                    </div>
                    <div class="shess-checkout-item-details">
                        <h4 class="shess-checkout-item-name">${item.name}</h4>
                        <p class="shess-checkout-item-description">₱${item.price.toFixed(2)} each</p>
                        <div class="shess-checkout-item-quantity">Qty: ${item.quantity}</div>
                        <div class="promo-applied" id="promo-applied-${item.id}" style="display: none;">
                            <small class="text-success">Promo applied!</small>
                        </div>
                    </div>
                    <div class="shess-checkout-item-price">
                        <span class="original-price" style="text-decoration: line-through; color: #999; display: none;">₱${(item.price * item.quantity).toFixed(2)}</span>
                        <span class="discounted-price">₱${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                </div>
            `;
            
            cartItemsContainer.insertAdjacentHTML('afterbegin', cartItemHTML);
        });
        
        updateCheckoutTotals(cart);
        
    } catch (error) {
        console.error('Error loading checkout cart:', error);
        showError('Error loading cart items. Please try refreshing the page.');
    }
}

function updateCheckoutTotals(cart, discountAmount = 0) {
    try {
        // Calculate subtotal
        let subtotal = 0;
        cart.items.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        
        // Calculate tax (assuming 0% tax rate for Philippines)
        const taxRate = 0;
        const taxAmount = subtotal * taxRate;
        
        // Calculate shipping (free over ₱500, otherwise ₱50)
        const shippingCost = subtotal > 500 ? 0 : 50;
        
        // Calculate grand total with discount
        const grandTotal = Math.max(0, subtotal + taxAmount + shippingCost - discountAmount);
        
        // Update DOM elements
        document.getElementById('subtotal').textContent = `₱${subtotal.toFixed(2)}`;
        document.getElementById('taxAmount').textContent = `₱${taxAmount.toFixed(2)}`;
        document.getElementById('shippingCost').textContent = shippingCost === 0 ? 'Free' : `₱${shippingCost.toFixed(2)}`;
        document.getElementById('grandTotal').textContent = `₱${grandTotal.toFixed(2)}`;
        
    } catch (error) {
        console.error('Error updating totals:', error);
    }
}

function applyPromoCode() {
    const promoCodeInput = document.getElementById('promoCodeInput');
    const promoCode = promoCodeInput.value.trim().toUpperCase();
    const appliedPromo = document.getElementById('appliedPromo');
    const discountLine = document.getElementById('discountLine');
    const discountAmountElement = document.getElementById('discountAmount');
    
    // Clear previous promo
    removePromoCode();
    
    if (!promoCode) {
        showError('Please enter a promo code.');
        return;
    }
    
    const promo = promoDatabase[promoCode];
    
    // Check if promo exists
    if (!promo) {
        showError(`Invalid promo code "${promoCode}".`);
        return;
    }
    
    // Load current cart
    const savedCart = localStorage.getItem('shessentialsCart');
    const cart = savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
    
    if (cart.items.length === 0) {
        showError('Your cart is empty. Add items before applying promo codes.');
        return;
    }
    
    // Check minimum purchase requirement
    const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    if (promo.minPurchase > 0 && subtotal < promo.minPurchase) {
        showError(`Promo code requires minimum purchase of ₱${promo.minPurchase}.`);
        return;
    }
    
    // Calculate discount based on promo type and applicable products
    let discountAmount = 0;
    let applicableItems = [];
    
    if (promo.applicableProducts.includes('all')) {
        // Apply to all items
        applicableItems = cart.items;
    } else {
        // Apply to specific products based on name matching
        applicableItems = cart.items.filter(item => {
            const itemName = item.name.toLowerCase();
            return promo.applicableProducts.some(keyword => 
                itemName.includes(keyword.toLowerCase())
            );
        });
    }
    
    if (applicableItems.length === 0) {
        showError(`Promo code "${promoCode}" is not applicable to any items in your cart.`);
        return;
    }
    
    // Calculate discount
    if (promo.discountType === 'percentage') {
        // Calculate total for applicable items
        const applicableTotal = applicableItems.reduce((total, item) => 
            total + (item.price * item.quantity), 0
        );
        discountAmount = applicableTotal * promo.discountValue;
        
        // Apply max discount limit
        if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
            discountAmount = promo.maxDiscount;
        }
    } else if (promo.discountType === 'fixed') {
        discountAmount = Math.min(promo.discountValue, 
            applicableItems.reduce((total, item) => total + (item.price * item.quantity), 0)
        );
    }
    
    // Apply discount to individual items for display
    applyDiscountToItems(applicableItems, promo, discountAmount);
    
    // Update displayed discount
    const promoCodeElement = document.querySelector('.shess-checkout-promo-code');
    const promoDiscountElement = document.querySelector('.shess-checkout-promo-discount');
    
    if (promoCodeElement) promoCodeElement.textContent = promoCode;
    if (promoDiscountElement) {
        promoDiscountElement.textContent = 
            promo.discountType === 'percentage' ? `-${(promo.discountValue * 100)}%` : `-₱${promo.discountValue}`;
    }
    
    if (discountAmountElement) {
        discountAmountElement.textContent = `-₱${discountAmount.toFixed(2)}`;
    }
    
    // Show discount line
    if (discountLine) discountLine.style.display = 'flex';
    if (appliedPromo) appliedPromo.style.display = 'flex';
    
    // Update totals with discount
    updateCheckoutTotals(cart, discountAmount);
    
    showSuccess(`Promo code "${promoCode}" applied successfully! Saved ₱${discountAmount.toFixed(2)}`);
}

function applyDiscountToItems(applicableItems, promo, totalDiscount) {
    applicableItems.forEach(item => {
        const itemElement = document.querySelector(`[data-product-id="${item.id}"]`);
        if (itemElement) {
            const originalPrice = item.price * item.quantity;
            let itemDiscount = 0;
            
            if (promo.discountType === 'percentage') {
                itemDiscount = originalPrice * promo.discountValue;
            } else {
                // Distribute fixed discount proportionally
                const applicableTotal = applicableItems.reduce((total, i) => 
                    total + (i.price * i.quantity), 0
                );
                const itemRatio = originalPrice / applicableTotal;
                itemDiscount = totalDiscount * itemRatio;
            }
            
            const discountedPrice = originalPrice - itemDiscount;
            
            // Update display
            const priceElement = itemElement.querySelector('.shess-checkout-item-price');
            if (priceElement) {
                priceElement.innerHTML = `
                    <span class="original-price" style="text-decoration: line-through; color: #999;">₱${originalPrice.toFixed(2)}</span>
                    <span class="discounted-price text-success">₱${discountedPrice.toFixed(2)}</span>
                `;
            }
            
            // Show promo applied indicator
            const promoIndicator = itemElement.querySelector(`#promo-applied-${item.id}`);
            if (promoIndicator) promoIndicator.style.display = 'block';
        }
    });
}

function removePromoCode() {
    const appliedPromo = document.getElementById('appliedPromo');
    const discountLine = document.getElementById('discountLine');
    
    if (appliedPromo) appliedPromo.style.display = 'none';
    if (discountLine) discountLine.style.display = 'none';
    
    // Reload cart without discounts
    const savedCart = localStorage.getItem('shessentialsCart');
    const cart = savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
    
    // Reset item prices
    document.querySelectorAll('.shess-checkout-cart-item').forEach(item => {
        const priceElement = item.querySelector('.shess-checkout-item-price');
        const itemId = item.getAttribute('data-product-id');
        const cartItem = cart.items.find(i => i.id === itemId);
        
        if (cartItem && priceElement) {
            const originalPrice = cartItem.price * cartItem.quantity;
            priceElement.innerHTML = `<span class="discounted-price">₱${originalPrice.toFixed(2)}</span>`;
            
            // Hide promo indicator
            const promoIndicator = item.querySelector(`#promo-applied-${itemId}`);
            if (promoIndicator) promoIndicator.style.display = 'none';
        }
    });
    
    updateCheckoutTotals(cart);
}

function setupEventListeners() {
    // Form validation
    document.querySelectorAll('.shess-form-control').forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                this.classList.remove('error');
            }
        });
    });
    
    // Promo code input
    const promoInput = document.getElementById('promoCodeInput');
    if (promoInput) {
        promoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyPromoCode();
            }
        });
        
        // Auto-uppercase promo codes
        promoInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
    }
}

function validateField(field) {
    if (field.hasAttribute('required') && field.value.trim() === '') {
        field.classList.add('error');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && field.value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            field.classList.add('error');
            return false;
        }
    }
    
    field.classList.remove('error');
    return true;
}

function disableCheckout() {
    const placeOrderBtn = document.querySelector('.shess-place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Cart is Empty';
        placeOrderBtn.style.opacity = '0.6';
    }
}

function enableCheckout() {
    const placeOrderBtn = document.querySelector('.shess-place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = '<i class="bi bi-lock"></i> Place Order Securely';
        placeOrderBtn.style.opacity = '1';
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'shess-error-message';
    errorDiv.style.cssText = 'background: #fee; color: #c33; padding: 10px; margin: 10px 0; border-radius: 4px; border: 1px solid #fcc;';
    errorDiv.innerHTML = `<i class="bi bi-exclamation-triangle"></i> ${message}`;
    
    // Remove existing error messages
    document.querySelectorAll('.shess-error-message').forEach(msg => msg.remove());
    
    // Insert before promo section
    const promoSection = document.querySelector('.shess-checkout-promo-section');
    if (promoSection) {
        promoSection.parentNode.insertBefore(errorDiv, promoSection);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'shess-success-message';
    successDiv.style.cssText = 'background: #efe; color: #363; padding: 10px; margin: 10px 0; border-radius: 4px; border: 1px solid #cfc;';
    successDiv.innerHTML = `<i class="bi bi-check-circle"></i> ${message}`;
    
    // Remove existing success messages
    document.querySelectorAll('.shess-success-message').forEach(msg => msg.remove());
    
    // Insert before promo section
    const promoSection = document.querySelector('.shess-checkout-promo-section');
    if (promoSection) {
        promoSection.parentNode.insertBefore(successDiv, promoSection);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => successDiv.remove(), 5000);
}

function placeOrder() {
    const savedCart = localStorage.getItem('shessentialsCart');
    const cart = savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
    
    if (cart.items.length === 0) {
        alert('Your cart is empty. Please add items before placing an order.');
        return;
    }
    
    // Validate required fields
    const requiredFields = document.querySelectorAll('.shess-form-control[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
            field.classList.add('error');
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields correctly.');
        return;
    }
    
    // For demo purposes - show success message and clear cart
    alert('Order placed successfully! Thank you for your purchase.');
    
    // Clear cart after successful order
    localStorage.removeItem('shessentialsCart');
    
    // Redirect to home page
    window.location.href = '/';
}