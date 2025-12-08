# Meta System User Token Setup

## Overview

For the WhatsApp Embedded Signup flow to work properly, you need to generate a **System User Access Token** from Meta Business Manager. This token allows your application to manage WhatsApp Business Accounts (WABAs) and phone numbers registered through the embedded signup process.

## Why System User Token?

When users complete the WhatsApp Embedded Signup flow:
1. They register their phone number with Meta
2. The popup sends back `phone_number_id` and `waba_id` via postMessage
3. Your backend needs a token to fetch details about these resources
4. **System User Token** provides the necessary permissions to access these resources

## Step-by-Step Setup

### 1. Access Meta Business Manager

Go to [Meta Business Manager](https://business.facebook.com/settings)

### 2. Navigate to System Users

1. Click on **Business Settings** in the left sidebar
2. Under **Users**, click on **System Users**
3. Click **Add** to create a new system user

### 3. Create System User

1. **Name**: `Croozer WhatsApp API` (or any descriptive name)
2. **Role**: Choose **Admin** (required for full access)
3. Click **Create System User**

### 4. Generate Access Token

1. Click on the newly created system user
2. Click **Generate New Token**
3. Select your **Meta App** (App ID: `1284378939762336`)
4. Select the following permissions:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
   - `business_management`
5. **Token Expiration**: Choose **Never** (for production, consider rotating tokens periodically)
6. Click **Generate Token**
7. **Copy the token immediately** - you won't be able to see it again!

### 5. Assign Assets to System User

1. In the system user settings, click **Add Assets**
2. Select **Apps** and choose your Meta App
3. Toggle **Full Control** for the app
4. Click **Save Changes**

### 6. Add Token to Environment Variables

Add the token to your `.env` file:

```env
# Meta System User Token (never expires)
META_SYSTEM_USER_TOKEN=your_system_user_token_here
```

**IMPORTANT**:
- Keep this token secure
- Never commit it to version control
- Rotate it periodically in production
- Use different tokens for development and production

### 7. Verify Token

Test the token with this curl command:

```bash
curl "https://graph.facebook.com/v22.0/me?access_token=YOUR_TOKEN"
```

Expected response:
```json
{
  "name": "Croozer WhatsApp API",
  "id": "SYSTEM_USER_ID"
}
```

## Token Permissions Required

Your system user token needs these permissions:

| Permission | Purpose |
|------------|---------|
| `whatsapp_business_management` | Manage WhatsApp Business Accounts |
| `whatsapp_business_messaging` | Send and receive messages |
| `business_management` | Access business information |

## Security Best Practices

1. **Token Storage**: Store in environment variables, not in code
2. **Encryption**: Consider encrypting the token at rest
3. **Rotation**: Rotate tokens every 90 days in production
4. **Monitoring**: Monitor API usage for suspicious activity
5. **Separate Tokens**: Use different tokens for dev/staging/production

## Troubleshooting

### Error: "System user token not configured"

**Solution**: Add `META_SYSTEM_USER_TOKEN` to your `.env` file

### Error: "Invalid OAuth access token"

**Solution**: Token may have expired or been revoked. Generate a new one.

### Error: "Insufficient permissions"

**Solution**: Ensure the system user has the required permissions listed above

### Error: "Cannot access phone number"

**Solution**:
1. Verify the system user is assigned to your Meta App
2. Check that the app has the correct permissions
3. Ensure the WABA is linked to your Meta App

## Testing

After setup, test the flow:

1. Start dev server: `pnpm dev`
2. Navigate to `/onboarding`
3. Complete step 2 (WhatsApp Setup)
4. Click "חבר וואטסאפ עסקי" (Connect WhatsApp)
5. Complete the embedded signup flow
6. Check console logs for success messages

## Production Considerations

1. **Token Management**: Use a secrets management service (AWS Secrets Manager, HashiCorp Vault)
2. **Token Rotation**: Implement automated token rotation
3. **Multiple Tokens**: Consider using different tokens per environment
4. **Backup Tokens**: Keep backup tokens in case primary is revoked
5. **Monitoring**: Set up alerts for token-related errors

## References

- [Meta System Users Documentation](https://developers.facebook.com/docs/development/build-and-test/app-development#system-users)
- [WhatsApp Business Management API](https://developers.facebook.com/docs/whatsapp/business-management-api/)
- [Access Token Guide](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/)
