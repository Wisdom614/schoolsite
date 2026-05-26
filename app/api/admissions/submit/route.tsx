import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    
    // Validate required fields
    const requiredFields = [
      'student_full_name',
      'student_dob',
      'parent_name',
      'parent_email',
      'parent_phone',
      'class_applying'
    ];
    
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Insert into database
    const { data, error } = await supabase
      .from('admissions')
      .insert([{
        student_full_name: body.student_full_name,
        student_dob: body.student_dob,
        parent_name: body.parent_name,
        parent_email: body.parent_email,
        parent_phone: body.parent_phone,
        address: body.address || null,
        class_applying: body.class_applying,
        previous_school: body.previous_school || null,
        submitted_at: new Date().toISOString(),
        status: 'pending'
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json(
        { error: 'Failed to save application to database' },
        { status: 500 }
      );
    }
    
    // Send confirmation email to parent (if Resend is configured)
    if (process.env.RESEND_API_KEY && data) {
      try {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Application Received</title>
            <style>
              body { font-family: -apple-system, Helvetica, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1e293b; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
              .reference { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
              .reference-code { font-size: 24px; font-weight: bold; color: #d97706; font-family: monospace; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
              .button { background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>St. Bernard Secondary School</h1>
                <p>Molyko - Buea, Cameroon</p>
              </div>
              <div class="content">
                <h2>Application Received ✓</h2>
                <p>Dear <strong>${body.parent_name}</strong>,</p>
                <p>Thank you for applying to St. Bernard Secondary School. We have successfully received your child's admission application.</p>
                
                <div class="reference">
                  <p style="margin: 0 0 5px 0;">Your Application Reference ID:</p>
                  <div class="reference-code">${data.reference_id}</div>
                  <p style="margin: 10px 0 0 0; font-size: 12px;">Please save this reference for future communication</p>
                </div>
                
                <h3>Application Summary:</h3>
                <ul>
                  <li><strong>Student Name:</strong> ${body.student_full_name}</li>
                  <li><strong>Class Applying:</strong> ${body.class_applying}</li>
                  <li><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</li>
                </ul>
                
                <p>Our admissions team will review your application and contact you within <strong>5 business days</strong> regarding the status.</p>
                
                <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
                  <p style="margin: 0; font-size: 14px;"><strong>📞 Need assistance?</strong><br>
                  Contact our admissions office:<br>
                  Phone: +237 671 657 357<br>
                  Email: admissions@stbernard.edu.cm</p>
                </div>
                
                <div style="text-align: center;">
                  <a href="https://schoolsite-hazel.vercel.app" class="button">Visit Our Website</a>
                </div>
              </div>
              <div class="footer">
                <p>St. Bernard Secondary School - Excellence in Education, Digital by Design</p>
                <p>Molyko - Buea, South West Region, Cameroon</p>
              </div>
            </div>
          </body>
          </html>
        `;
        
        await resend.emails.send({
          from: 'St. Bernard School <noreply@stbernard.edu.cm>',
          to: [body.parent_email],
          subject: `Application Received - ${data.reference_id}`,
          html: emailHtml,
        });
        
        console.log(`Confirmation email sent to ${body.parent_email}`);
      } catch (emailError) {
        // Don't fail the request if email fails, just log it
        console.error('Email sending failed:', emailError);
      }
    } else {
      console.warn('Resend API key not configured. Email notification skipped.');
    }
    
    // Return success response with reference ID
    return NextResponse.json({ 
      success: true, 
      reference_id: data.reference_id,
      id: data.id,
      message: 'Application submitted successfully! Check your email for confirmation.'
    });
    
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}