import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "better-auth/adapters/mongodb"

const MONGODB_URI = process.env.MONGODB_URI || ''

// Lazy-load MongoDB client to avoid build-time errors
let clientInstance: MongoClient | null = null;
function getMongoClient() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env')
  }
  if (!clientInstance) {
    clientInstance = new MongoClient(MONGODB_URI)
  }
  return clientInstance;
}

function getDb() {
  return getMongoClient().db();
}

export const auth = betterAuth({
  database: mongodbAdapter(getDb()),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  socialProviders: {
    facebook: {
      clientId: process.env.FACEBOOK_APP_ID || "",
      clientSecret: process.env.FACEBOOK_APP_SECRET || "",
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
      plan: {
        type: "string",
        defaultValue: "free",
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
})
