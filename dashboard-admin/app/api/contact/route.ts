import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateContactEmailHTML, generateContactEmailText } from '@/app/components/email-contact-template';
import { ContactFormData} from '@/app/types/contact';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Vérifier que la clé API est présente
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY non configurée');
      return NextResponse.json(
        { error: 'Service email non configuré' },
        { status: 500 }
      );
    }

    // Vérifier le Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type doit être application/json' },
        { status: 400 }
      );
    }

    // Parser le JSON avec gestion d'erreur
    let body: ContactFormData;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      return NextResponse.json(
        { error: 'Données JSON invalides' },
        { status: 400 }
      );
    }

    // Validation des données
    if (!body.name || !body.email || !body.phone || !body.message) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toLocaleString('fr-FR', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailProps = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      message: body.message,
      timestamp,
      source: body.source || 'Default'
    };

    // Génération du contenu HTML et texte
    const htmlContent = generateContactEmailHTML(emailProps);
    const textContent = generateContactEmailText(emailProps);

    // Envoi de l'email avec Resend
    const emailResponse = await resend.emails.send({
      from: 'Contact <contact@contact.subleet.com>',
      to: ['contact@subleet.com'],
      replyTo: body.email,
      subject: `Nouvelle demande de contact - ${body.name}`,
      html: htmlContent,
      text: textContent,      
      headers: {
        'X-Contact-Source': body.source || 'Default',
        'X-Contact-Email': body.email,
        'X-Contact-Name': body.name,
        'X-Contact-Phone': body.phone
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Votre message a été envoyé avec succès. Nous vous recontacterons bientôt !',
      emailId: emailResponse.data?.id
    });
    
  } catch (error) {
    console.error('Erreur dans l\'API contact:', error);
    
    // Gestion des erreurs spécifiques à Resend
    if (error instanceof Error) {
      // Erreurs spécifiques Resend
      if (error.message.includes('API key') || error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'Erreur de configuration du service email' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
        return NextResponse.json(
          { error: 'Trop de tentatives. Veuillez réessayer dans quelques minutes.' },
          { status: 429 }
        );
      }

      if (error.message.includes('domain') || error.message.includes('verified')) {
        return NextResponse.json(
          { error: 'Erreur de configuration du domaine email' },
          { status: 500 }
        );
      }

      // Retourner l'erreur spécifique en développement
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(
          { error: `Erreur Resend: ${error.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const hasApiKey = !!process.env.RESEND_API_KEY;
  
  return NextResponse.json({
    message: 'API de contact',
    timestamp: new Date().toISOString(),
    route: 'contact'
  });
}
