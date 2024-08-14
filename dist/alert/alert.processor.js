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
exports.AlertProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const bullmq_1 = require("bullmq");
const alert_service_1 = require("./alert.service");
let AlertProcessor = class AlertProcessor {
    constructor(alertService) {
        this.alertService = alertService;
    }
    async handleSendWhaleAlert(job) {
        const { signature, amount, from, to, mint } = job.data;
        await this.alertService.sendWhaleAlert(signature, amount, from, to, mint);
    }
};
exports.AlertProcessor = AlertProcessor;
__decorate([
    (0, bull_1.Process)('sendWhaleAlert'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_1.Job]),
    __metadata("design:returntype", Promise)
], AlertProcessor.prototype, "handleSendWhaleAlert", null);
exports.AlertProcessor = AlertProcessor = __decorate([
    (0, bull_1.Processor)('alert-queue'),
    __metadata("design:paramtypes", [alert_service_1.AlertService])
], AlertProcessor);
//# sourceMappingURL=alert.processor.js.map