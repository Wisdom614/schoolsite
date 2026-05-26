import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { width, height } = page.getSize();
    let y = height - 50;
    
    // Header
    page.drawText('ST. BERNARD SECONDARY SCHOOL', {
      x: 50,
      y: y,
      size: 18,
      font: boldFont,
      color: rgb(0.2, 0.3, 0.5),
    });
    
    y -= 25;
    page.drawText('Molyko - Buea, South West Region', {
      x: 50,
      y: y,
      size: 10,
      font: font,
      color: rgb(0.4, 0.4, 0.4),
    });
    
    y -= 25;
    page.drawText('='.repeat(50), {
      x: 50,
      y: y,
      size: 8,
      font: font,
    });
    
    y -= 30;
    page.drawText('ADMISSION APPLICATION FORM', {
      x: 50,
      y: y,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    y -= 30;
    page.drawText(`Reference ID: ${data.reference_id || 'Pending'}`, {
      x: 50,
      y: y,
      size: 10,
      font: boldFont,
      color: rgb(0.5, 0.3, 0),
    });
    
    y -= 40;
    page.drawText('STUDENT INFORMATION', {
      x: 50,
      y: y,
      size: 12,
      font: boldFont,
    });
    
    y -= 20;
    const fields = [
      { label: 'Full Name', value: data.student_full_name },
      { label: 'Date of Birth', value: data.student_dob },
      { label: 'Previous School', value: data.previous_school || 'N/A' },
      { label: 'Applying for Class', value: data.class_applying },
    ];
    
    fields.forEach(field => {
      page.drawText(`${field.label}: ${field.value}`, {
        x: 50,
        y: y,
        size: 10,
        font: font,
      });
      y -= 20;
    });
    
    y -= 10;
    page.drawText('PARENT/GUARDIAN INFORMATION', {
      x: 50,
      y: y,
      size: 12,
      font: boldFont,
    });
    
    y -= 20;
    const parentFields = [
      { label: 'Parent Name', value: data.parent_name },
      { label: 'Email', value: data.parent_email },
      { label: 'Phone', value: data.parent_phone || 'N/A' },
      { label: 'Address', value: data.address || 'N/A' },
    ];
    
    parentFields.forEach(field => {
      page.drawText(`${field.label}: ${field.value}`, {
        x: 50,
        y: y,
        size: 10,
        font: font,
      });
      y -= 20;
    });
    
    y -= 20;
    page.drawText('='.repeat(50), {
      x: 50,
      y: y,
      size: 8,
      font: font,
    });
    
    y -= 20;
    page.drawText(`Submitted: ${new Date(data.submitted_at).toLocaleDateString()}`, {
      x: 50,
      y: y,
      size: 8,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    
    return NextResponse.json({ success: true, pdf: pdfBase64 });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}