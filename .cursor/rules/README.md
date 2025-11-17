# Cursor Rules - Croozer Project

This directory contains project-specific rules and guidelines for AI-assisted development.

---

## 📚 Available Rules Files

### 1. `whatsapp-api.mdc` - WhatsApp Business API Rules
**Complete guide for WhatsApp integration**

- Environment configuration
- Multi-tenant architecture
- Security guidelines
- API usage patterns
- Error handling
- Code style rules
- Testing guidelines

**When to reference:**
- Working with WhatsApp messaging
- Implementing business onboarding
- Handling customer tokens
- Debugging WhatsApp errors

---

### 2. `quick-reference.md` - Quick Reference Card
**Fast lookup for common tasks**

- Most used commands
- Environment variables
- Phone number formats
- Error codes
- Quick links
- Database connection syntax

**When to reference:**
- Need a quick command
- Forgot phone number format
- Looking up error code
- Need Meta dashboard link
- Database connection issues

---

### 3. `common-issues.md` - Troubleshooting Guide
**Solutions to common problems**

- Database connection errors
- Wrong Phone Number ID
- Webhook verification failed
- Recipient not registered
- 24-hour window expired
- Invalid access token
- Import/export issues
- MongoDB connection issues

**When to reference:**
- Encountering an error
- Debugging issues
- Setup not working
- Need quick fix

---

## 🎯 How to Use These Rules

### For AI Assistants (Claude, etc.)

When working on WhatsApp-related features:

1. **Read** `whatsapp-api.mdc` for comprehensive guidelines
2. **Reference** `quick-reference.md` for quick lookups
3. **Follow** all security and architecture rules
4. **Check** error codes and solutions

### For Developers

1. **Review** rules before implementing WhatsApp features
2. **Follow** code style and security guidelines
3. **Use** quick reference for common tasks
4. **Update** rules when adding new patterns

---

## 📖 Related Documentation

### Project Root
- `WHATSAPP-SETUP-COMPLETE.md` - Setup completion summary
- `META-SETUP-CHECKLIST.md` - Meta platform setup guide
- `IMPLEMENTATION-ROADMAP.md` - Development roadmap
- `scripts/README.md` - Scripts documentation

### Key Concepts

#### Multi-Tenant Architecture
Each business has their own WhatsApp account. Never use system token for customer messages.

#### Token Types
- **System User Token**: Our permanent token (never expires)
- **Business Tokens**: Customer tokens (encrypted in database)

#### Message Types
- **Template Messages**: Can send anytime to anyone
- **Text Messages**: Only within 24h window

---

## 🔐 Security Priorities

1. **NEVER commit `.env` file**
2. **ALWAYS encrypt customer tokens**
3. **NEVER hardcode credentials**
4. **ALWAYS use environment variables**
5. **NEVER mix system and business tokens**

---

## 🚀 Quick Start

```bash
# Send a message
npx tsx scripts/send-message.ts

# Check setup
npx tsx scripts/testing/test-meta-api.ts

# Verify token
npx tsx scripts/testing/check-token-info.ts
```

---

## 📝 Rule Updates

When updating rules:

1. Update the appropriate `.mdc` or `.md` file
2. Add date and reason for update
3. Notify team of changes
4. Test changes in practice

---

## 🎯 Current Status

- ✅ WhatsApp API: Production Ready
- ✅ Phone Number: Verified
- ✅ Token: Permanent
- ✅ Scripts: Organized
- ✅ Documentation: Complete

---

**Last Updated**: November 17, 2025  
**Maintained By**: Croozer Development Team

