import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class AlertService {
  private bot: Telegraf;
  private lastAlertMessage: string[] = [];

  constructor(private configService: ConfigService) {
    this.bot = new Telegraf(this.configService.get('TELEGRAM_TOKEN'));
  }

  async sendWhaleAlert(
    signature: string,
    amount: number,
    from: string,
    to: string,
    mint: string,
  ) {
    const message = `
🚨 *Whale Alert* 🚨

💸 *Transaction*: [🅃](https://solscan.io/tx/${signature}) \`${signature}\`

💰 *Amount*: \`${amount.toLocaleString()} USDC \`

🔄 *From*: [🅵](https://solscan.io/account/${from}) \`${from}\`

🔜 *To*: [🅸](https://solscan.io/account/${to}) \`${to}\`

💳 *Mint*: [🅼](https://solscan.io/token/${mint}) \`${mint}\`

👥 *Join our Telegram group*: [@whalealert](https://t.me/whalealert)
💡 
`;

    this.lastAlertMessage.push(message);
    // await this.botService.sendWhaleAlert(message);
    await this.bot.telegram.sendMessage(
      this.configService.get('CHATID'),
      message,
      {
        parse_mode: 'Markdown',
      },
    );
  }

  async sendLastAlert() {
    return (
      this.lastAlertMessage[this.lastAlertMessage.length - 1] ||
      'No alerts available.'
    );
  }
}
