// Types pour l'API de contact
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  source?: string;
}

export interface ContactAPIResponse {
  success: boolean;
  message: string;
  emailId?: string;
}

export interface ContactAPIError {
  error: string;
}

export interface EmailTemplateProps {
  name: string;
  email: string;
  phone: string;
  message: string;
  timestamp?: string;
  source?: string;
}
