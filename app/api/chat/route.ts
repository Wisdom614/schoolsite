import { NextRequest, NextResponse } from 'next/server';

// Professional response templates
const RESPONSES = {
  // Admissions
  requirements: `**Admission Requirements**

To apply to St. Bernard Secondary School, you will need:

• Student's birth certificate
• Most recent school report card
• Four recent passport photographs
• Completed application form

The application fee is 5,000 CFA.`,
  
  applicationFee: `**Application Fees**

• Application fee: 5,000 CFA (non-refundable)
• Acceptance fee: 25,000 CFA (due upon admission)

Fees can be paid at the school's finance office or via mobile money.`,
  
  process: `**Application Process**

1. Complete the online application form
2. Upload required documents
3. Pay the application fee of 5,000 CFA
4. Receive your reference ID via email
5. Wait for review (typically 5 business days)
6. Receive admission decision by email

You will be notified once a decision is made on your application.`,

  // School Information
  contact: `**Contact Information**

📞 Phone: +237 671 657 357
📧 Email: info@stbernard.edu.cm
📍 Location: Molyko - Buea, South West Region

Our admissions office is open Monday through Friday from 8:00 AM to 4:00 PM.`,
  
  hours: `**School Hours**

Monday - Friday: 7:30 AM to 3:30 PM
Saturday: 8:00 AM to 12:00 PM
Sunday: Closed

The administration office closes at 4:00 PM on weekdays.`,

  // GCE Programme
  gceOverview: `**GCE Programme Overview**

St. Bernard follows the Cameroon GCE curriculum:

**Ordinary Level (Forms 1-5)**
Students complete a minimum of eight subjects including English, Mathematics, and Sciences.

**Advanced Level (Lower and Upper Sixth)**
Students choose from three subject combinations:
• Science (Biology, Chemistry, Physics, Mathematics)
• Arts (Literature, History, Geography, Economics)
• Commercial (Economics, Accounting, Business Studies, Mathematics)`,
  
  gceRegistration: `**GCE Registration Period**

• Registration opens: November 1st
• Registration closes: February 28th
• Late registration: March 1st - 15th (with penalty)

**Examination Period**
• O/L Examinations: May - June
• A/L Examinations: June - July
• Results released: July (O/L) and August (A/L)

We recommend registering early to avoid late fees.`,
  
  // General
  location: `**Our Location**

St. Bernard Secondary School is located in Molyko, Buea, South West Region of Cameroon.

We are situated near the main road, easily accessible by taxi or personal vehicle. Ample parking is available on campus.`,
  
  transport: `**School Transport**

The school operates a bus service for students living in:
• Molyko
• Mile 16
• Buea Town
• Great Soppo
• Bonduma

Contact the transport office for route details and availability.`,
  
  uniform: `**School Uniform**

Uniforms can be purchased at:
• The school's uniform shop (open weekdays 8 AM - 3 PM)
• Authorized suppliers in Buea Town

New students receive a uniform list upon admission.`,
  
  // Default helpful response
  default: `Thank you for your inquiry.

For specific questions about admissions, fees, or the GCE programme, please contact our admissions office directly at +237 671 657 357 or email info@stbernard.edu.cm.

Our team is available Monday through Friday from 8 AM to 4 PM to assist you.`
};

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    const query = message.toLowerCase();
    
    // Smart matching for common questions
    if (query.includes('requirement') || query.includes('need to apply') || query.includes('document')) {
      return NextResponse.json({ reply: RESPONSES.requirements });
    }
    
    if (query.includes('fee') || query.includes('cost') || query.includes('price') || query.includes('payment')) {
      return NextResponse.json({ reply: RESPONSES.applicationFee });
    }
    
    if (query.includes('process') || query.includes('how to apply') || query.includes('steps')) {
      return NextResponse.json({ reply: RESPONSES.process });
    }
    
    if (query.includes('contact') || query.includes('phone') || query.includes('email') || query.includes('reach')) {
      return NextResponse.json({ reply: RESPONSES.contact });
    }
    
    if (query.includes('hour') || query.includes('open') || query.includes('when is school')) {
      return NextResponse.json({ reply: RESPONSES.hours });
    }
    
    if ((query.includes('gce') || query.includes('ordinary') || query.includes('advanced')) && 
        (query.includes('what') || query.includes('tell') || query.includes('explain'))) {
      return NextResponse.json({ reply: RESPONSES.gceOverview });
    }
    
    if ((query.includes('register') || query.includes('exam date') || query.includes('when is gce')) && query.includes('gce')) {
      return NextResponse.json({ reply: RESPONSES.gceRegistration });
    }
    
    if (query.includes('location') || query.includes('where is') || query.includes('address')) {
      return NextResponse.json({ reply: RESPONSES.location });
    }
    
    if (query.includes('transport') || query.includes('bus')) {
      return NextResponse.json({ reply: RESPONSES.transport });
    }
    
    if (query.includes('uniform')) {
      return NextResponse.json({ reply: RESPONSES.uniform });
    }
    
    // Check for application status
    const referenceMatch = message.match(/[A-Z0-9-]{10,}/);
    if (query.includes('status') || query.includes('application') || referenceMatch) {
      if (referenceMatch) {
        return NextResponse.json({ 
          reply: `**Application Status Inquiry**

Your reference ID is ${referenceMatch[0]}.

To check your application status, please email admissions@stbernard.edu.cm with your reference ID, or call +237 671 657 357.

Our admissions team will respond within one business day.` 
        });
      } else {
        return NextResponse.json({ 
          reply: `**Application Status Check**

To inquire about your application status, please provide your reference ID. If you do not have one, email admissions@stbernard.edu.cm with the student's full name and date of birth.

Our team will assist you promptly.` 
        });
      }
    }
    
    // For unrecognized questions, use AI with professional prompt
    const professionalPrompt = `You are BEWISE AI, a professional assistant for St. Bernard Secondary School in Molyko - Buea, Cameroon.

Your communication style:
• Professional and warm
• Complete sentences, no abbreviations
• 50-100 words per response
• Use bullet points for lists (3-5 items maximum)
• Be helpful and accurate

School facts you know:
- Location: Molyko - Buea, South West Region, Cameroon
- Contact: +237 671 657 357, info@stbernard.edu.cm
- Hours: Monday-Friday 7:30 AM - 3:30 PM, Saturday 8 AM - 12 PM
- GCE Programme: Ordinary Level (Forms 1-5) and Advanced Level (Lower/Upper Sixth)
- Subject combinations for A/L: Science, Arts, Commercial
- Application fee: 5,000 CFA
- Acceptance fee: 25,000 CFA

If you don't know something, say: "I don't have that information readily available. Please contact our admissions office at +237 671 657 357 for assistance."

User question: ${message}

Provide a helpful, professional response.`;

    const response = await fetch('https://ai.wisedev.online/chat', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer dev-key-1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: professionalPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.6,
        max_tokens: 200
      }),
    });
    
    const data = await response.json();
    let aiReply = data.response || RESPONSES.default;
    
    return NextResponse.json({ reply: aiReply });
    
  } catch (error) {
    console.error('AI error:', error);
    return NextResponse.json({ reply: RESPONSES.default });
  }
}