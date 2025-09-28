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

function claimPromoCode(code) {
    try {
        const currentClaimedPromo = localStorage.getItem('shessentialsCurrentPromo');
        
        if (currentClaimedPromo) {
            removeClaimedPromo(currentClaimedPromo);
        }
        
        localStorage.setItem('shessentialsCurrentPromo', code);
        localStorage.setItem('shessentialsPromoDatabase', JSON.stringify(promoDatabase));
        
        updateClaimButtonStates();
        showPromoToast(`"${code}" claimed successfully! Discount will be applied to your cart.`);
        
    } catch (err) {
        showPromoToast('Failed to claim promo code. Please try again.');
    }
}

function removeClaimedPromo(code) {
    localStorage.removeItem('shessentialsCurrentPromo');
}

function showPromoToast(message) {
    const toast = document.getElementById('promoToast');
    const messageElement = document.getElementById('promoToastMessage');
    
    messageElement.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        closePromoNotification();
    }, 3000);
}

function closePromoNotification() {
    const toast = document.getElementById('promoToast');
    toast.classList.remove('show');
}

function updateClaimButtonStates() {
    const currentPromo = localStorage.getItem('shessentialsCurrentPromo');
    const buttons = document.querySelectorAll('.promo-claim-btn');
    
    buttons.forEach(button => {
        const code = button.getAttribute('data-code');
        if (currentPromo === code) {
            button.textContent = 'Claimed!';
            button.disabled = true;
            button.style.backgroundColor = '#28a745';
            button.style.color = 'white';
        } else {
            button.textContent = 'Claim';
            button.disabled = false;
            button.style.backgroundColor = '';
            button.style.color = '';
        }
    });
}

function removeCurrentPromo() {
    const currentPromo = localStorage.getItem('shessentialsCurrentPromo');
    if (currentPromo) {
        removeClaimedPromo(currentPromo);
        updateClaimButtonStates();
        showPromoToast(`Promo "${currentPromo}" removed.`);
    }
}

function openImageModal(imgElement, productTitle, productDescription, promoDetails, howToApply, validity, terms) {
    const modal = document.getElementById('imageModalOverlay');
    const modalImage = document.getElementById('modalImage');
    const modalProductTitle = document.getElementById('modalProductTitle');
    const modalProductDescription = document.getElementById('modalProductDescription');
    const modalPromoDetails = document.getElementById('modalPromoDetails');
    const modalHowToApply = document.getElementById('modalHowToApply');
    const modalValidity = document.getElementById('modalValidity');
    const modalTerms = document.getElementById('modalTerms');
    
    // Set modal content
    modalImage.src = imgElement.src;
    modalImage.alt = imgElement.alt;
    modalProductTitle.textContent = productTitle;
    modalProductDescription.textContent = productDescription;
    modalPromoDetails.textContent = promoDetails;
    modalHowToApply.textContent = howToApply;
    modalValidity.textContent = validity;
    modalTerms.textContent = terms;
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Ensure modal content is scrollable
    setTimeout(() => {
        const modalContent = document.querySelector('.modal-details-content-vertical');
        if (modalContent) {
            modalContent.style.overflowY = 'auto';
            modalContent.style.maxHeight = 'calc(80vh - 300px)'; // Adjust based on image height
        }
    }, 100);
}

function closeImageModal() {
    const modal = document.getElementById('imageModalOverlay');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize promo database and button states
    localStorage.setItem('shessentialsPromoDatabase', JSON.stringify(promoDatabase));
    updateClaimButtonStates();
    
    // Claim button functionality for promo codes
    const claimButtons = document.querySelectorAll('.promo-claim-btn');
    
    claimButtons.forEach(button => {
        button.addEventListener('click', function() {
            const promoCode = this.getAttribute('data-code');
            const productName = this.getAttribute('data-product');
            
            // Copy to clipboard
            navigator.clipboard.writeText(promoCode).then(() => {
                // Show toast notification
                const toast = document.getElementById('promoToast');
                const toastMessage = document.getElementById('promoToastMessage');
                toastMessage.textContent = `${promoCode} copied for ${productName}`;
                toast.classList.add('show');
                
                // Hide toast after 3 seconds
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
                
                // Also claim the promo code for cart functionality
                claimPromoCode(promoCode);
                
            }).catch(err => {
                console.error('Failed to copy: ', err);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = promoCode;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                // Show toast notification
                const toast = document.getElementById('promoToast');
                const toastMessage = document.getElementById('promoToastMessage');
                toastMessage.textContent = `${promoCode} copied for ${productName}`;
                toast.classList.add('show');
                
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
                
                // Also claim the promo code for cart functionality
                claimPromoCode(promoCode);
            });
        });
    });
    
    // Close modal when pressing Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeImageModal();
        }
    });
    
    // Enable touch scrolling for modal content
    const modalContent = document.querySelector('.modal-details-content-vertical');
    if (modalContent) {
        let startY = 0;
        let scrollTop = 0;
        
        modalContent.addEventListener('touchstart', function(e) {
            startY = e.touches[0].pageY;
            scrollTop = this.scrollTop;
        });
        
        modalContent.addEventListener('touchmove', function(e) {
            const y = e.touches[0].pageY;
            const walk = (startY - y) * 2; // Scroll speed
            this.scrollTop = scrollTop + walk;
        });
    }
    
    // Close toast when clicking outside
    document.addEventListener('click', function(event) {
        const toast = document.getElementById('promoToast');
        if (toast.classList.contains('show') && !toast.contains(event.target)) {
            closePromoNotification();
        }
    });
    
    // Add remove promo button if it doesn't exist
    if (!document.getElementById('removePromoBtn')) {
        const removeBtn = document.createElement('button');
        removeBtn.id = 'removePromoBtn';
        removeBtn.className = 'remove-promo-btn';
        removeBtn.textContent = 'Remove Current Promo';
        removeBtn.style.cssText = 'background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin: 10px 0;';
        removeBtn.onclick = removeCurrentPromo;
        
        const promoContainer = document.querySelector('.promo-container') || document.querySelector('.container');
        if (promoContainer) {
            promoContainer.insertBefore(removeBtn, promoContainer.firstChild);
        }
    }
});