const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const processPayment = async (donation) => {
    try {
        // Create a payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(donation.amount * 100), // Convert to cents
            currency: 'inr',
            payment_method_types: ['card'],
            metadata: {
                donationId: donation._id.toString(),
                donorId: donation.donor.toString(),
                donationType: donation.type
            },
            description: `Donation for ${donation.type}`,
            statement_descriptor: 'SHAREMEAL DONATION'
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        };
    } catch (error) {
        console.error('Payment processing error:', error);
        throw new Error('Payment processing failed: ' + error.message);
    }
};

module.exports = {
    processPayment
}; 