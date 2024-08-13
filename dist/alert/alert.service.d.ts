import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class AlertService implements OnModuleInit {
    private configService;
    private bot;
    private readonly chatId;
    private readonly token;
    onModuleInit(): void;
    constructor(configService: ConfigService);
    sendWhaleAlert(signature: string, amount: number, from: string, to: string, mint: string): Promise<void>;
}
