import { NextRequest, NextResponse } from 'next/server';

// Public information - concise format
const PUBLIC_INFO = {
  school: {
    name: "St. Bernard Secondary School",
    location: "Molyko - Buea, Cameroon",
    contact: "+237 671 657 357",
    email: "info@stbernard.edu.cm"
  },
  admissions: {
    requirements: "Birth cert, last report card, 4 photos",
    fee: "5,000 CFA (application) • 25,000 CFA (acceptance)",
    process: "Apply online → Get reference ID → Wait 5 days → Decision"
  },
  gce: {
    levels: "O/L (Forms 1-5) • A/L (Lower/Upper Sixth)",
    combos: "Science • Arts • Commercial",
    period: "Register Nov-Feb • Exams May-July"
  }
};

// Response formatter - ensures clean output
function formatResponse(text: string): string {
  // Remove extra spaces and line breaks
  let cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Split into sentences
  let sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Limit to 2-3 sentences max
  if (sentences.length > 3) {
    sentences = sentences.slice(0, 3);
  }
  
  // Rejoin with proper punctuation
  let result = sentences.join('. ') + '.';
  
  // Ensure under 200 characters (about 30 words)
  if (result.length > 200) {
    result = result.substring(0, 197) + '...';
  }
  
  return result.trim();
}

export async function POST(req: NextRequest) {
  try {
    const { message, userToken } = await req.json();
    const query = message.toLowerCase();
    
    // Quick response mapping for common questions
    const quickResponses: Record<string, string> = {
      'admission requirement': `📋 Requirements:\n• Birth certificate\n• Last report card\n• 4 passport photos\n• 5,000 CFA fee`,
      'application fee': `💰 Application Fee: 5,000 CFA\nAcceptance Fee: 25,000 CFA`,
      'school fees': `💰 Contact accounts office for current fee structure.`,
      'school contact': `📞 Contact:\n• Phone: +237 671 657 357\n• Email: info@stbernard.edu.cm`,
      'school hours': `⏰ Hours:\nMon-Fri: 7:30 AM - 3:30 PM\nSat: 8:00 AM - 12:00 PM`,
      'gce registration': `📅 GCE Registration: November - February\nExams: May - July`,
      'gce levels': `🎓 GCE Levels:\n• Ordinary Level (Forms 1-5)\n• Advanced Level (Lower/Upper Sixth)`,
      'subject combination': `📚 A/L Combinations:\n• Science\n• Arts\n• Commercial`,
      'application process': `📝 Process:\n1. Apply online\n2. Get reference ID\n3. Wait 5 days\n4. Receive decision`,
      'uniform': `👕 Uniforms available at school's uniform shop.`,
      'transport': `🚌 School bus service available for select routes.`,
    };
    
    // Check for quick match
    for (const [key, response] of Object.entries(quickResponses)) {
      if (query.includes(key)) {
        return NextResponse.json({ reply: response });
      }
    }
    
    // Check for application status request
    const referenceMatch = message.match(/[A-Z0-9-]{10,}/);
    if (query.includes('status') || query.includes('application') || referenceMatch) {
      if (referenceMatch) {
        return NextResponse.json({ 
          reply: `🔍 Reference: ${referenceMatch[0]}\n\nCheck status at:\nadmissions@stbernard.edu.cm\nOr call +237 671 657 357` 
        });
      } else {
        return NextResponse.json({ 
          reply: `📋 To check status:\nProvide your reference ID\nOr email admissions@stbernard.edu.cm` 
        });
      }
    }
    
    // Default concise prompt for AI
    const concisePrompt = `You are a concise assistant for St. Bernard School, Cameroon.

RULES:
- Maximum 30 words per response
- Use bullet points (•) for lists
- Keep answers short and direct
- No explanations, just facts
- Use emojis for visual organization

SCHOOL FACTS:
• Name: St. Bernard Secondary School, Molyko-Buea
• Contact: +237 671 657 357
• Email: info@stbernard.edu.cm
• Hours: Mon-Fri 7:30AM-3:30PM, Sat 8AM-12PM

ADMISSIONS:
• Requirements: Birth cert, report card, 4 photos
• Fee: 5,000 CFA application, 25,000 CFA acceptance
• Process: Apply online → 5 days review → Decision

GCE PROGRAMME:
• O/L: Forms 1-5
• A/L: Lower/Upper Sixth
• Combos: Science, Arts, Commercial
• Registration: Nov-Feb
• Exams: May-July

USER QUESTION: ${message}

ANSWER CONCISELY (max 30 words). Use bullet points if listing items.`;
    
    const response = await fetch('https://ai.wisedev.online/chat', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer dev-key-1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: concisePrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.5, // Lower temperature = more consistent short answers
        max_tokens: 100 // Limit response length
      }),
    });
    
    const data = await response.json();
    let aiReply = data.response || "📞 Contact +237 671 657 357 for details.";
    
    // Enforce formatting rules
    aiReply = formatResponse(aiReply);
    
    return NextResponse.json({ reply: aiReply });
    
  } catch (error) {
    console.error('AI error:', error);
    return NextResponse.json({ 
      reply: "📞 Contact school: +237 671 657 357" 
    });
  }
}