import { WalletService } from './wallet.service';
export declare class WalletController {
    private walletService;
    constructor(walletService: WalletService);
    getWalletPortfolio(wallet: string): Promise<string>;
    getTopToken(): Promise<any>;
    getNewListings(): Promise<any>;
}