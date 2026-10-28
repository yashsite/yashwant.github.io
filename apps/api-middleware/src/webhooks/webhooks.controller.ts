import { Controller, Post, Get, Body, Query, Headers } from '@nestjs/common';
import { LeadsService } from '../leads/leads.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly leadsService: LeadsService) {}

  // Source 2: Meta Lead Ads (Facebook & Instagram Lead Forms Webhook Verification)
  @Get('meta')
  verifyMetaWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
      return challenge;
    }
    return 'Forbidden';
  }

  // Source 2: Meta Lead Ads Inbound Payload
  @Post('meta')
  async handleMetaLeadWebhook(@Body() payload: any) {
    return this.leadsService.ingestSingleLead(
      {
        customerName: payload.customer_name || payload.full_name,
        phoneNumber: payload.phone_number,
        email: payload.email,
        projectName: payload.project_name || 'Prestige Park Lane',
        leadSource: 'Meta Lead Ads',
        campaignName: payload.campaign_name || 'Meta_Lead_Form',
        budget: payload.budget,
      },
      'Meta Graph Webhook',
    );
  }

  // Source 3: Google Ads Lead Form Extension Webhook
  @Post('google-ads')
  async handleGoogleAdsWebhook(@Body() payload: any) {
    return this.leadsService.ingestSingleLead(
      {
        customerName: payload.customer_name,
        phoneNumber: payload.phone_number,
        email: payload.email,
        projectName: payload.project_name || 'Godrej Lakeside Orchard',
        leadSource: 'Google Ads',
        campaignName: payload.campaign_id || 'Google_Ads_Lead_Extension',
      },
      'Google Ads Webhook',
    );
  }

  // Source 4: LinkedIn Lead Gen Forms Marketing API Webhook
  @Post('linkedin')
  async handleLinkedInWebhook(@Body() payload: any) {
    return this.leadsService.ingestSingleLead(
      {
        customerName: payload.customer_name,
        phoneNumber: payload.phone_number,
        email: payload.email,
        projectName: payload.project_name || 'Sobha Neopolis',
        leadSource: 'LinkedIn Lead Forms',
        campaignName: payload.campaign_name || 'LinkedIn_Sponsored_Form',
      },
      'LinkedIn Marketing API',
    );
  }

  // Source 5: Apollo Leads API Sync Webhook
  @Post('apollo')
  async handleApolloWebhook(@Body() payload: any, @Headers('x-apollo-signature') sig?: string) {
    return this.leadsService.ingestSingleLead(
      {
        customerName: payload.customer_name,
        phoneNumber: payload.phone_number,
        email: payload.email,
        projectName: payload.project_name || 'Brigade Sanctuary',
        leadSource: 'Apollo',
        campaignName: payload.campaign_name || 'Apollo_B2B_Enrichment',
      },
      'Apollo API Sync',
    );
  }
}
