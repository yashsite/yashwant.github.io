import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { InboundLeadDto } from './lead-validation.service';

@Controller('api')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * Required API 1: Fetch Leads
   * GET /api/leads?project=&source=&startDate=&endDate=&crmStatus=
   */
  @Get('leads')
  async getLeads(
    @Query('project') project?: string,
    @Query('source') source?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('crmStatus') crmStatus?: string,
  ) {
    return this.leadsService.fetchLeads({ project, source, startDate, endDate, crmStatus });
  }

  /**
   * Required API 2: Lead Count API
   * GET /api/leads/count?month=&project=&source=
   */
  @Get('leads/count')
  async getLeadsCount(
    @Query('month') month?: string,
    @Query('project') project?: string,
    @Query('source') source?: string,
  ) {
    return this.leadsService.getLeadCounts({ month, project, source });
  }

  /**
   * Required API 3: Project Dashboard API
   * GET /api/project/dashboard
   * Returns: Total Leads, Monthly Leads, Today's Leads, Source Breakdown
   */
  @Get('project/dashboard')
  async getProjectDashboard(@Query('project') project?: string) {
    return this.leadsService.getExecutiveDashboardMetrics(project);
  }

  /**
   * Bulk Upload Endpoint (Source 1: Excel / CSV / Google Sheets Sync)
   */
  @Post('leads/bulk-upload')
  async bulkUploadLeads(@Body() body: { rows: InboundLeadDto[]; uploadedBy: string }) {
    return this.leadsService.processBulkImport(body.rows, body.uploadedBy);
  }
}
