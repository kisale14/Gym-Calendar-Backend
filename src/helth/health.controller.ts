import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service.js';

@Controller('health')
export class HealthController {
    constructor(private helthService: HealthService){}

    @Get()
    async checkConecctionDB(): Promise <{ status: String}> {
        const message = await this.helthService.testConecction();
        return { status: message }
    }
}
