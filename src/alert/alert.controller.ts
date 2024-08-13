import { Body, Controller, Post } from '@nestjs/common';
import { AlertService } from './alert.service';
import { ConfigService } from '@nestjs/config';

@Controller('alert')
export class AlertController {
  private tokenLogs: string[] = [];
  constructor(
    private readonly alertService: AlertService,
    private configService: ConfigService,
  ) {}

  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    const signature = payload[0]?.signature;
    if (this.tokenLogs.includes(signature)) {
      return { message: 'Webhook already processed' };
    }

    const tokenTransfers = payload[0].tokenTransfers || [];

    for (const transfer of tokenTransfers) {
      if (
        transfer.tokenAmount >
          this.configService.get<number>('THRESHOLD_AMOUNT') &&
        transfer.mint === this.configService.get<string>('USDC_ADDRESS')
      ) {
        console.log(
          '************************************************************************************************',
        );
        console.log(`Signature : https://solscan.io/tx/${signature}`);
        console.log(
          `Logging transfer of ${transfer.tokenAmount} with signature ${signature}`,
        );
        console.log(`From: ${transfer.fromUserAccount}`);
        console.log(`To: ${transfer.toUserAccount}`);
        console.log(`Mint: ${transfer.mint}`);
        console.log(
          '************************************************************************************************',
        );

        // Send alert via Telegram
        await this.alertService.sendWhaleAlert(
          signature,
          transfer.tokenAmount,
          transfer.fromUserAccount,
          transfer.toUserAccount,
          transfer.mint,
        );

        this.tokenLogs.push(signature);
      }
    }

    return { message: 'Webhook received successfully' };
  }
}
