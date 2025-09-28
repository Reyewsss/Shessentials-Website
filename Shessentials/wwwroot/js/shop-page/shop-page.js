// Quick View Modal Functions
let currentQuickViewProduct = null;
let currentQuantity = 1;

function openQuickView(productId, productName, productPrice, productImage, category, description, rating, reviewCount, isBestSeller, isNew) {
    currentQuickViewProduct = {
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
        category: category,
        description: description,
        rating: rating,
        reviewCount: reviewCount,
        isBestSeller: isBestSeller,
        isNew: isNew
    };
    
    currentQuantity = 1;
    
    // Update modal content
    document.getElementById('quickViewImage').src = productImage;
    document.getElementById('quickViewImage').alt = productName;
    document.getElementById('quickViewTitle').textContent = productName;
    document.getElementById('quickViewCategory').textContent = category.charAt(0).toUpperCase() + category.slice(1);
    document.getElementById('quickViewDescription').textContent = description;
    document.getElementById('quickViewPrice').textContent = `₱${productPrice.toFixed(2)}`;
    document.getElementById('quickViewQuantity').textContent = currentQuantity;
    
    // Update badge
    const badgeElement = document.getElementById('quickViewBadge');
    if (isBestSeller) {
        badgeElement.className = 'quick-view-badge';
        badgeElement.style.display = 'block';
    } else if (isNew) {
        badgeElement.textContent = 'New';
        badgeElement.className = 'quick-view-badge new';
        badgeElement.style.display = 'block';
    } else {
        badgeElement.style.display = 'none';
    }
    
    // Update rating stars
    const starsElement = document.getElementById('quickViewStars');
    starsElement.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        if (i <= Math.floor(rating)) {
            star.className = 'bi bi-star-fill';
        } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
            star.className = 'bi bi-star-half';
        } else {
            star.className = 'bi bi-star';
        }
        starsElement.appendChild(star);
    }
    
    document.getElementById('quickViewRatingCount').textContent = `(${reviewCount} reviews)`;
    
    // Show modal
    document.getElementById('quickViewOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeQuickView() {
    document.getElementById('quickViewOverlay').classList.remove('active');
    document.body.style.overflow = '';
    currentQuickViewProduct = null;
    currentQuantity = 1;
}

function increaseQuantity() {
    currentQuantity++;
    document.getElementById('quickViewQuantity').textContent = currentQuantity;
}

function decreaseQuantity() {
    if (currentQuantity > 1) {
        currentQuantity--;
        document.getElementById('quickViewQuantity').textContent = currentQuantity;
    }
}

function addToCartFromQuickView() {
    if (currentQuickViewProduct) {
        addToCart(
            currentQuickViewProduct.id,
            currentQuickViewProduct.name,
            currentQuickViewProduct.price,
            currentQuickViewProduct.image,
            currentQuantity
        );
        closeQuickView();
    }
}

function buyNowFromQuickView() {
    if (currentQuickViewProduct) {
        addToCart(
            currentQuickViewProduct.id,
            currentQuickViewProduct.name,
            currentQuickViewProduct.price,
            currentQuickViewProduct.image,
            currentQuantity
        );
        closeQuickView();
        // Optional: Auto-redirect to checkout
        // proceedToCheckout();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeQuickView();
    }
});

// Update your existing addToCart function to handle quantity
function addToCart(productId, productName, productPrice, productImage, quantity = 1) {
    const existingItem = cart.items.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.items.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: quantity
        });
    }
    
    saveCart();
    updateCartDisplay();
    showAddToCartNotification(productName);
}
