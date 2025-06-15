import * as React from 'react';

interface ContactEmailProps {
  name: string;
  email: string;
  phone: string;
  message: string;
  timestamp?: string;
  source?: string;
}

export const ContactEmailTemplate: React.FC<ContactEmailProps> = ({
  name,
  email,
  phone,
  message,
  timestamp = new Date().toLocaleString('fr-FR'),
  source = 'Pricing Page'
}) => (
  <div style={{
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden'
  }}>    
  {/* Header */}
    <div style={{
      backgroundColor: '#f8fafc',
      borderBottom: '2px solid #e2e8f0',
      padding: '30px 20px',
      textAlign: 'center' as const
    }}>
      <h1 style={{
        color: '#1e293b',
        fontSize: '24px',
        fontWeight: '700',
        margin: '0',
        marginBottom: '8px'
      }}>
        📧 Nouvelle demande de contact
      </h1>
      <p style={{
        color: '#475569',
        fontSize: '14px',
        margin: '0'
      }}>
        Une nouvelle demande a été reçue via {source}
      </p>
    </div>

    {/* Content */}
    <div style={{ padding: '30px 20px' }}>
      {/* Contact Info */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h2 style={{
          color: '#1e293b',
          fontSize: '18px',
          fontWeight: '600',
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center'
        }}>
          👤 Informations du contact
        </h2>
        
        <div style={{ marginBottom: '12px' }}>
          <strong style={{ color: '#475569', fontSize: '14px' }}>Nom :</strong>
          <div style={{ 
            color: '#1e293b', 
            fontSize: '16px', 
            fontWeight: '500',
            marginTop: '4px'
          }}>
            {name}
          </div>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <strong style={{ color: '#475569', fontSize: '14px' }}>Email :</strong>
          <div style={{ 
            color: '#1e293b', 
            fontSize: '16px',
            marginTop: '4px'
          }}>
            <a href={`mailto:${email}`} style={{
              color: '#4f46e5',
              textDecoration: 'none'
            }}>
              {email}
            </a>
          </div>
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <strong style={{ color: '#475569', fontSize: '14px' }}>Téléphone :</strong>
          <div style={{ 
            color: '#1e293b', 
            fontSize: '16px',
            marginTop: '4px'
          }}>
            <a href={`tel:${phone}`} style={{
              color: '#4f46e5',
              textDecoration: 'none'
            }}>
              {phone}
            </a>
          </div>
        </div>
        
        <div>
          <strong style={{ color: '#475569', fontSize: '14px' }}>Date de contact :</strong>
          <div style={{ 
            color: '#1e293b', 
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {timestamp}
          </div>
        </div>
      </div>

      {/* Message */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h2 style={{
          color: '#1e293b',
          fontSize: '18px',
          fontWeight: '600',
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center'
        }}>
          💬 Message
        </h2>
        <div style={{
          color: '#374151',
          fontSize: '15px',
          lineHeight: '1.6',
          backgroundColor: '#f9fafb',
          padding: '16px',
          borderRadius: '6px',
          border: '1px solid #f3f4f6',
          whiteSpace: 'pre-wrap' as const
        }}>
          {message}
        </div>
      </div>      
      
      {/* Action Buttons */}
      <div style={{
        textAlign: 'center' as const,
        marginBottom: '20px'
      }}>       
       <a
          href={`mailto:${email}?subject=Re: Votre demande de contact - Subleet`}
          style={{
            display: 'inline-block',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
            margin: '4px 6px'
          }}
        >
          📧 Répondre par email
        </a>
        <a
          href={`tel:${phone}`}
          style={{
            display: 'inline-block',
            backgroundColor: '#10b981',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
            margin: '4px 6px'
          }}
        >
          📞 Appeler
        </a>
      </div>
    </div>

    {/* Footer */}
    <div style={{
      backgroundColor: '#f8fafc',
      padding: '20px',
      textAlign: 'center' as const,
      borderTop: '1px solid #e2e8f0'
    }}>
      <div style={{
        color: '#94a3b8',
        fontSize: '11px'
      }}>
        🤖 Subleet Dashboard
      </div>
    </div>
  </div>
);

// Template HTML pour l'envoi d'email (version string)
export const generateContactEmailHTML = (props: ContactEmailProps): string => {
  const {
    name,
    email,
    phone,
    message,
    timestamp = new Date().toLocaleString('fr-FR'),
    source = 'Pricing Page'
  } = props;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle demande de contact - Subleet</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">          <!-- Header -->
        <div style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 30px 20px; text-align: center;">
            <h1 style="color: #1e293b; font-size: 24px; font-weight: 700; margin: 0; margin-bottom: 8px;">
                📧 Nouvelle demande de contact
            </h1>
            <p style="color: #475569; font-size: 14px; margin: 0;">
                Une nouvelle demande a été reçue via ${source}
            </p>
        </div>

        <!-- Content -->
        <div style="padding: 30px 20px;">
            
            <!-- Contact Info -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h2 style="color: #1e293b; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
                    👤 Informations du contact
                </h2>
                
                <div style="margin-bottom: 12px;">
                    <strong style="color: #475569; font-size: 14px;">Nom :</strong>
                    <div style="color: #1e293b; font-size: 16px; font-weight: 500; margin-top: 4px;">
                        ${name}
                    </div>
                </div>
                  <div style="margin-bottom: 12px;">
                    <strong style="color: #475569; font-size: 14px;">Email :</strong>
                    <div style="color: #1e293b; font-size: 16px; margin-top: 4px;">
                        <a href="mailto:${email}" style="color: #4f46e5; text-decoration: none;">
                            ${email}
                        </a>
                    </div>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <strong style="color: #475569; font-size: 14px;">Téléphone :</strong>
                    <div style="color: #1e293b; font-size: 16px; margin-top: 4px;">
                        <a href="tel:${phone}" style="color: #4f46e5; text-decoration: none;">
                            ${phone}
                        </a>
                    </div>
                </div>
                
                <div>
                    <strong style="color: #475569; font-size: 14px;">Date de contact :</strong>
                    <div style="color: #1e293b; font-size: 14px; margin-top: 4px;">
                        ${timestamp}
                    </div>
                </div>
            </div>

            <!-- Message -->
            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h2 style="color: #1e293b; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
                    💬 Message
                </h2>
                <div style="color: #374151; font-size: 15px; line-height: 1.6; background-color: #f9fafb; padding: 16px; border-radius: 6px; border: 1px solid #f3f4f6; white-space: pre-wrap;">
                    ${message}
                </div>
            </div>            <!-- Action Buttons -->
            <div style="text-align: center; margin-bottom: 20px;">
                <a href="mailto:${email}?subject=Re: Votre demande de contact - Subleet" 
                   style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 4px 6px;">
                    📧 Répondre par email
                </a>
                <a href="tel:${phone}" 
                   style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 4px 6px;">
                    📞 Appeler
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <div style="color: #94a3b8; font-size: 11px;">
                🤖 Subleet Dashboard
            </div>
        </div>
    </div>
</body>
</html>
  `.trim();
};

// Template texte simple pour les clients email qui ne supportent pas le HTML
export const generateContactEmailText = (props: ContactEmailProps): string => {
  const {
    name,
    email,
    phone,
    message,
    timestamp = new Date().toLocaleString('fr-FR'),
    source = 'Pricing Page'
  } = props;

  return `
NOUVELLE DEMANDE DE CONTACT - Subleet
======================================

📧 Une nouvelle demande a été reçue via ${source}

INFORMATIONS DU CONTACT
----------------------
👤 Nom: ${name}
📧 Email: ${email}
📞 Téléphone: ${phone}
🕒 Date: ${timestamp}

MESSAGE
-------
${message}

---
🤖 Subleet Dashboard
  `.trim();
};

export default ContactEmailTemplate;