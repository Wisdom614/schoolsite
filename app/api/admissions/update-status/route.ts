import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { Resend } from 'resend';
import { ApplicationStatusEmail } from '@/emails/ApplicationStatus';
import { render } from '@react-email/components';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { id, status, rejectionReason } = await req.json();
    const supabase = createClient();
    
    // Get application details
    const { data: application, error: fetchError } = await supabase
      .from('admissions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Update status
    const { error: updateError } = await supabase
      .from('admissions')
      .update({ 
        status,
        rejection_reason: rejectionReason || null,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    // Send email notification
    const emailHtml = render(
      ApplicationStatusEmail({
        studentName: application.student_full_name,
        parentName: application.parent_name,
        referenceId: application.reference_id,
        status: status,
        rejectionReason: rejectionReason,
      })
    );
    
    await resend.emails.send({
      from: 'St. Bernard School Admissions <admissions@stbernard.edu.cm>',
      to: [application.parent_email],
      subject: status === 'approved' 
        ? `Admission Approved - ${application.reference_id}` 
        : `Application Update - ${application.reference_id}`,
      html: emailHtml,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}