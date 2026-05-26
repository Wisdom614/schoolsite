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
      return new NextResponse('Application not found', { status: 404 });
    }
    
    // Generate PDF using the PDF API
    const pdfResponse = await fetch(`${req.nextUrl.origin}/api/admissions/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const pdfData = await pdfResponse.json();
    
    if (!pdfData.success || !pdfData.pdf) {
      throw new Error('PDF generation failed');
    }
    
    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfData.pdf, 'base64');
    
    // Return PDF file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="admission-${data.reference_id}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
    
  } catch (error) {
    console.error('Download error:', error);
    return new NextResponse('Failed to generate PDF', { status: 500 });
  }
}