import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { LeadsController } from './leads/leads.controller';
import { LeadsService } from './leads/leads.service';
import { LeadValidationService } from './leads/lead-validation.service';
import { WebhooksController } from './webhooks/webhooks.controller';
import { CrmDistributionProcessor } from './queues/crm-distribution.processor';
import { IamAuthController } from './iam/iam-auth.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'crm-distribution-queue',
    }),
  ],
  controllers: [LeadsController, WebhooksController, IamAuthController],
  providers: [LeadsService, LeadValidationService, CrmDistributionProcessor],
})
export class AppModule {}
