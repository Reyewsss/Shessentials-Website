document.addEventListener('DOMContentLoaded', function() {
    loadCheckoutCart();
    setupEventListeners();
});

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
    }
};

function loadCheckoutCart() {
    try {
        const savedCart = localStorage.getItem('shessentialsCart');
        const cart = savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
        
        const currentPromo = localStorage.getItem('shessentialsCurrentPromo') || 
                            localStorage.getItem('shessentialsCheckoutPromo');
        
        const cartItemsContainer = document.getElementById('checkoutCartItems');
        const emptyCartMessage = document.getElementById('emptyCartMessage');
        
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
        
        if (currentPromo) {
            applyClaimedPromo(currentPromo, cart);
        } else {
            updateCheckoutTotals(cart);
        }
        
    } catch (error) {
        showError('Error loading cart items. Please try refreshing the page.');
    }
}

function applyClaimedPromo(promoCode, cart) {
    const promoDatabase = JSON.parse(localStorage.getItem('shessentialsPromoDatabase') || '{}');
    const promo = promoDatabase[promoCode];
    
    if (!promo) return;
    
    const promoCodeInput = document.getElementById('promoCodeInput');
    if (promoCodeInput) {
        promoCodeInput.value = promoCode;
    }
    
    applyPromoCode();
}

function updateCheckoutTotals(cart, discountAmount = 0) {
    try {
        let subtotal = 0;
        cart.items.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        
        const taxRate = 0;
        const taxAmount = subtotal * taxRate;
        
        const shippingCost = subtotal > 500 ? 0 : 50;
        
        const grandTotal = Math.max(0, subtotal + taxAmount + shippingCost - discountAmount);
        
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
    
    removePromoCode();
    
    if (!promoCode) {
        showError('Please enter a promo code.');
        return;
    }
    
    const promo = promoDatabase[promoCode];
    
    if (!promo) {
        showError(`Invalid promo code "${promoCode}".`);
        return;
    }
    
    const savedCart = localStorage.getItem('shessentialsCart');
    const cart = savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
    
    if (cart.items.length === 0) {
        showError('Your cart is empty. Add items before applying promo codes.');
        return;
    }
    
    const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    if (promo.minPurchase > 0 && subtotal < promo.minPurchase) {
        showError(`Promo code requires minimum purchase of ₱${promo.minPurchase}.`);
        return;
    }
    
    let discountAmount = 0;
    let applicableItems = [];
    
    if (promo.applicableProducts.includes('all')) {
        applicableItems = cart.items;
    } else {
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
    
    if (promo.discountType === 'percentage') {
        const applicableTotal = applicableItems.reduce((total, item) => 
            total + (item.price * item.quantity), 0
        );
        discountAmount = applicableTotal * promo.discountValue;
        
        if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
            discountAmount = promo.maxDiscount;
        }
    } else if (promo.discountType === 'fixed') {
        discountAmount = Math.min(promo.discountValue, 
            applicableItems.reduce((total, item) => total + (item.price * item.quantity), 0)
        );
    }
    
    applyDiscountToItems(applicableItems, promo, discountAmount);
    
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
    
    if (discountLine) discountLine.style.display = 'flex';
    if (appliedPromo) appliedPromo.style.display = 'flex';
    
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
                const applicableTotal = applicableItems.reduce((total, i) => 
                    total + (i.price * i.quantity), 0
                );
                const itemRatio = originalPrice / applicableTotal;
                itemDiscount = totalDiscount * itemRatio;
            }
            
            const discountedPrice = originalPrice - itemDiscount;
            
            const priceElement = itemElement.querySelector('.shess-checkout-item-price');
            if (priceElement) {
                priceElement.innerHTML = `
                    <span class="original-price" style="text-decoration: line-through; color: #999;">₱${originalPrice.toFixed(2)}</span>
                    <span class="discounted-price text-success">₱${discountedPrice.toFixed(2)}</span>
                `;
            }
            
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
    
    const savedCart = localStorage.getItem('shessentialsCart');
    const cart = savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
    
    document.querySelectorAll('.shess-checkout-cart-item').forEach(item => {
        const priceElement = item.querySelector('.shess-checkout-item-price');
        const itemId = item.getAttribute('data-product-id');
        const cartItem = cart.items.find(i => i.id === itemId);
        
        if (cartItem && priceElement) {
            const originalPrice = cartItem.price * cartItem.quantity;
            priceElement.innerHTML = `<span class="discounted-price">₱${originalPrice.toFixed(2)}</span>`;
            
            const promoIndicator = item.querySelector(`#promo-applied-${itemId}`);
            if (promoIndicator) promoIndicator.style.display = 'none';
        }
    });
    
    updateCheckoutTotals(cart);
}

function setupEventListeners() {
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
    
    const promoInput = document.getElementById('promoCodeInput');
    if (promoInput) {
        promoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyPromoCode();
            }
        });
        
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
    
    document.querySelectorAll('.shess-error-message').forEach(msg => msg.remove());
    
    const promoSection = document.querySelector('.shess-checkout-promo-section');
    if (promoSection) {
        promoSection.parentNode.insertBefore(errorDiv, promoSection);
    }
    
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'shess-success-message';
    successDiv.style.cssText = 'background: #efe; color: #363; padding: 10px; margin: 10px 0; border-radius: 4px; border: 1px solid #cfc;';
    successDiv.innerHTML = `<i class="bi bi-check-circle"></i> ${message}`;
    
    document.querySelectorAll('.shess-success-message').forEach(msg => msg.remove());
    
    const promoSection = document.querySelector('.shess-checkout-promo-section');
    if (promoSection) {
        promoSection.parentNode.insertBefore(successDiv, promoSection);
    }
    
    setTimeout(() => successDiv.remove(), 5000);
}

function placeOrder() {
    const savedCart = localStorage.getItem('shessentialsCart');
    const cart = savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
    
    if (cart.items.length === 0) {
        alert('Your cart is empty. Please add items before placing an order.');
        return;
    }
    
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
    
    alert('Order placed successfully! Thank you for your purchase.');
    
    localStorage.removeItem('shessentialsCart');
    
    window.location.href = '/';
}