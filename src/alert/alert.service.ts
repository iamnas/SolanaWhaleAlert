import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class AlertService implements OnModuleInit {
  private bot: TelegramBot;
  private readonly chatId = this.configService.get('CHATID');
  private readonly token = this.configService.get('TELEGRAM_TOKEN');

  onModuleInit() {
    this.bot = new TelegramBot(this.token, { polling: true });

    this.bot.on('message', (msg) => {
      this.bot.sendMessage(msg.chat.id, 'Whale Alert bot is running!');
    });
  }

  constructor(private configService: ConfigService) {}

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

    await this.bot.sendMessage(this.chatId, message, {
      parse_mode: 'Markdown',
    });
  }
}
