import { PrismaClient, UserRole, LeadSource, LeadValidationStatus, CrmDeliveryStatus, DistributionMode } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Admin-Whitelisted RBAC Accounts...');
  const users = [
    {
      fullName: 'Yashwant Pandit',
      designation: 'Chief Architect & Super Admin',
      role: UserRole.SUPER_ADMIN,
      googleEmail: 'superadmin@propstream.io',
      whatsappNumber: '+91 98450 00001',
      normalizedWhatsapp: '9845000001',
      githubHandle: 'yashwant-pandit',
      passwordHash: 'Super@Prop2026!',
      provisionedBy: 'System Root'
    },
    {
      fullName: 'Amit Agrawal',
      designation: 'VP Operations & CRM Admin',
      role: UserRole.ADMIN,
      googleEmail: 'admin@propstream.io',
      whatsappNumber: '+91 98450 00002',
      normalizedWhatsapp: '9845000002',
      githubHandle: 'amit-agrawal-ops',
      passwordHash: 'Admin@Prop2026!',
      provisionedBy: 'Yashwant Pandit (Super Admin)'
    },
    {
      fullName: 'Rajeshwari Iyer',
      designation: 'Regional Sales Strategy Manager',
      role: UserRole.MANAGER,
      googleEmail: 'manager@propstream.io',
      whatsappNumber: '+91 98450 00003',
      normalizedWhatsapp: '9845000003',
      githubHandle: 'rajeshwari-mgr',
      passwordHash: 'Manager@Prop2026!',
      provisionedBy: 'Amit Agrawal (Admin)'
    },
    {
      fullName: 'Kiran Kumar',
      designation: 'Lead Data Operations Specialist',
      role: UserRole.OPERATIONS_TEAM,
      googleEmail: 'ops@propstream.io',
      whatsappNumber: '+91 98450 00004',
      normalizedWhatsapp: '9845000004',
      githubHandle: 'kiran-data-ops',
      passwordHash: 'Ops@Prop2026!',
      provisionedBy: 'Amit Agrawal (Admin)'
    },
    {
      fullName: 'Sneha Reddy',
      designation: 'Senior Property Advisor (Luxury Desk Alpha)',
      role: UserRole.SALES_TEAM,
      googleEmail: 'sales@propstream.io',
      whatsappNumber: '+91 98450 00005',
      normalizedWhatsapp: '9845000005',
      githubHandle: 'sneha-luxury-desk',
      passwordHash: 'Sales@Prop2026!',
      provisionedBy: 'Amit Agrawal (Admin)'
    }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { googleEmail: u.googleEmail },
      update: u,
      create: u
    });
  }

  console.log('Seeding Real Estate Projects & CRM Mappings...');
  const projects = [
    {
      projectCode: 'PRJ-01',
      projectName: 'Prestige Park Lane',
      developer: 'Prestige Group',
      location: 'Sarjapur Road, Bengaluru',
      crmAssigned: 'Sell.do',
      crmApiUrl: 'https://api.sell.do/v2/leads/push',
      crmApiKey: 'sld_live_88419a2f00e1',
      crmAuthType: 'Bearer Token',
      crmWebhookUrl: 'https://hooks.propstream.io/crm/selldo-cb',
      distributionMode: DistributionMode.REAL_TIME,
      cplEstimate: 1420,
      conversionRate: 5.4
    },
    {
      projectCode: 'PRJ-02',
      projectName: 'Godrej Lakeside Orchard',
      developer: 'Godrej Properties',
      location: 'Bellandur, Bengaluru',
      crmAssigned: 'LeadSquared',
      crmApiUrl: 'https://api-in21.leadsquared.com/v2/LeadManagement.svc/Lead.Capture',
      crmApiKey: 'lsq_prod_77310b9c12d4',
      crmAuthType: 'X-API-Key Header',
      crmWebhookUrl: 'https://hooks.propstream.io/crm/lsq-cb',
      distributionMode: DistributionMode.SCHEDULED,
      cplEstimate: 1680,
      conversionRate: 4.8
    },
    {
      projectCode: 'PRJ-03',
      projectName: 'Brigade Sanctuary',
      developer: 'Brigade Enterprises',
      location: 'Whitefield-Sarjapur, Bengaluru',
      crmAssigned: 'Sell.do',
      crmApiUrl: 'https://api.sell.do/v2/leads/brigade-sanctuary',
      crmApiKey: 'sld_live_55291c8e44a9',
      crmAuthType: 'Bearer Token',
      crmWebhookUrl: 'https://hooks.propstream.io/crm/brigade-cb',
      distributionMode: DistributionMode.REAL_TIME,
      cplEstimate: 1290,
      conversionRate: 6.1
    },
    {
      projectCode: 'PRJ-04',
      projectName: 'Sobha Neopolis',
      developer: 'Sobha Limited',
      location: 'Panathur Road, Bengaluru',
      crmAssigned: 'Custom CRM',
      crmApiUrl: 'https://crm-gateway.sobha.com/api/v1/inbound-leads',
      crmApiKey: 'hmac_sha256_sobha_9910',
      crmAuthType: 'HMAC-SHA256 Signature',
      crmWebhookUrl: 'https://hooks.propstream.io/crm/sobha-cb',
      distributionMode: DistributionMode.SCHEDULED,
      cplEstimate: 1890,
      conversionRate: 4.2
    }
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: { projectCode: p.projectCode },
      update: p,
      create: p
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
