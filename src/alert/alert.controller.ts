// import { Body, Controller, Post } from '@nestjs/common';
// import { AlertService } from './alert.service';
// import { ConfigService } from '@nestjs/config';
// import { InjectQueue } from '@nestjs/bull';
// import { Queue } from 'bullmq';

// @Controller('alert')
// export class AlertController {
//   private tokenLogs: string[] = [];
//   private readonly THRESHOLD_AMOUNT: number;

//   constructor(
//     @InjectQueue('alert-queue') private readonly alertQueue: Queue,
//     private readonly alertService: AlertService,
//     private configService: ConfigService,
//     // private THRESHOLD_AMOUNT = this.configService.get('THRESHOLD_AMOUNT'),
//   ) {
//     this.THRESHOLD_AMOUNT = parseInt(
//       this.configService.get('THRESHOLD_AMOUNT'),
//     );
//   }

//   @Post('webhook')
//   async handleWebhook(@Body() payload: any) {
//     const signature = payload[0]?.signature;

//     if (this.tokenLogs.includes(signature)) {
//       return { message: 'Webhook already processed' };
//     }

//     const tokenTransfers = payload[0].tokenTransfers || [];

//     for (const transfer of tokenTransfers) {
//       if (
//         transfer.tokenAmount > this.THRESHOLD_AMOUNT &&
//         transfer.mint === this.configService.get<string>('USDC_ADDRESS')
//       ) {
//         await this.alertQueue.add('sendWhaleAlert', {
//           signature,
//           amount: transfer.tokenAmount,
//           from: transfer.fromUserAccount,
//           to: transfer.toUserAccount,
//           mint: transfer.mint,
//         });

//         // Send alert via Telegram
//         // await this.alertService.sendWhaleAlert(
//         //   signature,
//         //   transfer.tokenAmount,
//         //   transfer.fromUserAccount,
//         //   transfer.toUserAccount,
//         //   transfer.mint,
//         // );

//         this.tokenLogs.push(signature);
//       }
//     }

//     return { message: 'Webhook received successfully' };
//   }
// }
