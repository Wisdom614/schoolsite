import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, userMessage, aiResponse, timestamp } = await req.json();
    
    const supabase = createClient();
    
    // Store chat log (create table first)
    await supabase.from('chat_logs').insert({
      session_id: sessionId,
      user_message: userMessage,
      ai_response: aiResponse,
      created_at: timestamp || new Date().toISOString()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Log error:', error);
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 });
  }
}