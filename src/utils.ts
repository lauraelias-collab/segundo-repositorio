import { Client, Appointment, MessageTemplate } from './types';

/**
 * Formats a YYYY-MM-DD string into Brazilian format DD/MM/YYYY
 */
export function formatDateToBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Formats a YYYY-MM-DD string to short format DD/MM
 */
export function formatDateToShort(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}`;
}

/**
 * Clean phone numbers to keep only digits. If brazilian format without country code, add 55
 */
export function cleanPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 || cleaned.length === 10) {
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }
  }
  return cleaned;
}

/**
 * Replaces tags like {cliente}, {pet}, etc. in template text with actual data
 */
export function parseTemplate(
  templateContent: string,
  client: Client,
  appointment: Appointment
): string {
  let text = templateContent;
  
  const substitutions: { [key: string]: string } = {
    '{cliente}': client.name,
    '{email}': client.email,
    '{pet}': client.petName,
    '{raca}': client.petBreed || 'Sem raça definida',
    '{porte}': client.petSize,
    '{data}': formatDateToBR(appointment.date),
    '{hora}': appointment.time,
    '{servico}': appointment.service,
    '{preco}': appointment.price.toFixed(2),
  };

  Object.entries(substitutions).forEach(([tag, value]) => {
    // Escaping tag regex safely
    const escapedTag = tag.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    text = text.replace(new RegExp(escapedTag, 'g'), value);
  });

  return text;
}

/**
 * Creates a WhatsApp Api / Send link
 */
export function generateWhatsAppLink(phone: string, text: string): string {
  const cleanedPhone = cleanPhoneNumber(phone);
  return `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encodeURIComponent(text)}`;
}

/**
 * Format currency in Brazilian Real
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
