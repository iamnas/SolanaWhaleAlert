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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertController = void 0;
const common_1 = require("@nestjs/common");
const alert_service_1 = require("./alert.service");
const config_1 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
const bullmq_1 = require("bullmq");
let AlertController = class AlertController {
    constructor(alertQueue, alertService, configService) {
        this.alertQueue = alertQueue;
        this.alertService = alertService;
        this.configService = configService;
        this.tokenLogs = [];
        this.THRESHOLD_AMOUNT = parseInt(this.configService.get('THRESHOLD_AMOUNT'));
    }
    async handleWebhook(payload) {
        const signature = payload[0]?.signature;
        if (this.tokenLogs.includes(signature)) {
            return { message: 'Webhook already processed' };
        }
        const tokenTransfers = payload[0].tokenTransfers || [];
        for (const transfer of tokenTransfers) {
            if (transfer.tokenAmount > this.THRESHOLD_AMOUNT &&
                transfer.mint === this.configService.get('USDC_ADDRESS')) {
                await this.alertQueue.add('sendWhaleAlert', {
                    signature,
                    amount: transfer.tokenAmount,
                    from: transfer.fromUserAccount,
                    to: transfer.toUserAccount,
                    mint: transfer.mint,
                });
                this.tokenLogs.push(signature);
            }
        }
        return { message: 'Webhook received successfully' };
    }
};
exports.AlertController = AlertController;
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlertController.prototype, "handleWebhook", null);
exports.AlertController = AlertController = __decorate([
    (0, common_1.Controller)('alert'),
    __param(0, (0, bull_1.InjectQueue)('alert-queue')),
    __metadata("design:paramtypes", [bullmq_1.Queue,
        alert_service_1.AlertService,
        config_1.ConfigService])
], AlertController);
//# sourceMappingURL=alert.controller.js.map