import { ConfigService } from '@nestjs/config';
import { AlertService } from 'src/alert/alert.service';
import { WalletService } from 'src/wallet/wallet.service';
export declare class BotService {
    private configService;
    private alertService;
    private walletService;
    private bot;
    constructor(configService: ConfigService, alertService: AlertService, walletService: WalletService);
    isValidAddress(walletAddress: string): boolean;
}
