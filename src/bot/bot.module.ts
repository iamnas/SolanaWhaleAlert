import { Module } from '@nestjs/common';
import { AlertService } from 'src/alert/alert.service';
import { WalletService } from 'src/wallet/wallet.service';

@Module({})
export class BotModule {
  imports: [AlertService, WalletService];
}
