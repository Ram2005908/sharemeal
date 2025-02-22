const webpush = require('web-push');
const twilio = require('twilio');
const User = require('../models/User');

// Initialize Twilio client
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

// Configure web push
webpush.setVapidDetails(
    'mailto:your@email.com', // Replace with your email
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

class NotificationService {
    static async sendPaymentNotification(payment, user) {
        try {
            // Send SMS if phone number exists
            if (user.phone) {
                await this.sendSMS(
                    user.phone,
                    `Your donation of ${payment.currency.toUpperCase()} ${payment.amount} has been processed. Receipt: ${process.env.BASE_URL}/track-donation/${payment.donationId}`
                );
            }

            // Send push notification if subscription exists
            if (user.pushSubscription) {
                await this.sendPushNotification(
                    user.pushSubscription,
                    'Donation Successful',
                    'Your donation has been processed successfully.'
                );
            }
        } catch (error) {
            console.error('Notification error:', error);
        }
    }

    static async sendSMS(to, message) {
        try {
            await twilioClient.messages.create({
                body: message,
                to,
                from: process.env.TWILIO_PHONE_NUMBER
            });
        } catch (error) {
            console.error('SMS error:', error);
        }
    }

    static async sendPushNotification(subscription, title, body) {
        try {
            await webpush.sendNotification(subscription, JSON.stringify({
                title,
                body,
                icon: '/logo.png'
            }));
        } catch (error) {
            console.error('Push notification error:', error);
        }
    }
}

const sendNotification = async (subscription, data) => {
    try {
        await webpush.sendNotification(subscription, JSON.stringify(data));
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

module.exports = {
    NotificationService,
    sendNotification
}; 