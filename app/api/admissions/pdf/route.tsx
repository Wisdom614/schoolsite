import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([612, 792]); // US Letter size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    
    const { width, height } = page.getSize();
    let y = height - 50;
    
    // Header with border
    page.drawRectangle({
      x: 40,
      y: height - 20,
      width: width - 80,
      height: 100,
      borderColor: rgb(0.85, 0.65, 0.13),
      borderWidth: 2,
    });
    
    // School Name
    page.drawText('ST. BERNARD SECONDARY SCHOOL', {
      x: 50,
      y: y,
      size: 20,
      font: boldFont,
      color: rgb(0.2, 0.3, 0.5),
    });
    
    y -= 22;
    page.drawText('Molyko - Buea, South West Region', {
      x: 50,
      y: y,
      size: 10,
      font: font,
      color: rgb(0.4, 0.4, 0.4),
    });
    
    y -= 15;
    page.drawText('"Excellence in Education, Digital by Design"', {
      x: 50,
      y: y,
      size: 9,
      font: italicFont,
      color: rgb(0.6, 0.4, 0.1),
    });
    
    // Title
    y -= 35;
    page.drawRectangle({
      x: 40,
      y: y - 5,
      width: width - 80,
      height: 35,
      color: rgb(0.95, 0.9, 0.85),
    });
    
    page.drawText('ADMISSION APPLICATION FORM', {
      x: 50,
      y: y + 8,
      size: 16,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    // Reference ID Box
    y -= 35;
    page.drawRectangle({
      x: 40,
      y: y - 5,
      width: width - 80,
      height: 25,
      borderColor: rgb(0.85, 0.65, 0.13),
      borderWidth: 1,
    });
    
    page.drawText(`REFERENCE ID: ${data.reference_id || 'Pending'}`, {
      x: 50,
      y: y - 2,
      size: 10,
      font: boldFont,
      color: rgb(0.85, 0.65, 0.13),
    });
    
    // Student Information Section
    y -= 40;
    page.drawRectangle({
      x: 40,
      y: y - 5,
      width: width - 80,
      height: 25,
      color: rgb(0.9, 0.85, 0.8),
    });
    
    page.drawText('STUDENT INFORMATION', {
      x: 50,
      y: y,
      size: 12,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    y -= 25;
    const studentFields = [
      { label: 'Full Name', value: data.student_full_name || 'N/A' },
      { label: 'Date of Birth', value: data.student_dob ? new Date(data.student_dob).toLocaleDateString() : 'N/A' },
      { label: 'Gender', value: data.student_gender || 'N/A' },
      { label: 'Nationality', value: data.student_nationality || 'Cameroonian' },
    ];
    
    studentFields.forEach((field, index) => {
      const xPos = 50 + (index % 2 === 0 ? 0 : 260);
      const yPos = y - (Math.floor(index / 2) * 20);
      
      page.drawText(`${field.label}:`, {
        x: xPos,
        y: yPos,
        size: 9,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      page.drawText(field.value, {
        x: xPos + 80,
        y: yPos,
        size: 9,
        font: font,
        color: rgb(0.1, 0.1, 0.1),
      });
    });
    
    y -= 45;
    
    // Parent Information Section
    page.drawRectangle({
      x: 40,
      y: y - 5,
      width: width - 80,
      height: 25,
      color: rgb(0.9, 0.85, 0.8),
    });
    
    page.drawText('PARENT/GUARDIAN INFORMATION', {
      x: 50,
      y: y,
      size: 12,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    y -= 25;
    const parentFields = [
      { label: 'Parent Name', value: data.parent_name || 'N/A' },
      { label: 'Email', value: data.parent_email || 'N/A' },
      { label: 'Phone', value: data.parent_phone || 'N/A' },
      { label: 'Occupation', value: data.parent_occupation || 'N/A' },
    ];
    
    parentFields.forEach((field, index) => {
      const xPos = 50 + (index % 2 === 0 ? 0 : 260);
      const yPos = y - (Math.floor(index / 2) * 20);
      
      page.drawText(`${field.label}:`, {
        x: xPos,
        y: yPos,
        size: 9,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      page.drawText(field.value, {
        x: xPos + 85,
        y: yPos,
        size: 9,
        font: font,
        color: rgb(0.1, 0.1, 0.1),
      });
    });
    
    y -= 45;
    
    // Address
    if (data.address) {
      page.drawText('Address:', {
        x: 50,
        y: y,
        size: 9,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      page.drawText(data.address, {
        x: 110,
        y: y,
        size: 9,
        font: font,
        color: rgb(0.1, 0.1, 0.1),
      });
      
      y -= 25;
    }
    
    // Academic Information Section
    page.drawRectangle({
      x: 40,
      y: y - 5,
      width: width - 80,
      height: 25,
      color: rgb(0.9, 0.85, 0.8),
    });
    
    page.drawText('ACADEMIC INFORMATION', {
      x: 50,
      y: y,
      size: 12,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    y -= 25;
    const academicFields = [
      { label: 'Applying for Class', value: data.class_applying || 'N/A' },
      { label: 'Academic Year', value: data.academic_year || '2025/2026' },
      { label: 'Previous School', value: data.previous_school || 'N/A' },
    ];
    
    academicFields.forEach((field, index) => {
      const xPos = 50 + (index % 2 === 0 ? 0 : 260);
      const yPos = y - (Math.floor(index / 2) * 20);
      
      page.drawText(`${field.label}:`, {
        x: xPos,
        y: yPos,
        size: 9,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      page.drawText(field.value, {
        x: xPos + 85,
        y: yPos,
        size: 9,
        font: font,
        color: rgb(0.1, 0.1, 0.1),
      });
    });
    
    y -= 45;
    
    // Health Information Section (if provided)
    if (data.medical_conditions || data.allergies) {
      page.drawRectangle({
        x: 40,
        y: y - 5,
        width: width - 80,
        height: 25,
        color: rgb(0.9, 0.85, 0.8),
      });
      
      page.drawText('HEALTH INFORMATION (Confidential)', {
        x: 50,
        y: y,
        size: 11,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      
      y -= 25;
      
      if (data.medical_conditions) {
        page.drawText('Medical Conditions:', {
          x: 50,
          y: y,
          size: 9,
          font: boldFont,
          color: rgb(0.3, 0.3, 0.3),
        });
        
        const medicalText = data.medical_conditions;
        const lines = medicalText.split('\n');
        let lineY = y - 15;
        
        lines.forEach((line: string) => {
          page.drawText(line, {
            x: 55,
            y: lineY,
            size: 8,
            font: font,
            color: rgb(0.1, 0.1, 0.1),
          });
          lineY -= 12;
        });
        
        y = lineY - 10;
      }
      
      if (data.allergies) {
        page.drawText('Allergies:', {
          x: 50,
          y: y,
          size: 9,
          font: boldFont,
          color: rgb(0.3, 0.3, 0.3),
        });
        
        const allergiesText = data.allergies;
        const lines = allergiesText.split('\n');
        let lineY = y - 15;
        
        lines.forEach((line: string) => {
          page.drawText(line, {
            x: 55,
            y: lineY,
            size: 8,
            font: font,
            color: rgb(0.1, 0.1, 0.1),
          });
          lineY -= 12;
        });
        
        y = lineY - 20;
      }
    }
    
    // Footer
    y = 50;
    page.drawLine({
      start: { x: 40, y: y + 15 },
      end: { x: width - 40, y: y + 15 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    
    page.drawText(`Submitted: ${new Date(data.submitted_at).toLocaleDateString()}`, {
      x: 50,
      y: y,
      size: 8,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    page.drawText('St. Bernard Secondary School - Excellence in Education, Digital by Design', {
      x: width / 2,
      y: y,
      size: 8,
      font: italicFont,
      color: rgb(0.5, 0.5, 0.5),
      options: { align: 'center' },
    });
    
    // Add second page for terms and conditions (if needed)
    if (y < 100) {
      page = pdfDoc.addPage([612, 792]);
      let secondY = height - 50;
      
      page.drawText('TERMS AND CONDITIONS', {
        x: 50,
        y: secondY,
        size: 14,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      
      secondY -= 30;
      const terms = [
        '1. The information provided in this application is true and accurate to the best of my knowledge.',
        '2. I authorize the school to verify the information provided.',
        '3. I agree to abide by the school\'s rules, regulations, and code of conduct.',
        '4. I understand that admission is provisional until all requirements are met.',
        '5. I agree to pay all applicable fees as determined by the school administration.',
        '6. The school reserves the right to reject any application that does not meet the admission criteria.',
        '7. I will notify the school of any changes to the information provided in this application.',
        '8. I consent to the school using my contact information for official communication.',
      ];
      
      terms.forEach(term => {
        page.drawText(term, {
          x: 50,
          y: secondY,
          size: 9,
          font: font,
          color: rgb(0.2, 0.2, 0.2),
        });
        secondY -= 18;
      });
      
      secondY -= 20;
      page.drawText('Declaration:', {
        x: 50,
        y: secondY,
        size: 11,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      
      secondY -= 20;
      page.drawText(`I, ${data.parent_name || 'the applicant'}, declare that the information provided is accurate.`, {
        x: 50,
        y: secondY,
        size: 9,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });
      
      secondY -= 30;
      page.drawText('_________________________', {
        x: 50,
        y: secondY,
        size: 9,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });
      
      page.drawText('Signature', {
        x: 50,
        y: secondY - 12,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      page.drawText(new Date().toLocaleDateString(), {
        x: 400,
        y: secondY,
        size: 9,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });
      
      page.drawText('Date', {
        x: 400,
        y: secondY - 12,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
    
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    
    return NextResponse.json({ success: true, pdf: pdfBase64 });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}