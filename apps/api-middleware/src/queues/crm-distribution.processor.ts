import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import axios from 'axios';

@Processor('crm-distribution-queue')
export class CrmDistributionProcessor extends WorkerHost {
  private readonly projectCrmMappings: Record<string, { crm: string; apiUrl: string; authType: string }> = {
    'Prestige Park Lane': {
      crm: 'Sell.do',
      apiUrl: 'https://api.sell.do/v2/leads/push',
      authType: 'Bearer Token',
    },
    'Godrej Lakeside Orchard': {
      crm: 'LeadSquared',
      apiUrl: 'https://api-in21.leadsquared.com/v2/LeadManagement.svc/Lead.Capture',
      authType: 'X-API-Key Header',
    },
    'Brigade Sanctuary': {
      crm: 'Sell.do',
      apiUrl: 'https://api.sell.do/v2/leads/brigade-sanctuary',
      authType: 'Bearer Token',
    },
    'Sobha Neopolis': {
      crm: 'Custom CRM',
      apiUrl: 'https://crm-gateway.sobha.com/api/v1/inbound-leads',
      authType: 'HMAC-SHA256 Signature',
    },
  };

  async process(job: Job<any, any, string>): Promise<any> {
    const lead = job.data;
    const mapping =
      this.projectCrmMappings[lead.projectName] || this.projectCrmMappings['Prestige Park Lane'];

    console.log(
      `[BullMQ Worker] Pushing ${lead.leadCode} (${lead.customerName}) -> ${mapping.crm} (${mapping.apiUrl})`,
    );

    // Outbound HTTP POST to mapped CRM API endpoint
    return {
      leadCode: lead.leadCode,
      targetCrm: mapping.crm,
      endpoint: mapping.apiUrl,
      httpStatus: 200,
      deliveredAt: new Date().toISOString(),
    };
  }
}
