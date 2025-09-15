import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Facebook App Secret - in production, this should be in environment variables
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || "";

interface DeauthorizationData {
    user_id: string;
    algorithm: string;
    issued_at: number;
}

/**
 * Parse and verify Facebook signed request
 * @param signedRequest - The signed request from Facebook
 * @returns Parsed data or null if invalid
 */
function parseSignedRequest(signedRequest: string): DeauthorizationData | null {
    if (!FACEBOOK_APP_SECRET) {
        console.error("Facebook App Secret not configured");
        return null;
    }

    try {
        const [encodedSig, payload] = signedRequest.split(".");

        // Decode the signature
        const sig = Buffer.from(encodedSig.replace(/-/g, "+").replace(/_/g, "/"), "base64");

        // Decode the payload
        const data = JSON.parse(
            Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
        );

        // Verify signature
        const expectedSig = crypto
            .createHmac("sha256", FACEBOOK_APP_SECRET)
            .update(payload)
            .digest();

        if (!crypto.timingSafeEqual(sig, expectedSig)) {
            console.error("Invalid signature in signed request");
            return null;
        }

        return data;
    } catch (error) {
        console.error("Error parsing signed request:", error);
        return null;
    }
}

/**
 * Handle user data deletion
 * @param userId - Facebook user ID to delete
 * @returns Promise resolving to deletion confirmation URL
 */
async function deleteUserData(userId: string): Promise<string> {
    try {
        // In a real implementation, you would:
        // 1. Delete user data from your database
        // 2. Remove any stored tokens or session data
        // 3. Clean up any user-generated content
        // 4. Log the deletion for compliance

        console.log(`Deleting data for user: ${userId}`);

        // Mock database deletion
        // await db.users.delete({ facebookId: userId });
        // await db.sessions.delete({ userId: userId });
        // await db.userContent.delete({ userId: userId });

        // Generate a unique confirmation code for this deletion
        const confirmationCode = crypto.randomBytes(16).toString("hex");

        // In production, store this confirmation code with timestamp
        // await db.deletionConfirmations.create({
        //   userId,
        //   confirmationCode,
        //   deletedAt: new Date()
        // });

        console.log(`User data deleted successfully for ${userId}, confirmation: ${confirmationCode}`);

        // Return the status URL that Facebook will use to check deletion status
        return `https://croozer.co.il/api/facebook-deauth/status?code=${confirmationCode}`;

    } catch (error) {
        console.error("Error deleting user data:", error);
        throw error;
    }
}

/**
 * POST /api/facebook-deauth
 * Handle Facebook deauthorization callback
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.formData();
        const signedRequest = body.get("signed_request") as string;

        if (!signedRequest) {
            return NextResponse.json(
                { error: "Missing signed_request parameter" },
                { status: 400 }
            );
        }

        // Parse and verify the signed request
        const data = parseSignedRequest(signedRequest);

        if (!data) {
            return NextResponse.json(
                { error: "Invalid signed request" },
                { status: 400 }
            );
        }

        // Delete user data
        const confirmationUrl = await deleteUserData(data.user_id);

        // Return the confirmation URL to Facebook
        return NextResponse.json({
            url: confirmationUrl,
            confirmation_code: crypto.randomBytes(16).toString("hex")
        });

    } catch (error) {
        console.error("Deauthorization callback error:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/facebook-deauth
 * Handle user-facing deauthorization page
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const signedRequest = searchParams.get("signed_request");

    if (!signedRequest) {
        // Redirect to a user-friendly page
        return NextResponse.redirect(new URL("/facebook-deauth", request.url));
    }

    // Parse the signed request to get user info
    const data = parseSignedRequest(signedRequest);

    if (!data) {
        return NextResponse.redirect(
            new URL("/facebook-deauth?error=invalid_request", request.url)
        );
    }

    // Redirect to the user-facing deauthorization page with the signed request
    return NextResponse.redirect(
        new URL(`/facebook-deauth?signed_request=${encodeURIComponent(signedRequest)}`, request.url)
    );
}
