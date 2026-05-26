import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { to, subject, content, parentName, studentName } = await req.json();
    
    const personalizedContent = content
      .replace('{parent_name}', parentName)
      .replace('{student_name}', studentName);
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1e293b; color: white; padding: 20px; text-align: center;">
            <h2>St. Bernard Secondary School</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd;">
            ${personalizedContent.replace(/\n/g, '<br/>')}
          </div>
          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
            <p>St. Bernard Secondary School - Molyko, Buea</p>
            <p>Tel: +237 671 657 357 | Email: admissions@stbernard.edu.cm</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await resend.emails.send({
      from: 'St. Bernard School <admissions@wisedev.online>',
      to: [to],
      subject: subject,
      html: html,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bulk email error:', error);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}