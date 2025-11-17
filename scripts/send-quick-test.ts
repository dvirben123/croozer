#!/usr/bin/env tsx
/**
 * Quick Test Message Send
 */

import 'dotenv/config';

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

async function sendMessage() {
    log('\n📱 Sending WhatsApp Test Message', colors.bright);
    log('═'.repeat(60), colors.blue);

    const PHONE_NUMBER_ID = '831563980046780';
    const ACCESS_TOKEN = process.env.META_SYSTEM_USER_ACCESS_TOKEN;
    const RECIPIENT = '972526581731';
    // const RECIPIENT = '972547070072';

    if (!ACCESS_TOKEN) {
        log('\n❌ ERROR: META_SYSTEM_USER_ACCESS_TOKEN not found', colors.red);
        process.exit(1);
    }

    log('\n📋 Message Details:', colors.blue);
    log(`   From: Phone Number ID ${PHONE_NUMBER_ID}`);
    log(`   To: +${RECIPIENT}`);
    log(`   Template: hello_world`);

    const url = `https://graph.facebook.com/v24.0/${PHONE_NUMBER_ID}/messages`;
    const body = {
        messaging_product: 'whatsapp',
        to: RECIPIENT,
        type: 'template',
        template: {
            name: 'hello_world',
            language: {
                code: 'en_US',
            },
        },
    };

    log('\n🔄 Sending message...', colors.yellow);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            log('\n❌ Message Send Failed', colors.red);
            log('═'.repeat(60), colors.red);

            if (data.error) {
                log(`\nError Code: ${data.error.code}`, colors.red);
                log(`Error Type: ${data.error.type}`, colors.red);
                log(`Message: ${data.error.message}`, colors.red);

                if (data.error.error_data_details) {
                    log(`Details: ${data.error.error_data_details}`, colors.red);
                }

                // Helpful messages
                if (data.error.code === 131026) {
                    log('\n⚠️  Solution:', colors.yellow);
                    log('   1. Go to: https://developers.facebook.com/apps/1284378939762336/whatsapp-business/wa-dev-console/', colors.yellow);
                    log('   2. Find "Send and receive messages" section', colors.yellow);
                    log('   3. Click "Add phone number"', colors.yellow);
                    log(`   4. Add: +972526581731`, colors.yellow);
                    log('   5. Verify with the code sent to WhatsApp', colors.yellow);
                } else if (data.error.code === 131047) {
                    log('\n⚠️  24-hour window expired:', colors.yellow);
                    log('   Template messages can be sent anytime (which we\'re doing)', colors.yellow);
                    log('   Regular text messages need user to message you first', colors.yellow);
                }
            }

            log('\n📄 Full Response:', colors.yellow);
            console.log(JSON.stringify(data, null, 2));
            process.exit(1);
        }

        // Success!
        log('\n✅ Message Sent Successfully!', colors.green);
        log('═'.repeat(60), colors.green);

        log('\n📱 Message Details:', colors.blue);
        if (data.messages && data.messages[0]) {
            log(`   Message ID: ${data.messages[0].id}`, colors.green);
            log(`   Message Status: ${data.messages[0].message_status || 'sent'}`, colors.green);
        }
        log(`   Recipient: +972526581731`, colors.green);
        log(`   Template: hello_world`, colors.green);

        log('\n📄 Full API Response:', colors.yellow);
        console.log(JSON.stringify(data, null, 2));

        log('\n🎉 Success!', colors.bright);
        log('   Check WhatsApp on +972526581731 to see the message!', colors.green);
        log('   The message should arrive within a few seconds.', colors.green);

    } catch (error: any) {
        log('\n❌ Request Failed', colors.red);
        log('═'.repeat(60), colors.red);
        log(`\nError: ${error.message}`, colors.red);
        process.exit(1);
    }
}

sendMessage().catch((error) => {
    log(`\n❌ Unexpected Error: ${error.message}`, colors.red);
    process.exit(1);
});

