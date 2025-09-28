// wwwroot/js/auth-modal.js

document.addEventListener('DOMContentLoaded', function () {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const showRegisterLink = document.getElementById('showRegister');
        const showLoginLink = document.getElementById('showLogin');
        const modalTitle = document.getElementById('authModalLabel');

        // Function to switch to the register view
        showRegisterLink.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent the link from navigating
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            modalTitle.textContent = 'Create an Account';
        });

        // Function to switch to the login view
        showLoginLink.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent the link from navigating
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            modalTitle.textContent = 'Welcome Back';
        });
        
        // Reset the modal to the default login view when it's closed
        authModal.addEventListener('hidden.bs.modal', function () {
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            modalTitle.textContent = 'Welcome Back';
        });
    }
});