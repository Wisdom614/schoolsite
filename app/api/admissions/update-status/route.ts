import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    console.log('=== UPDATE STATUS API CALLED ===');
    
    const body = await req.json();
    console.log('Received body:', body);
    
    const { id, status, rejectionReason } = body;
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }
    
    // Use admin client to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // First, get the application details
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('admissions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !application) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    console.log('Found application:', application.reference_id);
    console.log('Parent email:', application.parent_email);
    
    // Update status
    const updateData = {
      status: status,
      reviewed_at: new Date().toISOString(),
      ...(rejectionReason && { rejection_reason: rejectionReason })
    };
    
    const { error: updateError } = await supabaseAdmin
      .from('admissions')
      .update(updateData)
      .eq('id', id);
    
    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    // Send email notification
    let emailSent = false;
    let emailError = null;
    
    if (process.env.RESEND_API_KEY && application.parent_email) {
      try {
        const isApproved = status === 'approved';
        
        const emailHtml = isApproved ? `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Admission Approved - St. Bernard School</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
              .badge { background: #dcfce7; color: #166534; padding: 10px; text-align: center; border-radius: 8px; margin: 20px 0; font-size: 18px; font-weight: bold; }
              .button { background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>St. Bernard Secondary School</h2>
                <p>Molyko - Buea, Cameroon</p>
              </div>
              <div class="content">
                <p>Dear <strong>${application.parent_name}</strong>,</p>
                <p>Reference ID: <strong>${application.reference_id}</strong></p>
                
                <div class="badge">
                  ✓ APPLICATION APPROVED
                </div>
                
                <p>Congratulations! We are pleased to inform you that <strong>${application.student_full_name}</strong> has been admitted to <strong>${application.class_applying}</strong> for the academic year 2025-2026.</p>
                
                <h3>Next Steps:</h3>
                <ul>
                  <li>Visit the school administration office within 14 days</li>
                  <li>Bring original copies of academic records</li>
                  <li>Pay acceptance fee: <strong>25,000 CFA</strong></li>
                  <li>Complete enrollment registration</li>
                </ul>
                
                <a href="https://schoolsite-hazel.vercel.app" class="button">Visit School Website</a>
                
                <p style="margin-top: 20px;">For any questions, contact our admissions office.</p>
              </div>
              <div class="footer">
                <p>St. Bernard Secondary School - Excellence in Education, Digital by Design</p>
                <p>Tel: +237 671 657 357 | Email: admissions@stbernard.edu.cm</p>
              </div>
            </div>
          </body>
          </html>
        ` : `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Application Update - St. Bernard School</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
              .badge { background: #fee2e2; color: #991b1b; padding: 10px; text-align: center; border-radius: 8px; margin: 20px 0; font-size: 18px; font-weight: bold; }
              .reason { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>St. Bernard Secondary School</h2>
                <p>Molyko - Buea, Cameroon</p>
              </div>
              <div class="content">
                <p>Dear <strong>${application.parent_name}</strong>,</p>
                <p>Reference ID: <strong>${application.reference_id}</strong></p>
                
                <div class="badge">
                  ✗ APPLICATION DECLINED
                </div>
                
                <p>After careful review of your child's application for <strong>${application.student_full_name}</strong> to <strong>${application.class_applying}</strong>, we regret to inform you that we cannot offer admission at this time.</p>
                
                ${rejectionReason ? `
                  <div class="reason">
                    <strong>Reason for decision:</strong><br />
                    ${rejectionReason}
                  </div>
                ` : ''}
                
                <p>You may reapply for the next academic year or contact our admissions office for further clarification.</p>
                
                <a href="https://schoolsite-hazel.vercel.app" class="button">Visit School Website</a>
              </div>
              <div class="footer">
                <p>St. Bernard Secondary School - Excellence in Education, Digital by Design</p>
                <p>Tel: +237 671 657 357 | Email: admissions@stbernard.edu.cm</p>
              </div>
            </div>
          </body>
          </html>
        `;
        
        // Send email using your verified domain wisedev.online
        const emailResponse = await resend.emails.send({
          from: 'St. Bernard School <admissions@wisedev.online>', // Using your verified domain
          to: [application.parent_email],
          subject: status === 'approved' 
            ? `Admission Approved - ${application.reference_id}` 
            : `Application Update - ${application.reference_id}`,
          html: emailHtml,
        });
        
        console.log('✅ Email sent successfully:', emailResponse);
        emailSent = true;
        
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        emailError = emailError;
      }
    } else {
      console.warn('⚠️ RESEND_API_KEY not configured or no parent email');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Application ${status}`,
      emailSent: emailSent,
      emailError: emailError ? (emailError as Error).message : null
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}