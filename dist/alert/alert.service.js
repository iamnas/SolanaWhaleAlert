"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const telegraf_1 = require("telegraf");
let AlertService = class AlertService {
    constructor(configService) {
        this.configService = configService;
        this.lastAlertMessage = [];
        this.bot = new telegraf_1.Telegraf(this.configService.get('TELEGRAM_TOKEN'));
    }
    async sendWhaleAlert(signature, amount, from, to, mint) {
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
        await this.bot.telegram.sendMessage(this.configService.get('CHATID'), message, {
            parse_mode: 'Markdown',
        });
    }
    async sendLastAlert() {
        return (this.lastAlertMessage[this.lastAlertMessage.length - 1] ||
            'No alerts available.');
    }
};
exports.AlertService = AlertService;
exports.AlertService = AlertService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AlertService);
//# sourceMappingURL=alert.service.js.map