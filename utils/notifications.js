const twilio = process.env.TWILIO_ACCOUNT_SID ? require('twilio') : null;
let webpush;
try {
    webpush = require('web-push');
} catch (err) {
    console.log('Web push notifications not available');
    webpush = null;
}
const User = require('../models/User');

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
            // Send SMS if Twilio is configured
            if (twilio && user.phone) {
                await this.sendSMS(
                    user.phone,
                    `Your donation of ${payment.currency} ${payment.amount} has been processed.`
                );
            }

            // Send push notification if configured
            if (webpush && user.pushSubscription) {
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
            if (!twilio) {
                console.log('SMS would be sent:', { to, message });
                return;
            }

            const twilioClient = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );

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
            if (!webpush) {
                console.log('Push notification would be sent:', { title, body });
                return;
            }

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

// Simple notification function that logs instead of sending if services aren't configured
const sendNotification = async (subscription, data) => {
    try {
        if (webpush) {
            await webpush.sendNotification(subscription, JSON.stringify(data));
        } else {
            console.log('Notification would be sent:', data);
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

module.exports = {
    NotificationService,
    sendNotification
}; 