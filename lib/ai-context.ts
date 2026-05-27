import { createClient } from '@/lib/supabase';

export interface AIContext {
  schoolInfo: any;
  announcements: any[];
  events: any[];
  admissions: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  stats: {
    totalStudents: number;
    totalStaff: number;
    upcomingEvents: number;
  };
}

export async function buildAIContext(): Promise<AIContext> {
  const supabase = createClient();
  
  // Fetch school settings
  const { data: schoolInfo } = await supabase
    .from('school_settings')
    .select('*')
    .single();
  
  // Fetch recent announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(5);
  
  // Fetch upcoming events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true })
    .limit(5);
  
  // Fetch admission stats
  const { data: admissions } = await supabase
    .from('admissions')
    .select('status');
  
  const admissionStats = {
    total: admissions?.length || 0,
    pending: admissions?.filter(a => a.status === 'pending').length || 0,
    approved: admissions?.filter(a => a.status === 'approved').length || 0,
    rejected: admissions?.filter(a => a.status === 'rejected').length || 0,
  };
  
  // Fetch student and staff counts
  const { count: totalStudents } = await supabase
    .from('admissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');
  
  const { count: totalStaff } = await supabase
    .from('staff')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);
  
  return {
    schoolInfo,
    announcements: announcements || [],
    events: events || [],
    admissions: admissionStats,
    stats: {
      totalStudents: totalStudents || 0,
      totalStaff: totalStaff || 0,
      upcomingEvents: events?.length || 0,
    },
  };
}

export function formatContextForAI(context: AIContext): string {
  return `
SCHOOL INFORMATION:
- Name: ${context.schoolInfo?.school_name || 'St. Bernard Secondary School'}
- Motto: ${context.schoolInfo?.school_motto || 'Excellence in Education, Digital by Design'}
- Address: ${context.schoolInfo?.address || 'Molyko - Buea, Cameroon'}
- Phone: ${context.schoolInfo?.phone || '+237 671 657 357'}
- Email: ${context.schoolInfo?.email || 'info@stbernard.edu.cm'}

SCHOOL STATISTICS:
- Total Students Enrolled: ${context.stats.totalStudents}
- Total Staff Members: ${context.stats.totalStaff}
- Applications Received: ${context.admissions.total}
- Pending Applications: ${context.admissions.pending}
- Approved Applications: ${context.admissions.approved}
- Rejected Applications: ${context.admissions.rejected}
- Upcoming Events: ${context.stats.upcomingEvents}

RECENT ANNOUNCEMENTS:
${context.announcements.map(a => `- ${a.title}: ${a.content.substring(0, 100)}...`).join('\n')}

UPCOMING EVENTS:
${context.events.map(e => `- ${e.title}: ${new Date(e.event_date).toLocaleDateString()} at ${e.location || 'School'}`).join('\n')}

ADMISSION REQUIREMENTS:
- Application fee: 5,000 CFA
- Acceptance fee: 25,000 CFA
- Required documents: Birth certificate, last report card, 4 passport photos
- Classes offered: Form 1-5 (GCE O/L), Lower Sixth - Upper Sixth (GCE A/L)

SCHOOL HOURS:
${context.schoolInfo?.school_hours || 'Monday-Friday: 7:30 AM - 3:30 PM, Saturday: 8:00 AM - 12:00 PM'}

GCE PROGRAMME:
- Ordinary Level (Forms 1-5): 8+ subjects including core subjects
- Advanced Level (Lower/Upper Sixth): Science, Arts, Commercial combinations
- Registration period: November - February
- Examinations: May-July
  `;
}