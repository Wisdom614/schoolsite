import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received submission:', body);
    
    const supabase = createClient();
    
    // Validate required fields
    const requiredFields = ['student_full_name', 'student_dob', 'parent_name', 'parent_email', 'class_applying'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Prepare data for insertion
    const admissionData = {
      student_full_name: body.student_full_name,
      student_dob: body.student_dob,
      parent_name: body.parent_name,
      parent_email: body.parent_email,
      parent_phone: body.parent_phone || null,
      address: body.address || null,
      class_applying: body.class_applying,
      previous_school: body.previous_school || null,
      status: 'pending',
      submitted_at: new Date().toISOString()
    };
    
    console.log('Inserting data:', admissionData);
    
    // Insert into database
    const { data, error } = await supabase
      .from('admissions')
      .insert([admissionData])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log('Insert successful:', data);
    
    return NextResponse.json({ 
      success: true, 
      reference_id: data.reference_id,
      id: data.id 
    });
    
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit application' },
      { status: 500 }
    );
  }
}