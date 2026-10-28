import { Controller, Post, Body, UnauthorizedException, ForbiddenException } from '@nestjs/common';

@Controller('api/iam')
export class IamAuthController {
  private whitelistedAccounts = [
    {
      role: 'Super Admin',
      name: 'Yashwant Pandit',
      googleEmail: 'superadmin@propstream.io',
      whatsappNumber: '+91 98450 00001',
      normalizedWhatsapp: '9845000001',
      githubHandle: 'yashwant-pandit',
      provisionedBy: 'System Root',
    },
    {
      role: 'Admin',
      name: 'Amit Agrawal',
      googleEmail: 'admin@propstream.io',
      whatsappNumber: '+91 98450 00002',
      normalizedWhatsapp: '9845000002',
      githubHandle: 'amit-agrawal-ops',
      provisionedBy: 'Yashwant Pandit (Super Admin)',
    },
    {
      role: 'Manager',
      name: 'Rajeshwari Iyer',
      googleEmail: 'manager@propstream.io',
      whatsappNumber: '+91 98450 00003',
      normalizedWhatsapp: '9845000003',
      githubHandle: 'rajeshwari-mgr',
      provisionedBy: 'Amit Agrawal (Admin)',
    },
    {
      role: 'Operations Team',
      name: 'Kiran Kumar',
      googleEmail: 'ops@propstream.io',
      whatsappNumber: '+91 98450 00004',
      normalizedWhatsapp: '9845000004',
      githubHandle: 'kiran-data-ops',
      provisionedBy: 'Amit Agrawal (Admin)',
    },
    {
      role: 'Sales Team',
      name: 'Sneha Reddy',
      googleEmail: 'sales@propstream.io',
      whatsappNumber: '+91 98450 00005',
      normalizedWhatsapp: '9845000005',
      githubHandle: 'sneha-luxury-desk',
      provisionedBy: 'Amit Agrawal (Admin)',
    },
  ];

  @Post('sso/google')
  loginWithGoogle(@Body() body: { googleEmail: string }) {
    const user = this.whitelistedAccounts.find(
      (u) => u.googleEmail.toLowerCase() === (body.googleEmail || '').toLowerCase(),
    );
    if (!user) {
      throw new UnauthorizedException(
        'Google Email is not whitelisted. Registration is restricted to Admin-assigned accounts only.',
      );
    }
    return { status: 'authenticated', provider: '1-Click Google SSO', user };
  }

  @Post('sso/whatsapp')
  loginWithWhatsapp(@Body() body: { whatsappNumber: string }) {
    const digits = String(body.whatsappNumber || '').replace(/\D/g, '').slice(-10);
    const user = this.whitelistedAccounts.find((u) => u.normalizedWhatsapp === digits);
    if (!user) {
      throw new UnauthorizedException(
        'WhatsApp number is not assigned by Admin. Self-registration is disabled.',
      );
    }
    return { status: 'authenticated', provider: '1-Click WhatsApp OTP', user };
  }

  @Post('admin/provision-user')
  provisionUserByAdmin(
    @Body()
    body: {
      actorRole: string;
      actorName: string;
      name: string;
      role: string;
      googleEmail: string;
      whatsappNumber: string;
    },
  ) {
    if (body.actorRole !== 'Super Admin' && body.actorRole !== 'Admin') {
      throw new ForbiddenException(
        'Only Super Admin or Admin can assign Google Email and WhatsApp numbers for registration.',
      );
    }
    const digits = String(body.whatsappNumber || '').replace(/\D/g, '').slice(-10);
    const newAccount = {
      role: body.role,
      name: body.name,
      googleEmail: body.googleEmail.toLowerCase(),
      whatsappNumber: body.whatsappNumber,
      normalizedWhatsapp: digits,
      githubHandle: body.name.toLowerCase().replace(/\s+/g, '-'),
      provisionedBy: `${body.actorName} (${body.actorRole})`,
    };
    this.whitelistedAccounts.push(newAccount);
    return { status: 'provisioned', account: newAccount };
  }
}
