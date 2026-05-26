import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

interface ApplicationStatusEmailProps {
  studentName: string;
  parentName: string;
  referenceId: string;
  status: 'approved' | 'rejected';
  rejectionReason?: string;
  schoolName?: string;
}

export const ApplicationStatusEmail = ({
  studentName,
  parentName,
  referenceId,
  status,
  rejectionReason,
  schoolName = 'St. Bernard Secondary School',
}: ApplicationStatusEmailProps) => {
  const isApproved = status === 'approved';
  
  return (
    <Html>
      <Head />
      <Preview>
        {isApproved 
          ? `Congratulations! Your application for ${studentName} has been approved` 
          : `Update on your application for ${studentName}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={headerTitle}>{schoolName}</Heading>
            <Text style={headerSubtitle}>Molyko - Buea, Cameroon</Text>
          </Section>
          
          <Section style={contentSection}>
            <Heading style={greeting}>Dear {parentName},</Heading>
            
            <Text style={paragraph}>
              This is regarding the admission application for <strong>{studentName}</strong> 
              (Reference ID: <strong>{referenceId}</strong>).
            </Text>
            
            <Section style={statusSection(isApproved)}>
              <Text style={statusText}>
                {isApproved ? '✓ APPLICATION APPROVED' : '✗ APPLICATION DECLINED'}
              </Text>
            </Section>
            
            {isApproved ? (
              <>
                <Text style={paragraph}>
                  Congratulations! We are pleased to inform you that your child has been 
                  provisionally admitted to {schoolName}.
                </Text>
                <Text style={paragraph}>
                  <strong>Next Steps:</strong>
                </Text>
                <ul style={list}>
                  <li>Visit the school administration office within 14 days</li>
                  <li>Bring original copies of academic records</li>
                  <li>Pay acceptance fee of 25,000 CFA</li>
                  <li>Complete enrollment registration</li>
                </ul>
                <Button style={button} href="https://schoolsite-hazel.vercel.app/enrollment">
                  Complete Enrollment
                </Button>
              </>
            ) : (
              <>
                <Text style={paragraph}>
                  After careful review of your application, we regret to inform you that 
                  we cannot offer admission at this time.
                </Text>
                {rejectionReason && (
                  <Section style={reasonSection}>
                    <Text style={reasonTitle}>Reason for decision:</Text>
                    <Text style={reasonText}>"{rejectionReason}"</Text>
                  </Section>
                )}
                <Text style={paragraph}>
                  You may reapply for the next academic year or contact the admissions 
                  office for further clarification.
                </Text>
              </>
            )}
            
            <Hr style={hr} />
            
            <Text style={footer}>
              For questions, contact us at:<br />
              Phone: +237 671 657 357 | Email: admissions@stbernard.edu.cm<br />
              {schoolName} - Excellence in Education, Digital by Design
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, Helvetica, sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const headerSection = {
  backgroundColor: '#1e293b',
  padding: '30px 20px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  fontFamily: 'Georgia, serif',
};

const headerSubtitle = {
  color: '#cbd5e1',
  fontSize: '14px',
  marginTop: '8px',
};

const contentSection = {
  padding: '40px 30px',
};

const greeting = {
  color: '#1e293b',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
};

const paragraph = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '1.6',
  marginBottom: '20px',
};

const statusSection = (isApproved: boolean) => ({
  backgroundColor: isApproved ? '#dcfce7' : '#fee2e2',
  borderRadius: '8px',
  padding: '15px',
  textAlign: 'center' as const,
  marginBottom: '25px',
});

const statusText = {
  color: isApproved ? '#166534' : '#991b1b',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
};

const reasonSection = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '25px',
  borderLeft: '4px solid #f59e0b',
};

const reasonTitle = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: 'bold',
  marginBottom: '8px',
};

const reasonText = {
  color: '#78350f',
  fontSize: '15px',
  fontStyle: 'italic',
  margin: '0',
};

const button = {
  backgroundColor: '#f59e0b',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  marginTop: '10px',
};

const list = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '1.8',
  marginBottom: '25px',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '30px 0',
};

const footer = {
  color: '#64748b',
  fontSize: '12px',
  textAlign: 'center' as const,
  lineHeight: '1.5',
};