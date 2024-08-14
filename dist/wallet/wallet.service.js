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
exports.WalletService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let WalletService = class WalletService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
    }
    async getWalletPortfolio(wallet) {
        const options = {
            headers: {
                'x-chain': 'solana',
                'X-API-KEY': this.configService.get('BIRDEYE_API_KEY'),
            },
        };
        const URL = `${this.configService.get('BIRDEYE_URL')}${wallet}`;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(URL, options));
            const topTokens = response?.data?.data?.items?.slice(0, 10);
            let telegramMessage = `*Top 10 Tokens for Wallet:* \`${wallet}\`\n\n`;
            topTokens.forEach((token, index) => {
                telegramMessage += `*${index + 1}. ${token.symbol}* `;
                telegramMessage += `[🅵](https://solscan.io/token/${token.address})\n`;
                telegramMessage += `Name: ${token.name}\n`;
                telegramMessage += `Balance: ${token.uiAmount}\n`;
                telegramMessage += `Value: $${token.valueUsd.toFixed(2)}\n\n`;
            });
            return telegramMessage;
        }
        catch (error) {
            console.error(error);
            throw new common_1.HttpException('An error occurred while fetching the data.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTopToken() {
        const options = {
            method: 'GET',
            headers: {
                'x-chain': 'solana',
                'X-API-KEY': this.configService.get('BIRDEYE_API_KEY'),
            },
        };
        const URL = this.configService.get('BIRDEYE_TOP_TOKEN_URL');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(URL, options));
            const tokens = response?.data?.data?.tokens;
            const formattedTokens = tokens.map((token) => {
                const formatValue = (value) => {
                    return value && value >= 1000
                        ? `$${(value / 1e3).toFixed(2)}K`
                        : `$${value?.toFixed(2) || '0'}`;
                };
                return `
      📈 ${token.name} (${token.symbol}) | ${token.address} (${formatValue(token.liquidity)} SOL)
      Market Cap: ${formatValue(token.mc)}
      Liquidity: ${formatValue(token.liquidity)}
      Volume 24h: ${formatValue(token.v24hUSD)} (${token.v24hChangePercent?.toFixed(2)}%)
      🔗 [Quick Buy Link](https://t.me/achilles_trojanbot?start=r-naseth-${token.address})
        `;
            });
            return formattedTokens;
        }
        catch (error) {
            console.error(error);
            throw new common_1.HttpException('An error occurred while fetching the data.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getNewListings() {
        try {
            const options = {
                method: 'GET',
                headers: {
                    'x-chain': 'solana',
                    'X-API-KEY': this.configService.get('BIRDEYE_API_KEY'),
                },
            };
            const URL = this.configService.get('BIRDEYE_NEW_LIST_URL');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(URL, options));
            const items = response?.data?.data?.items;
            const formattedListings = items.map((item) => {
                return `
          🚀 ${item.name || 'Unknown'} (${item.symbol || 'N/A'}) | ${item.address}
          Liquidity: $${item.liquidity.toFixed(2)}
          🔗 [Quick Buy Link](https://t.me/achilles_trojanbot?start=r-naseth-${item.address})
        `;
            });
            return formattedListings;
        }
        catch (error) {
            console.error(error);
            throw new common_1.HttpException('An error occurred while fetching the data.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map