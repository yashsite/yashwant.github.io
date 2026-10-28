import { Injectable } from '@nestjs/common';

export interface InboundLeadDto {
  customerName: string;
  phoneNumber: string;
  email?: string;
  projectName: string;
  leadSource: string;
  campaignName?: string;
  leadDate?: string;
  city?: string;
  budget?: string;
  remarks?: string;
  createdBy?: string;
}

@Injectable()
export class LeadValidationService {
  private readonly allowedSources = [
    'Google Sheets / Excel',
    'Meta Lead Ads',
    'Google Ads',
    'LinkedIn Lead Forms',
    'Apollo',
  ];

  normalizePhone(raw: string): string {
    if (!raw) return '';
    const digits = String(raw).replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : digits;
  }

  validateAndScore(dto: InboundLeadDto, existingDuplicateLeadCode?: string) {
    const errors: string[] = [];
    const normalizedPhone = this.normalizePhone(dto.phoneNumber);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 1. Blank & 10-digit Phone Validation
    if (!dto.phoneNumber || !dto.phoneNumber.trim()) {
      errors.push('Blank Phone Number');
    } else if (normalizedPhone.length !== 10) {
      errors.push(`Invalid Phone Length (${normalizedPhone.length} digits, expected 10)`);
    }

    // 2. Mandatory Columns Check
    if (!dto.customerName || !dto.customerName.trim()) {
      errors.push('Missing Mandatory Customer Name');
    }
    if (!dto.projectName || !dto.projectName.trim()) {
      errors.push('Missing Mandatory Project Name');
    }
    if (!this.allowedSources.includes(dto.leadSource)) {
      errors.push(`Disallowed Lead Source: ${dto.leadSource}`);
    }

    // 3. Optional Email Format Check
    if (dto.email && dto.email.trim() && !emailRegex.test(dto.email.trim())) {
      errors.push('Invalid Email Format');
    }

    // 4. Determine Status (Valid / Duplicate / Invalid)
    let status: 'VALID' | 'DUPLICATE' | 'INVALID' = 'VALID';
    if (errors.length > 0) {
      status = 'INVALID';
    } else if (existingDuplicateLeadCode) {
      status = 'DUPLICATE';
    }

    // 5. Compute Lead Quality Score (0-100)
    const sourceBaseScores: Record<string, number> = {
      'LinkedIn Lead Forms': 35,
      'Google Ads': 33,
      'Meta Lead Ads': 32,
      'Apollo': 30,
      'Google Sheets / Excel': 26,
    };
    let qualityScore = sourceBaseScores[dto.leadSource] || 25;
    if (normalizedPhone.length === 10) qualityScore += 25;
    if (dto.email && emailRegex.test(dto.email)) qualityScore += 15;
    if (dto.campaignName) qualityScore += 10;
    if (dto.budget) qualityScore += 15;

    if (status === 'DUPLICATE') qualityScore = Math.min(qualityScore, 35);
    if (status === 'INVALID') qualityScore = 15;

    const leadTier = qualityScore >= 88 ? 'Hot' : qualityScore >= 70 ? 'Warm' : 'Cold';

    return {
      status,
      errors,
      normalizedPhone,
      qualityScore,
      leadTier,
    };
  }
}
