import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LeadValidationService, InboundLeadDto } from './lead-validation.service';

@Injectable()
export class LeadsService {
  private leadsStore: any[] = [];

  constructor(
    private readonly validationService: LeadValidationService,
    @InjectQueue('crm-distribution-queue') private readonly crmQueue: Queue,
  ) {}

  async ingestSingleLead(dto: InboundLeadDto, createdBy = 'Webhook Engine') {
    const normPhone = this.validationService.normalizePhone(dto.phoneNumber);
    const existingDup = this.leadsStore.find(
      (l) =>
        l.normalizedPhone === normPhone &&
        normPhone.length === 10 &&
        l.projectName.toLowerCase() === (dto.projectName || '').toLowerCase() &&
        l.status !== 'INVALID',
    );

    const validation = this.validationService.validateAndScore(
      dto,
      existingDup ? existingDup.leadCode : undefined,
    );

    const leadRecord = {
      leadCode: `LD-${1001 + this.leadsStore.length}`,
      customerName: dto.customerName,
      phoneNumber: dto.phoneNumber,
      normalizedPhone: validation.normalizedPhone,
      email: dto.email || null,
      projectName: dto.projectName,
      leadSource: dto.leadSource,
      campaignName: dto.campaignName || 'Direct',
      leadDate: dto.leadDate || new Date().toISOString().slice(0, 10),
      importDate: new Date().toISOString(),
      status: validation.status,
      qualityScore: validation.qualityScore,
      leadTier: validation.leadTier,
      crmStatus: validation.status === 'VALID' ? 'PENDING' : 'FAILED',
      assignedTeam: validation.status === 'VALID' ? 'Luxury Desk Alpha' : 'Unassigned',
      createdBy,
      duplicateOfId: existingDup ? existingDup.leadCode : null,
      errors: validation.errors,
    };

    this.leadsStore.unshift(leadRecord);

    if (validation.status === 'VALID') {
      // Enqueue for Mode 1 Real-Time (1-5s) or Mode 2 Scheduled Cron Push
      await this.crmQueue.add('push-lead-to-crm', leadRecord, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      });
    }

    return { leadRecord, validation };
  }

  async processBulkImport(rows: InboundLeadDto[], uploadedBy = 'Operations Team') {
    const results = [];
    for (const row of rows) {
      const res = await this.ingestSingleLead(row, uploadedBy);
      results.push(res);
    }
    return {
      totalProcessed: rows.length,
      validImported: results.filter((r) => r.validation.status === 'VALID').length,
      duplicatesFlagged: results.filter((r) => r.validation.status === 'DUPLICATE').length,
      invalidBlocked: results.filter((r) => r.validation.status === 'INVALID').length,
      results,
    };
  }

  async fetchLeads(filters: {
    project?: string;
    source?: string;
    startDate?: string;
    endDate?: string;
    crmStatus?: string;
  }) {
    return this.leadsStore.filter((l) => {
      if (filters.project && l.projectName !== filters.project) return false;
      if (filters.source && l.leadSource !== filters.source) return false;
      if (filters.crmStatus && l.crmStatus !== filters.crmStatus) return false;
      if (filters.startDate && l.leadDate < filters.startDate) return false;
      if (filters.endDate && l.leadDate > filters.endDate) return false;
      return true;
    });
  }

  async getLeadCounts(filters: { month?: string; project?: string; source?: string }) {
    const matching = this.leadsStore.filter((l) => {
      if (filters.month && !String(l.leadDate).startsWith(filters.month)) return false;
      if (filters.project && l.projectName !== filters.project) return false;
      if (filters.source && l.leadSource !== filters.source) return false;
      return true;
    });
    return {
      totalCount: matching.length,
      validCount: matching.filter((l) => l.status === 'VALID').length,
      duplicateCount: matching.filter((l) => l.status === 'DUPLICATE').length,
    };
  }

  async getExecutiveDashboardMetrics(project?: string) {
    const today = new Date().toISOString().slice(0, 10);
    const currentMonth = today.slice(0, 7);
    const list = project ? this.leadsStore.filter((l) => l.projectName === project) : this.leadsStore;

    const sourceBreakdown: Record<string, number> = {
      'Google Sheets / Excel': 0,
      'Meta Lead Ads': 0,
      'Google Ads': 0,
      'LinkedIn Lead Forms': 0,
      'Apollo': 0,
    };
    list.forEach((l) => {
      if (sourceBreakdown[l.leadSource] !== undefined) {
        sourceBreakdown[l.leadSource]++;
      }
    });

    return {
      totalLeads: list.length,
      monthlyLeads: list.filter((l) => String(l.leadDate).startsWith(currentMonth)).length,
      todaysLeads: list.filter((l) => l.leadDate === today).length,
      sourceBreakdown,
    };
  }
}
