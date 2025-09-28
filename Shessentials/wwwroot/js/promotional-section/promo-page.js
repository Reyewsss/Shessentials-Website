// Promo code database with enhanced data
const promoDatabase = {
    'AKOSITULBA': {
        code: 'AKOSITULBA',
        description: '45% Off Body Scrub',
        discountType: 'percentage',
        discountValue: 0.45,
        applicableProducts: ['body scrub', 'scrub'],
        minPurchase: 0,
        maxDiscount: 1000,
        displayPercentage: '45%'
    },
    'CARLOSYULO': {
        code: 'CARLOSYULO',
        description: '₱55.00 Off Glow All Day Bundle',
        discountType: 'fixed',
        discountValue: 55,
        applicableProducts: ['glow all day', 'bundle'],
        minPurchase: 0,
        maxDiscount: 55,
        displayPercentage: '₱55'
    },
    'EMILOU20': {
        code: 'EMILOU20',
        description: '20% Off Matte Lipstick',
        discountType: 'percentage',
        discountValue: 0.20,
        applicableProducts: ['matte lipstick', 'lipstick'],
        minPurchase: 0,
        maxDiscount: 500,
        displayPercentage: '20%'
    },
    'SAWAKASTAPOSNA': {
        code: 'SAWAKASTAPOSNA',
        description: '50% Off Cream Concealer',
        discountType: 'percentage',
        discountValue: 0.50,
        applicableProducts: ['cream concealer', 'concealer'],
        minPurchase: 0,
        maxDiscount: 300,
        displayPercentage: '50%'
    },
    'WELCOME25': {
        code: 'WELCOME25',
        description: '25% Off Entire Order',
        discountType: 'percentage',
        discountValue: 0.25,
        applicableProducts: ['all'],
        minPurchase: 0,
        maxDiscount: 1000,
        displayPercentage: '25%'
    }
};

// Updated claim promo code function with persistent storage
async function claimPromoCode(code, productName) {
    try {
        // Copy to clipboard
        await navigator.clipboard.writeText(code);
        
        // Save promo code to localStorage for persistent storage
        const claimedPromos = JSON.parse(localStorage.getItem('shessentialsClaimedPromos') || '[]');
        if (!claimedPromos.includes(code)) {
            claimedPromos.push(code);
            localStorage.setItem('shessentialsClaimedPromos', JSON.stringify(claimedPromos));
        }
        
        // Save promo database to localStorage (this is needed for checkout functionality)
        localStorage.setItem('shessentialsPromoDatabase', JSON.stringify(promoDatabase));
        
        // Show success message
        showPromoToast(`"${code}" copied to clipboard! Use it at checkout for ${productName}.`);
        
        // Update button state permanently
        const button = event.target;
        button.textContent = 'Claimed!';
        button.disabled = true;
        button.style.backgroundColor = '#28a745';
        
    } catch (err) {
        console.error('Failed to copy promo code: ', err);
        showPromoToast('Failed to copy promo code. Please copy manually: ' + code);
    }
}

// Show toast notification
function showPromoToast(message) {
    const toast = document.getElementById('promoToast');
    const messageElement = document.getElementById('promoToastMessage');
    
    messageElement.textContent = message;
    toast.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        closePromoNotification();
    }, 5000);
}

// Close notification manually
function closePromoNotification() {
    const toast = document.getElementById('promoToast');
    toast.classList.remove('show');
}

// Update button states based on claimed coupons
function updateClaimButtonStates() {
    const claimedPromos = JSON.parse(localStorage.getItem('shessentialsClaimedPromos') || '[]');
    const buttons = document.querySelectorAll('.promo-claim-btn');
    
    buttons.forEach(button => {
        const code = button.getAttribute('data-code');
        if (claimedPromos.includes(code)) {
            button.textContent = 'Claimed!';
            button.disabled = true;
            button.style.backgroundColor = '#28a745';
        } else {
            button.textContent = 'Claim';
            button.disabled = false;
            button.style.backgroundColor = '';
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Save promo database to localStorage (ensure it's always available)
    localStorage.setItem('shessentialsPromoDatabase', JSON.stringify(promoDatabase));
    
    // Update button states based on existing claims
    updateClaimButtonStates();
    
    // Add click event listeners to all buttons
    const buttons = document.querySelectorAll('.promo-claim-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(event) {
            const code = this.getAttribute('data-code');
            const product = this.getAttribute('data-product');
            claimPromoCode.call(this, code, product, event);
        });
    });
    
    // Add event listener for Enter key on buttons
    buttons.forEach(button => {
        button.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const code = this.getAttribute('data-code');
                const product = this.getAttribute('data-product');
                claimPromoCode.call(this, code, product, e);
            }
        });
    });
    
    // Close notification when clicking outside
    document.addEventListener('click', function(event) {
        const toast = document.getElementById('promoToast');
        if (toast.classList.contains('show') && !toast.contains(event.target)) {
            closePromoNotification();
        }
    });
});

// Force reset all buttons (for testing)
function resetAllClaimButtons() {
    const buttons = document.querySelectorAll('.promo-claim-btn');
    buttons.forEach(button => {
        button.textContent = 'Claim';
        button.disabled = false;
        button.style.backgroundColor = '';
    });
    localStorage.removeItem('shessentialsClaimedPromos');
    console.log('All claim buttons reset');
}

// Make function available globally for testing
window.resetAllClaimButtons = resetAllClaimButtons;