import { ConfigService } from '@nestjs/config';
import { AlertService } from 'src/alert/alert.service';
import { WalletService } from 'src/wallet/wallet.service';
export declare class BotService {
    private configService;
    private alertService;
    private walletService;
    private bot;
    private userState;
    constructor(configService: ConfigService, alertService: AlertService, walletService: WalletService);
    private sendWelcomeMessage;
    private sendHelpMessage;
    private handleCallback;
    private handleMessage;
    private requestWalletAddress;
    private requestTokenAddress;
    private sendWhaleAlert;
    private sendTopTokens;
    private sendNewListings;
    private sendWalletPortfolio;
    private sendTokenInformation;
    private sendCreateNewSolanaAddress;
    private isValidAddress;
}
