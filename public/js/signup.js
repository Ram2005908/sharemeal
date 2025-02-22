document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const errorDiv = document.getElementById('error-message');
    
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const submitButton = signupForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = 'Signing up...';
            
            const formData = {
                name: signupForm.name.value,
                email: signupForm.email.value,
                password: signupForm.password.value,
                phone: signupForm.phone.value,
                address: {
                    street: signupForm.street.value,
                    city: signupForm.city.value,
                    state: signupForm.state.value,
                    pincode: signupForm.pincode.value
                }
            };

            console.log('Sending signup data:', formData);

            const response = await fetch('http://localhost:3000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                showMessage('Signup successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = '/user-dashboard.html';
                }, 1500);
            } else {
                throw new Error(data.message || 'Signup failed');
            }

        } catch (error) {
            console.error('Signup error:', error);
            showMessage(error.message || 'An error occurred during signup', 'error');
            
            const submitButton = signupForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.innerHTML = 'Sign Up';
        }
    });

    function showMessage(message, type) {
        errorDiv.textContent = message;
        errorDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
        errorDiv.style.display = 'block';
    }
}); 