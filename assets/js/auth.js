document.addEventListener('DOMContentLoaded', function() {
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    // Form validation
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            if (!form.checkValidity()) {
                event.stopPropagation();
                form.classList.add('was-validated');
                return;
            }

            // Get form data
            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                rememberMe: document.getElementById('rememberMe').checked
            };

            // Here you would typically make an API call to your backend
            console.log('Login attempt:', formData);
            
            // Simulate API call
            simulateLogin(formData);
        });
    }
});

function simulateLogin(formData) {
    // Show loading state
    const submitButton = document.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Signing in...';
    submitButton.disabled = true;

    // Simulate API delay
    setTimeout(() => {
        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;

        // Redirect to dashboard (in real app, this would happen after successful API response)
        window.location.href = 'user-dashboard.html';
    }, 1500);
}

// Handle errors
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const form = document.getElementById('loginForm');
    form.parentNode.insertBefore(errorDiv, form);
} 