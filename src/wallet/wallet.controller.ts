import { Controller, Get, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}
  @Get('portfolio')
  async getWalletPortfolio(@Query('wallet') wallet: string) {
    return this.walletService.getWalletPortfolio(wallet);
  }

  @Get('toptoken')
  async getTopToken() {
    return this.walletService.getTopToken();
  }

  @Get('newlistings')
  async getNewListings() {
    return this.walletService.getNewListings();
  }
}
