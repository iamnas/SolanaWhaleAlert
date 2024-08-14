import { AlertService } from './alert.service';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
export declare class AlertController {
    private readonly alertQueue;
    private readonly alertService;
    private configService;
    private tokenLogs;
    private readonly THRESHOLD_AMOUNT;
    constructor(alertQueue: Queue, alertService: AlertService, configService: ConfigService);
    handleWebhook(payload: any): Promise<{
        message: string;
    }>;
}
