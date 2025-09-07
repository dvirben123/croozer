import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ContactLead from '@/models/ContactLead';
import { sendContactEmails } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        // Connect to database
        await dbConnect();

        // Parse request body
        const body = await request.json();
        const { name, email, phone, company, message, source = 'contact_form' } = body;

        // Validate required fields
        if (!name || !email) {
            return NextResponse.json(
                { error: 'Name and email are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Check for existing lead with same email (optional - you might want to allow duplicates)
        const existingLead = await ContactLead.findOne({ email: email.toLowerCase() });

        // Create new contact lead
        const contactLead = new ContactLead({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone?.trim(),
            company: company?.trim(),
            message: message?.trim(),
            source,
            status: 'new',
            emailSent: false,
        });

        // Save to database
        const savedLead = await contactLead.save();

        // Send emails (don't wait for completion to avoid timeout)
        let emailResults = null;
        try {
            emailResults = await sendContactEmails(savedLead);

            // Update lead to mark emails as sent
            savedLead.emailSent = true;
            savedLead.emailSentAt = new Date();
            await savedLead.save();

        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the API call if emails fail - lead is still saved
        }

        // Return success response
        return NextResponse.json(
            {
                success: true,
                message: 'Contact form submitted successfully',
                leadId: savedLead._id,
                emailsSent: savedLead.emailSent,
                existingLead: !!existingLead,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Contact API error:', error);

        // Handle specific mongoose validation errors
        if (error instanceof Error && error.name === 'ValidationError') {
            return NextResponse.json(
                { error: 'Validation error', details: error.message },
                { status: 400 }
            );
        }

        // Handle duplicate key errors
        if (error instanceof Error && 'code' in error && error.code === 11000) {
            return NextResponse.json(
                { error: 'A lead with this email already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET method to retrieve leads (for admin purposes)
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const source = searchParams.get('source');

        // Build query
        const query: any = {};
        if (status) query.status = status;
        if (source) query.source = source;

        // Get total count
        const total = await ContactLead.countDocuments(query);

        // Get paginated leads
        const leads = await ContactLead.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select('-__v'); // Exclude version field

        return NextResponse.json({
            leads,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: leads.length,
                totalLeads: total,
            },
        });

    } catch (error) {
        console.error('GET Contact API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
