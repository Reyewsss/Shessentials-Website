// Responsive Navbar JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        // Toggle menu on click
        navbarToggler.addEventListener('click', function() {
            navbar.classList.toggle('mobile-menu-active');
            navbarCollapse.classList.toggle('show');
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.mobile-nav-content .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('mobile-menu-active');
                navbarCollapse.classList.remove('show');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navbar.contains(event.target)) {
                navbar.classList.remove('mobile-menu-active');
                navbarCollapse.classList.remove('show');
            }
        });
    }
});