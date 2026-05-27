import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const supabase = createClient();
    
    // Fetch admission data
    const { data, error } = await supabase
      .from('admissions')
      .select('*')
      .eq('reference_id', id)
      .single();
    
    if (error || !data) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Generate PDF
    const pdfResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admissions/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const pdfData = await pdfResponse.json();
    const pdfBuffer = Buffer.from(pdfData.pdf, 'base64');
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="admission-${data.reference_id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}