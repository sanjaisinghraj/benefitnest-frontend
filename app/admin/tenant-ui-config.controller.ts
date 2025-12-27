import { Controller, Post, Body } from '@nestjs/common';
import { TenantUIConfigService } from './tenant-ui-config.service';

@Controller('api/admin/tenant-ui-config')
export class TenantUIConfigController {
  constructor(private readonly service: TenantUIConfigService) {}

  @Post('save')
  async save(@Body() body: { tenantId: string; config: any }) {
    return this.service.save(body.tenantId, body.config);
  }
}
