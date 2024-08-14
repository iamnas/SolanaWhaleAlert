import { ConfigService } from '@nestjs/config';
export declare class AlertService {
    private configService;
    private bot;
    private lastAlertMessage;
    constructor(configService: ConfigService);
    sendWhaleAlert(signature: string, amount: number, from: string, to: string, mint: string): Promise<void>;
    sendLastAlert(): Promise<string>;
}
