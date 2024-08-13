import { AlertService } from './alert.service';
import { ConfigService } from '@nestjs/config';
export declare class AlertController {
    private readonly alertService;
    private configService;
    private tokenLogs;
    private readonly THRESHOLD_AMOUNT;
    constructor(alertService: AlertService, configService: ConfigService);
    handleWebhook(payload: any): Promise<{
        message: string;
    }>;
}
