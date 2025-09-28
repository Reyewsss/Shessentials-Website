// Cart data structure
let cart = {
    items: [],
    total: 0
};

// Load cart from localStorage if available
function loadCart() {
    const savedCart = localStorage.getItem('shessentialsCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartDisplay();
    updateCartCount();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('shessentialsCart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart count in the header
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    let totalItems = 0;
    
    cart.items.forEach(item => {
        totalItems += item.quantity;
    });
    
    const count = totalItems > 0 ? totalItems : '0';
    
    // Update all cart count elements
    cartCountElements.forEach(element => {
        element.textContent = count;
    });
}

// Modal open/close functions
function openCartModal() {
    document.getElementById('cartModal').classList.add('open');
    document.querySelector('.cart-overlay').classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
}

function closeCartModal() {
    document.getElementById('cartModal').classList.remove('open');
    document.querySelector('.cart-overlay').classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// Function to navigate to checkout
function proceedToCheckout() {
    // Save current cart state
    saveCart();
    
    // Redirect to checkout page
    window.location.href = '/Shop/Checkout'; // Update with your actual checkout URL
}

// Add to cart function with explicit parameters
function addToCart(productId, productName, productPrice, productImage) {
    // Check if product already exists in cart
    const existingItem = cart.items.find(item => item.id === productId);
    
    if (existingItem) {
        // Increment quantity if product already exists
        existingItem.quantity++;
    } else {
        // Add new item to cart
        cart.items.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }
    
    // Save cart to localStorage
    saveCart();
    
    // Update cart display
    updateCartDisplay();
    
    // Show notification instead of opening the cart modal
    showAddToCartNotification(productName);
}

// Add to cart function that extracts data from product card
function addToCartFromCard(button) {
    // Find the parent product card
    const productCard = button.closest('.product-card') || button.closest('.bestseller-card');
    
    if (!productCard) {
        console.error('Product card not found');
        return;
    }
    
    // Extract product information
    const productId = productCard.getAttribute('data-product-id') || generateUniqueId();
    const productName = productCard.querySelector('h3').textContent;
    
    // Find price - handle different price formats
    let productPrice = 0;
    const salePrice = productCard.querySelector('.sale-price');
    const currentPrice = productCard.querySelector('.current-price');
    const productPriceElement = productCard.querySelector('.product-price');
    
    if (salePrice) {
        // Use sale price if available
        productPrice = parseFloat(salePrice.textContent.replace('₱', '').replace(',', ''));
    } else if (currentPrice) {
        // Use current price if available
        productPrice = parseFloat(currentPrice.textContent.replace('₱', '').replace(',', ''));
    } else if (productPriceElement) {
        // Use regular price
        productPrice = parseFloat(productPriceElement.textContent.replace('₱', '').replace(',', ''));
    }
    
    // Find product image
    const imgElement = productCard.querySelector('img');
    const productImage = imgElement ? imgElement.src : '';
    
    // Add to cart
    addToCart(productId, productName, productPrice, productImage);
}

// Generate a unique ID for products without one
function generateUniqueId() {
    return 'product_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

// Show notification when product is added to cart
function showAddToCartNotification(productName) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('cart-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'cart-notification';
        notification.className = 'cart-notification';
        document.body.appendChild(notification);
    }
    
    // Set notification content
    notification.innerHTML = `
        <div class="notification-content">
            <i class="bi bi-check-circle-fill notification-icon"></i>
            <div class="notification-text">
                <span class="notification-title">Added to Cart</span>
                <span class="notification-product">${productName}</span>
            </div>
        </div>
    `;
    
    // Show notification
    notification.classList.add('show');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Update cart display
function updateCartDisplay() {
    const cartBody = document.querySelector('.cart-modal-body');
    if (!cartBody) return; // Cart modal not loaded yet
    
    // Clear current cart display
    cartBody.innerHTML = '';
    
    // Check if cart is empty
    if (cart.items.length === 0) {
        cartBody.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        document.querySelector('.cart-total-price').textContent = '₱0.00';
        return;
    }
    
    // Add each item to cart display
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
    
    // Update total price
    updateTotalPrice();
    
    // Add event listeners to new buttons
    addCartEventListeners();
}

// Update total price
function updateTotalPrice() {
    let total = 0;
    cart.items.forEach(item => {
        total += item.price * item.quantity;
    });
    
    cart.total = total;
    const totalElement = document.querySelector('.cart-total-price');
    if (totalElement) {
        totalElement.textContent = `₱${total.toFixed(2)}`;
    }
}

// Add event listeners to cart buttons
function addCartEventListeners() {
    // Quantity controls functionality
    const minusButtons = document.querySelectorAll('.quantity-btn.minus');
    const plusButtons = document.querySelectorAll('.quantity-btn.plus');
    const removeButtons = document.querySelectorAll('.cart-item-remove');
    
    // Handle minus button clicks
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
    
    // Handle plus button clicks
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
    
    // Handle remove button clicks
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const cartItem = this.closest('.cart-item');
            
            // Add animation for removal
            cartItem.style.opacity = '0';
            cartItem.style.transform = 'translateX(100%)';
            cartItem.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                // Remove item from cart array
                cart.items = cart.items.filter(item => item.id !== productId);
                saveCart();
                updateCartDisplay();
            }, 300);
        });
    });
}

// Initialize cart and add event listeners to all add to cart buttons
document.addEventListener('DOMContentLoaded', function() {
    // Load cart from localStorage
    loadCart();
    updateCartDiscountDisplay();
    
    // Close modal when clicking outside (on overlay)
    const overlay = document.querySelector('.cart-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeCartModal);
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeCartModal();
        }
    });
    
    // Add event listeners to all add to cart buttons that don't have onclick attributes
    const addToCartButtons = document.querySelectorAll('.btn-product, .btn-add-to-cart');
    addToCartButtons.forEach(button => {
        if (!button.hasAttribute('onclick')) {
            button.addEventListener('click', function() {
                addToCartFromCard(this);
            });
        }
    });
});

// Coupon management functions
function loadClaimedCoupons() {
    const claimedPromos = JSON.parse(localStorage.getItem('shessentialsClaimedPromos') || '[]');
    const promoDatabase = JSON.parse(localStorage.getItem('shessentialsPromoDatabase') || '{}');
    
    return claimedPromos.map(code => promoDatabase[code]).filter(Boolean);
}

function updateCartDiscountDisplay() {
    const discountSection = document.querySelector('.cart-modal-discount');
    if (!discountSection) return;
    
    const claimedCoupons = loadClaimedCoupons();
    
    // Clear existing content but keep the structure
    let discountContent = discountSection.querySelector('.cart-modal-discount-content');
    
    if (!discountContent) {
        discountContent = document.createElement('div');
        discountContent.className = 'cart-modal-discount-content';
        discountSection.innerHTML = '';
        discountSection.appendChild(discountContent);
    } else {
        discountContent.innerHTML = '';
    }
    
    // Add the label on the left
    const discountLabel = document.createElement('span');
    discountLabel.className = 'cart-modal-discount-label';
    discountLabel.textContent = 'Shop Discount:';
    discountContent.appendChild(discountLabel);
    
    // Create right container for coupons and button
    const discountRight = document.createElement('div');
    discountRight.className = 'cart-modal-discount-right';
    discountContent.appendChild(discountRight);
    
    if (claimedCoupons.length > 0) {
        // Create container for coupons + button together
        const couponsWithButton = document.createElement('div');
        couponsWithButton.className = 'coupons-with-button';
        
        // Create coupons container
        const couponsContainer = document.createElement('div');
        couponsContainer.className = 'coupons-container';
        
        claimedCoupons.forEach(coupon => {
            const couponElement = createCouponElement(coupon);
            couponsContainer.appendChild(couponElement);
        });
        
        couponsWithButton.appendChild(couponsContainer);
        
        // Add "Get More" button next to coupons
        const moreDiscountsButton = document.createElement('button');
        moreDiscountsButton.className = 'cart-modal-discount-btn';
        moreDiscountsButton.textContent = '>';
        moreDiscountsButton.onclick = () => window.location.href = '/Shop/PromoPage';
        
        couponsWithButton.appendChild(moreDiscountsButton);
        discountRight.appendChild(couponsWithButton);
        
    } else {
        // Show only the "Get Discounts" button when no coupons
        const claimButton = document.createElement('button');
        claimButton.className = 'cart-modal-discount-btn';
        claimButton.textContent = '>';
        claimButton.onclick = () => window.location.href = '/Shop/PromoPage';
        
        discountRight.appendChild(claimButton);
    }
}

function createCouponElement(coupon) {
    // Create container for coupon + remove button
    const couponItem = document.createElement('div');
    couponItem.className = 'coupon-item';
    
    // Determine discount display
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
    
    // Add remove event listener
    const removeBtn = couponItem.querySelector('.coupon-remove');
    removeBtn.addEventListener('click', function() {
        removeClaimedCoupon(coupon.code);
    });
    
    return couponItem;
}

function removeClaimedCoupon(code) {
    const claimedPromos = JSON.parse(localStorage.getItem('shessentialsClaimedPromos') || '[]');
    const updatedPromos = claimedPromos.filter(promoCode => promoCode !== code);
    
    localStorage.setItem('shessentialsClaimedPromos', JSON.stringify(updatedPromos));
    
    // Update the display
    updateCartDiscountDisplay();
    
    // Show notification
    showCouponRemovedNotification(code);
}

function showCouponRemovedNotification(code) {
    // Reuse the existing notification system
    showAddToCartNotification(`Coupon "${code}" removed`);
}

// Update the proceedToCheckout function to include coupon data
function proceedToCheckout() {
    // Save current cart state
    saveCart();
    
    // Also save current claimed coupons for checkout page
    const claimedCoupons = loadClaimedCoupons();
    localStorage.setItem('shessentialsCheckoutCoupons', JSON.stringify(claimedCoupons));
    
    // Redirect to checkout page
    window.location.href = '/Shop/Checkout';
}

// Update the loadCart function to also load coupons
function loadCart() {
    const savedCart = localStorage.getItem('shessentialsCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartDisplay();
    updateCartCount();
    updateCartDiscountDisplay(); // Load coupons too
}