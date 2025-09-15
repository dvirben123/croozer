import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/facebook-deauth/status
 * Facebook will call this endpoint to verify that user data has been deleted
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const confirmationCode = searchParams.get("code");

        if (!confirmationCode) {
            return NextResponse.json(
                { error: "Missing confirmation code" },
                { status: 400 }
            );
        }

        // In a real implementation, you would:
        // 1. Look up the confirmation code in your database
        // 2. Verify that the deletion was completed
        // 3. Return the appropriate status

        // Mock database lookup
        // const deletion = await db.deletionConfirmations.findUnique({
        //   where: { confirmationCode }
        // });

        // if (!deletion) {
        //   return NextResponse.json(
        //     { error: "Invalid confirmation code" },
        //     { status: 404 }
        //   );
        // }

        // For demo purposes, we'll assume all deletions are successful
        const mockDeletion = {
            confirmationCode,
            status: "completed",
            deletedAt: new Date().toISOString(),
            userId: "mock_user_id"
        };

        // Return status in the format Facebook expects
        return NextResponse.json({
            confirmation_code: confirmationCode,
            status: "completed",
            deleted_at: mockDeletion.deletedAt,
            message: "User data has been successfully deleted"
        });

    } catch (error) {
        console.error("Status check error:", error);

        return NextResponse.json(
            {
                error: "Internal server error",
                status: "error"
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/facebook-deauth/status
 * Alternative endpoint for status updates
 */
export async function POST(request: NextRequest) {
    return GET(request);
}
