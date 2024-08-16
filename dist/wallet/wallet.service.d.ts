import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class WalletService {
    private readonly httpService;
    private configService;
    constructor(httpService: HttpService, configService: ConfigService);
    getWalletPortfolio(wallet: string): Promise<string>;
    getTopToken(): Promise<any>;
    getNewListings(): Promise<any>;
}