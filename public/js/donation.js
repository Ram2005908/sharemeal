// Initialize Stripe with your public key
const stripe = Stripe('pk_test_51QvKDpCA9KL8PRgKIU3JdbUjxYEt0YcE13Ac8ojbrTXV2dFwR1eDjMW7horWQUsbC5H1LPc3XivLsteSCHwgzKg700PeAgqC6F');

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('donationForm');
    const foodForm = document.getElementById('foodForm');
    const moneyForm = document.getElementById('moneyForm');
    const paymentQR = document.querySelector('.payment-qr');
    const amountInput = document.querySelector('input[name="amount"]');

    // Toggle between food and money donation forms
    document.querySelectorAll('input[name="type"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'food') {
                foodForm.style.display = 'block';
                moneyForm.style.display = 'none';
                paymentQR.style.display = 'none';
            } else {
                foodForm.style.display = 'none';
                moneyForm.style.display = 'block';
            }
        });
    });

    // Show QR code when amount is entered
    amountInput.addEventListener('input', () => {
        if (amountInput.value > 0) {
            paymentQR.style.display = 'block';
        } else {
            paymentQR.style.display = 'none';
        }
    });

    // Handle form submission
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const donationType = formData.get('type');

        try {
            const response = await fetch('/api/donations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    type: donationType,
                    amount: donationType === 'money' ? parseFloat(formData.get('amount')) : null,
                    description: formData.get('description'),
                    // Add other form fields as needed
                })
            });

            const result = await response.json();

            if (result.error) {
                alert(result.error);
            } else {
                // Redirect to success page
                window.location.href = '/payment-success.html';
            }
        } catch (err) {
            console.error('Error:', err);
            alert('An error occurred. Please try again.');
        }
    });
}); 