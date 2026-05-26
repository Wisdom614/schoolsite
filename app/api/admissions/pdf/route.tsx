import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Create a new PDF document
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
    
    y -= 20;
    page.drawText('Tel: +237 671657357', {
      x: 50,
      y: y,
      size: 10,
      font: font,
      color: rgb(0.4, 0.4, 0.4),
    });
    
    y -= 30;
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
      size: 11,
      font: boldFont,
      color: rgb(0.6, 0.4, 0.1),
    });
    
    y -= 40;
    page.drawText('STUDENT INFORMATION', {
      x: 50,
      y: y,
      size: 13,
      font: boldFont,
    });
    
    y -= 25;
    const fields = [
      { label: 'Full Name', value: data.student_full_name || 'N/A' },
      { label: 'Date of Birth', value: data.student_dob || 'N/A' },
      { label: 'Previous School', value: data.previous_school || 'N/A' },
      { label: 'Applying for Class', value: data.class_applying || 'N/A' },
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
    
    y -= 15;
    page.drawText('PARENT/GUARDIAN INFORMATION', {
      x: 50,
      y: y,
      size: 13,
      font: boldFont,
    });
    
    y -= 25;
    const parentFields = [
      { label: 'Parent Name', value: data.parent_name || 'N/A' },
      { label: 'Email', value: data.parent_email || 'N/A' },
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
    
    y -= 30;
    page.drawText('='.repeat(50), {
      x: 50,
      y: y,
      size: 8,
      font: font,
    });
    
    y -= 20;
    page.drawText(`Submitted: ${new Date(data.submitted_at || Date.now()).toLocaleDateString()}`, {
      x: 50,
      y: y,
      size: 9,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    
    return NextResponse.json({ 
      success: true, 
      pdf: pdfBase64,
      contentType: 'application/pdf'
    });
    
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}