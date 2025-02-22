// Initialize Stripe with your public key
const stripe = Stripe('pk_test_51QvKDpCA9KL8PRgKIU3JdbUjxYEt0YcE13Ac8ojbrTXV2dFwR1eDjMW7horWQUsbC5H1LPc3XivLsteSCHwgzKg700PeAgqC6F');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Stripe initialized');
    // Create an instance of the card Element
    const elements = stripe.elements();
    const card = elements.create('card');

    // Add an instance of the card Element into the `card-element` div
    card.mount('#card-element');
    console.log('Card element mounted');

    // Handle form submission
    const form = document.getElementById('donationForm');
    const errorElement = document.getElementById('card-errors');

    // Add this at the start of your DOMContentLoaded event handler
    const paymentMethodSelect = document.querySelector('select[name="paymentMethod"]');
    const cardElement = document.querySelector('#card-element').parentElement;

    paymentMethodSelect.addEventListener('change', (e) => {
        if (e.target.value === 'stripe') {
            cardElement.style.display = 'block';
        } else {
            cardElement.style.display = 'none';
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Form submitted');

        // Disable the submit button to prevent double clicks
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: card,
            });
            console.log('Payment method created:', paymentMethod);

            if (error) {
                console.error('Stripe error:', error);
                errorElement.textContent = error.message;
                submitButton.disabled = false;
                return;
            }

            // Get form data
            const formData = new FormData(form);
            const amount = formData.get('amount');

            // Send to your server
            const response = await fetch('/api/donations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    type: 'money',
                    amount: parseFloat(amount),
                    paymentMethodId: paymentMethod.id,
                    description: formData.get('description')
                })
            });

            const result = await response.json();

            if (result.error) {
                console.error('Server error:', result.error);
                errorElement.textContent = result.error;
                submitButton.disabled = false;
            } else {
                // Handle successful payment
                console.log('Payment successful');
                window.location.href = '/payment-success.html';
            }
        } catch (err) {
            console.error('Payment processing error:', err);
            errorElement.textContent = 'An error occurred processing your payment. Please try again.';
            submitButton.disabled = false;
        }
    });
}); 