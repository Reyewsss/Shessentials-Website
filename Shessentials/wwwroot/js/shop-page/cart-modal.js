let cart = {
    items: [],
    total: 0
};

function loadCart() {
    const savedCart = localStorage.getItem('shessentialsCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartDisplay();
    updateCartCount();
    updateCartDiscountDisplay();
}

function saveCart() {
    localStorage.setItem('shessentialsCart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    let totalItems = 0;
    
    cart.items.forEach(item => {
        totalItems += item.quantity;
    });
    
    const count = totalItems > 0 ? totalItems : '0';
    
    cartCountElements.forEach(element => {
        element.textContent = count;
    });
}

function openCartModal() {
    document.getElementById('cartModal').classList.add('open');
    document.querySelector('.cart-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    document.getElementById('cartModal').classList.remove('open');
    document.querySelector('.cart-overlay').classList.remove('active');
    document.body.style.overflow = '';
}

function proceedToCheckout() {
    saveCart();
    
    const currentPromo = localStorage.getItem('shessentialsCurrentPromo');
    if (currentPromo) {
        localStorage.setItem('shessentialsCheckoutPromo', currentPromo);
    }
    
    window.location.href = '/Shop/Checkout';
}

function addToCart(productId, productName, productPrice, productImage) {
    const existingItem = cart.items.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.items.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartDisplay();
    showAddToCartNotification(productName);
}

function addToCartFromCard(button) {
    const productCard = button.closest('.product-card') || button.closest('.bestseller-card');
    
    if (!productCard) {
        return;
    }
    
    const productId = productCard.getAttribute('data-product-id') || generateUniqueId();
    const productName = productCard.querySelector('h3').textContent;
    
    let productPrice = 0;
    const salePrice = productCard.querySelector('.sale-price');
    const currentPrice = productCard.querySelector('.current-price');
    const productPriceElement = productCard.querySelector('.product-price');
    
    if (salePrice) {
        productPrice = parseFloat(salePrice.textContent.replace('₱', '').replace(',', ''));
    } else if (currentPrice) {
        productPrice = parseFloat(currentPrice.textContent.replace('₱', '').replace(',', ''));
    } else if (productPriceElement) {
        productPrice = parseFloat(productPriceElement.textContent.replace('₱', '').replace(',', ''));
    }
    
    const imgElement = productCard.querySelector('img');
    const productImage = imgElement ? imgElement.src : '';
    
    addToCart(productId, productName, productPrice, productImage);
}

function generateUniqueId() {
    return 'product_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function showAddToCartNotification(productName) {
    let notification = document.getElementById('cart-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'cart-notification';
        notification.className = 'cart-notification';
        document.body.appendChild(notification);
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="bi bi-check-circle-fill notification-icon"></i>
            <div class="notification-text">
                <span class="notification-title">Added to Cart</span>
                <span class="notification-product">${productName}</span>
            </div>
        </div>
    `;
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function updateCartDisplay() {
    const cartBody = document.querySelector('.cart-modal-body');
    if (!cartBody) return;
    
    cartBody.innerHTML = '';
    
    if (cart.items.length === 0) {
        cartBody.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        document.querySelector('.cart-total-price').textContent = '₱0.00';
        return;
    }
    
    cart.items.forEach(item => {
        const cartItemHTML = `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">₱${item.price.toFixed(2)}</span>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span class="quantity-display" data-id="${item.id}">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <div class="cart-item-remove-container">
                    <button class="cart-item-remove" data-id="${item.id}" title="Remove item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        cartBody.innerHTML += cartItemHTML;
    });
    
    updateTotalPrice();
    addCartEventListeners();
}

function updateTotalPrice() {
    let subtotal = 0;
    cart.items.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    const discountAmount = calculatePromoDiscount(subtotal);
    const total = Math.max(0, subtotal - discountAmount);
    
    cart.total = total;
    const totalElement = document.querySelector('.cart-total-price');
    if (totalElement) {
        totalElement.textContent = `₱${total.toFixed(2)}`;
    }
}

function calculatePromoDiscount(subtotal) {
    const currentPromoCode = localStorage.getItem('shessentialsCurrentPromo');
    if (!currentPromoCode) return 0;
    
    const promoDatabase = JSON.parse(localStorage.getItem('shessentialsPromoDatabase') || '{}');
    const promo = promoDatabase[currentPromoCode];
    
    if (!promo) return 0;
    
    if (promo.minPurchase > 0 && subtotal < promo.minPurchase) {
        return 0;
    }
    
    let discountAmount = 0;
    
    if (promo.applicableProducts.includes('all')) {
        if (promo.discountType === 'percentage') {
            discountAmount = subtotal * promo.discountValue;
            if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
                discountAmount = promo.maxDiscount;
            }
        } else if (promo.discountType === 'fixed') {
            discountAmount = Math.min(promo.discountValue, subtotal);
        }
    } else {
        let applicableSubtotal = 0;
        cart.items.forEach(item => {
            const itemName = item.name.toLowerCase();
            if (promo.applicableProducts.some(keyword => itemName.includes(keyword.toLowerCase()))) {
                applicableSubtotal += item.price * item.quantity;
            }
        });
        
        if (applicableSubtotal > 0) {
            if (promo.discountType === 'percentage') {
                discountAmount = applicableSubtotal * promo.discountValue;
                if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
                    discountAmount = promo.maxDiscount;
                }
            } else if (promo.discountType === 'fixed') {
                discountAmount = Math.min(promo.discountValue, applicableSubtotal);
            }
        }
    }
    
    return discountAmount;
}

function addCartEventListeners() {
    const minusButtons = document.querySelectorAll('.quantity-btn.minus');
    const plusButtons = document.querySelectorAll('.quantity-btn.plus');
    const removeButtons = document.querySelectorAll('.cart-item-remove');
    
    minusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const item = cart.items.find(item => item.id === productId);
            
            if (item && item.quantity > 1) {
                item.quantity--;
                saveCart();
                updateCartDisplay();
            }
        });
    });
    
    plusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const item = cart.items.find(item => item.id === productId);
            
            if (item) {
                item.quantity++;
                saveCart();
                updateCartDisplay();
            }
        });
    });
    
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const cartItem = this.closest('.cart-item');
            
            cartItem.style.opacity = '0';
            cartItem.style.transform = 'translateX(100%)';
            cartItem.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                cart.items = cart.items.filter(item => item.id !== productId);
                saveCart();
                updateCartDisplay();
            }, 300);
        });
    });
}

function loadClaimedCoupons() {
    const currentPromo = localStorage.getItem('shessentialsCurrentPromo');
    if (!currentPromo) return [];
    
    const promoDatabase = JSON.parse(localStorage.getItem('shessentialsPromoDatabase') || '{}');
    const promo = promoDatabase[currentPromo];
    
    return promo ? [promo] : [];
}

function updateCartDiscountDisplay() {
    const discountSection = document.querySelector('.cart-modal-discount');
    if (!discountSection) return;
    
    const claimedCoupons = loadClaimedCoupons();
    
    let discountContent = discountSection.querySelector('.cart-modal-discount-content');
    
    if (!discountContent) {
        discountContent = document.createElement('div');
        discountContent.className = 'cart-modal-discount-content';
        discountSection.innerHTML = '';
        discountSection.appendChild(discountContent);
    } else {
        discountContent.innerHTML = '';
    }
    
    const discountLabel = document.createElement('span');
    discountLabel.className = 'cart-modal-discount-label';
    discountLabel.textContent = 'Shop Discount:';
    discountContent.appendChild(discountLabel);
    
    const discountRight = document.createElement('div');
    discountRight.className = 'cart-modal-discount-right';
    discountContent.appendChild(discountRight);
    
    if (claimedCoupons.length > 0) {
        const couponsWithButton = document.createElement('div');
        couponsWithButton.className = 'coupons-with-button';
        
        const couponsContainer = document.createElement('div');
        couponsContainer.className = 'coupons-container';
        
        claimedCoupons.forEach(coupon => {
            const couponElement = createCouponElement(coupon);
            couponsContainer.appendChild(couponElement);
        });
        
        couponsWithButton.appendChild(couponsContainer);
        
        const moreDiscountsButton = document.createElement('button');
        moreDiscountsButton.className = 'cart-modal-discount-btn';
        moreDiscountsButton.textContent = '>';
        moreDiscountsButton.onclick = () => window.location.href = '/Shop/PromoPage';
        
        couponsWithButton.appendChild(moreDiscountsButton);
        discountRight.appendChild(couponsWithButton);
        
    } else {
        const claimButton = document.createElement('button');
        claimButton.className = 'cart-modal-discount-btn';
        claimButton.textContent = '>';
        claimButton.onclick = () => window.location.href = '/Shop/PromoPage';
        
        discountRight.appendChild(claimButton);
    }
}

function createCouponElement(coupon) {
    const couponItem = document.createElement('div');
    couponItem.className = 'coupon-item';
    
    let percentage = '';
    if (coupon.discountType === 'percentage') {
        percentage = (coupon.discountValue * 100) + '%';
    } else {
        percentage = '₱' + coupon.discountValue;
    }
    
    couponItem.innerHTML = `
        <div class="claimed-coupon" title="${coupon.code} - ${coupon.description}">
            <span class="coupon-percentage">${percentage}</span>
        </div>
        <button class="coupon-remove" data-code="${coupon.code}" title="Remove coupon">×</button>
    `;
    
    const removeBtn = couponItem.querySelector('.coupon-remove');
    removeBtn.addEventListener('click', function() {
        removeClaimedCoupon(coupon.code);
    });
    
    return couponItem;
}

function removeClaimedCoupon(code) {
    localStorage.removeItem('shessentialsCurrentPromo');
    updateCartDiscountDisplay();
    updateCartDisplay();
    showAddToCartNotification(`Coupon "${code}" removed`);
}

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    
    const overlay = document.querySelector('.cart-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeCartModal);
    }
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeCartModal();
        }
    });
    
    const addToCartButtons = document.querySelectorAll('.btn-product, .btn-add-to-cart');
    addToCartButtons.forEach(button => {
        if (!button.hasAttribute('onclick')) {
            button.addEventListener('click', function() {
                addToCartFromCard(this);
            });
        }
    });
});