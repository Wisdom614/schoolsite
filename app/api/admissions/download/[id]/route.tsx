import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    
    console.log('Downloading admission with reference ID:', id);
    
    // Fetch admission data
    const { data, error } = await supabase
      .from('admissions')
      .select('*')
      .eq('reference_id', id)
      .single();
    
    if (error || !data) {
      console.error('Fetch error:', error);
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Generate PDF using dynamic import for Vercel
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
    
    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { height } = page.getSize();
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
    page.drawText('ADMISSION APPLICATION FORM', {
      x: 50,
      y: y,
      size: 16,
      font: boldFont,
    });
    
    y -= 30;
    page.drawText(`Reference ID: ${data.reference_id}`, {
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
    
    const pdfBytes = await pdfDoc.save();
    
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="admission-${data.reference_id}.pdf"`,
      },
    });
    
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}