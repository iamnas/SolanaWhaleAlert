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
const web3_js_1 = require("@solana/web3.js");
const axios_2 = require("axios");
const rxjs_1 = require("rxjs");
const bs58_1 = require("bs58");
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
                telegramMessage += `Name: \`${token.name}\`\n`;
                telegramMessage += `Balance: \`${token.uiAmount}\`\n`;
                telegramMessage += `Value: \`$${token.valueUsd.toFixed(2)}\`\n\n`;
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
            let telegramMessage = '*Top Tokens on Solana*\n\n';
            tokens.forEach((token, index) => {
                const formatValue = (value) => {
                    const formattedValue = value && value >= 1000
                        ? `$${(value / 1e3).toFixed(2)}K`
                        : `$${value?.toFixed(2) || '0'}`;
                    return `\`${formattedValue}\``;
                };
                telegramMessage += `📈 *${index + 1}. ${token.name} (${token.symbol})*\n`;
                telegramMessage += `**Address**: [🅵](https://dexscreener.com/solana/${token.address}) \`${token.address}\`\n`;
                telegramMessage += `**Market Cap**: ${formatValue(token.mc)}\n`;
                telegramMessage += `**Liquidity**: ${formatValue(token.liquidity)}\n`;
                telegramMessage += `**24h Volume**: ${formatValue(token.v24hUSD)} (${token.v24hChangePercent?.toFixed(2)}%)\n\n`;
            });
            return telegramMessage;
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
            let telegramMessage = '*New Listings on Solana*\n\n';
            items.forEach((item, index) => {
                const formatValue = (value) => {
                    const formattedValue = value && value >= 1000
                        ? `$${(value / 1e3).toFixed(2)}K`
                        : `$${value?.toFixed(2) || '0'}`;
                    return `\`${formattedValue}\``;
                };
                telegramMessage += `*${index + 1}. ${item.name || 'Unknown'} (${item.symbol || 'N/A'})*\n`;
                telegramMessage += `**Address**: [🅵](https://dexscreener.com/solana/${item.address})\`${item.address}\`\n`;
                telegramMessage += `**Liquidity**: ${formatValue(item.liquidity)}\n`;
                telegramMessage += `🔗 [Quick Buy Link](https://t.me/achilles_trojanbot?start=r-naseth-${item.address})\n\n`;
            });
            return telegramMessage;
        }
        catch (error) {
            console.error(error);
            throw new common_1.HttpException('An error occurred while fetching the data.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTokenInformation(tokenAddress) {
        try {
            const response = await axios_2.default.get(`https://api.rugcheck.xyz/v1/tokens/${tokenAddress}/report`);
            const data = response.data;
            const tokenPriceData = await axios_2.default.get(`https://price.jup.ag/v4/price?ids=${tokenAddress}`);
            const tokenPrice = tokenPriceData?.data?.data[tokenAddress].price || 0;
            const markets = data.markets
                .slice(0, 5)
                .map((market) => {
                return (`📈 *Market:* ${market?.marketType?.toUpperCase().replace(/_/g, '\\_')}\n` +
                    `💧 *LP Mint:* \`${market?.lp?.lpMint}\`\n` +
                    `💰 *Liquidity:* \`$${(market?.lp?.quoteUSD + market?.lp?.baseUSD).toLocaleString()}\`\n` +
                    `🔒 *LP Locked:* \`${market?.lp?.lpLockedPct?.toFixed(2)}%\``);
            })
                .join('\n\n');
            const tokenOverview = `*💡 Token Overview* \n` +
                `* Name:* \`${data.tokenMeta.name}\`\n` +
                `* Symbol:* \`${data.tokenMeta.symbol}\`\n` +
                `* 🪙 Mint Address:* \`${data.mint}\`\n` +
                `* 💵 Supply:* \`${(data.token.supply / Math.pow(10, data.token.decimals)).toLocaleString()} ${data.tokenMeta.symbol}\`\n` +
                `* 👤 Creator:* \`${data.creator}\`\n` +
                `* 🏷️ Market Cap:* \`$${(data.token.supply * tokenPrice).toLocaleString()}\`\n` +
                `* 🔒 LP Locked:* \`${data.markets[0].lp.lpLockedPct.toFixed(2)}%\``;
            const topHoldersData = data.topHolders.slice(0, 5);
            const totalTopHoldersPct = topHoldersData.reduce((acc, holder) => acc + holder.pct, 0);
            const topHolders = topHoldersData
                .map((holder) => {
                const ownerShort = `${holder.owner}`;
                const amountInMillions = (holder.uiAmount / 1_000_000).toFixed(2);
                return `*Account* \`${ownerShort}\` \n*Amount* ${amountInMillions}M  \n*Percentage* ${holder.pct.toFixed(2)}% \n`;
            })
                .join('\n');
            const riskLevel = data.score === 0 ? '🔴 *Risk:*' : '🟢 *Good*';
            const riskAnalysis = data.risks
                .map((risk) => {
                return `⚠️ *${risk.level.toUpperCase()}*: ${risk.name} - ${risk.description}`;
            })
                .join('\n');
            const sections = `\n ${tokenOverview}` +
                `\n\n📊 *Markets* \n${markets}` +
                `\n\n👥 *Top Holders* (${totalTopHoldersPct.toFixed(2)}%) \n${topHolders}` +
                `\n🔍 *Risk Analysis* \n📊 *Status:* *${data.score}* ${riskLevel} \n\`${riskAnalysis}\``;
            return sections;
        }
        catch (error) {
            console.error('Error fetching token info:', error);
            return 'Failed to fetch token info. Please try again later.';
        }
    }
    async createNewSolanaAddress() {
        try {
            const newKeyPair = web3_js_1.Keypair.generate();
            const pubkey = new web3_js_1.PublicKey(newKeyPair.publicKey);
            const privateKey = bs58_1.default.encode(newKeyPair.secretKey);
            const message = `
        *🔑 Public Key:* \`${pubkey}\`

        *🔒 Private Key:* \`${privateKey}\`

        ⚠️ *Warning:* Keep your private key secure and do not share it with anyone. If someone has access to your private key, they can control your funds.
      `;
            return message;
        }
        catch (error) {
            console.log(error);
            return 'Something went wrong, please try again later.';
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