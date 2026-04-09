const normalizeIndianPhone = (phone) => {
    if (!phone) return null;
    const raw = String(phone).trim();
    const digits = raw.replace(/\D/g, '');

    // Accept +<countrycode><number> and sanitize separators/spaces.
    if (raw.startsWith('+')) {
        const e164 = `+${raw.slice(1).replace(/\D/g, '')}`;
        return /^\+[1-9]\d{7,14}$/.test(e164) ? e164 : null;
    }

    // Common Indian formats entered by users.
    if (digits.length === 10) {
        return `+91${digits}`;
    }

    if (digits.length === 11 && digits.startsWith('0')) {
        return `+91${digits.slice(1)}`;
    }

    if (digits.length === 12 && digits.startsWith('91')) {
        return `+${digits}`;
    }

    if (digits.length === 13 && digits.startsWith('091')) {
        return `+91${digits.slice(3)}`;
    }

    return null;
};

const toWhatsAppDigits = (phone) => {
    const normalized = normalizeIndianPhone(phone);
    if (!normalized) return null;
    return normalized.replace(/\D/g, '');
};

const getTwilioClient = () => {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
        return null;
    }

    try {
        const twilio = require('twilio');
        return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    } catch (error) {
        console.error('Twilio package missing. Install with: npm install twilio');
        return null;
    }
};

const sendGuardianApprovalSms = async ({ guardianPhone, studentName, decisionLink, approveLink, rejectLink }) => {
    const normalizedTo = normalizeIndianPhone(guardianPhone);
    if (!normalizedTo) {
        return {
            sent: false,
            reason: 'Invalid guardian phone number format'
        };
    }

    const messageText = decisionLink
        ? `College outpass request for ${studentName}. Open this link and choose Approve or Reject: ${decisionLink}`
        : [
            `College outpass request for ${studentName}.`,
            `Approve: ${approveLink}`,
            `Reject: ${rejectLink}`
        ].join(' ');

    const provider = (process.env.GUARDIAN_MESSAGE_PROVIDER || 'whatsapp-link').toLowerCase();

    if (provider === 'whatsapp-link') {
        const waDigits = toWhatsAppDigits(guardianPhone);
        if (!waDigits) {
            return {
                sent: false,
                reason: 'Invalid guardian phone number format for WhatsApp'
            };
        }

        const shareUrl = `https://wa.me/${waDigits}?text=${encodeURIComponent(messageText)}`;
        return {
            sent: true,
            provider: 'whatsapp-link',
            to: waDigits,
            shareUrl,
            previewMessage: messageText,
            requiresManualShare: true
        };
    }

    const twilioClient = getTwilioClient();
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioClient || !fromPhone) {
        return {
            sent: false,
            reason: 'Message provider not configured',
            previewMessage: messageText,
            normalizedTo
        };
    }

    try {
        const sms = await twilioClient.messages.create({
            from: fromPhone,
            to: normalizedTo,
            body: messageText
        });

        return {
            sent: true,
            provider: 'twilio',
            messageSid: sms.sid,
            to: normalizedTo
        };
    } catch (error) {
        return {
            sent: false,
            reason: error.message,
            normalizedTo,
            previewMessage: messageText
        };
    }
};

module.exports = {
    sendGuardianApprovalSms,
    normalizeIndianPhone
};