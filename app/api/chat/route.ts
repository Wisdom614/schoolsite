import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    
    // Add school context to help AI give better responses
    const systemContext = `You are Bewise AI, the official assistant for St. Bernard Secondary School in Molyko - Buea, Cameroon. 
    School info: 
    - Founded: Over 25 years of excellence
    - Students: 1200+ enrolled
    - Staff: 45+ qualified teachers
    - Contact: +237671657357, wisdombesong123@gmail.com
    
    Provide helpful, concise responses about school admissions, academics, events, and general information. 
    Be friendly and professional. Keep responses under 150 words unless asking for details.`;
    
    const response = await fetch('https://ai.wisedev.online/chat', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer dev-key-1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemContext
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Clean up the response
    let cleanResponse = data.response || "I'm here to help with St. Bernard Secondary School!";
    
    // Remove any markdown bold/italic that might cause issues
    cleanResponse = cleanResponse.replace(/\*\*(.*?)\*\*/g, '$1');
    cleanResponse = cleanResponse.replace(/\*(.*?)\*/g, '$1');
    
    return NextResponse.json({ 
      reply: cleanResponse
    });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { reply: "I apologize, but I'm having technical difficulties. Please contact the school directly:\n\n📞 Phone: +237671657357\n📧 Email: wisdombesong123@gmail.com" },
      { status: 500 }
    );
  }
}