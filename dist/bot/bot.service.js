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
exports.BotService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const alert_service_1 = require("../alert/alert.service");
const wallet_service_1 = require("../wallet/wallet.service");
const telegraf_1 = require("telegraf");
const telegraf_2 = require("telegraf");
const web3_js_1 = require("@solana/web3.js");
let BotService = class BotService {
    constructor(configService, alertService, walletService) {
        this.configService = configService;
        this.alertService = alertService;
        this.walletService = walletService;
        this.bot = new telegraf_1.Telegraf(this.configService.get('TELEGRAM_TOKEN'));
        this.bot.start((ctx) => {
            ctx.reply('Welcome to SolanaWhaleWatch! 🚀\n\n' +
                'Here are the commands you can use to get the latest updates and insights:\n' +
                'Click on a button below to explore:\n', telegraf_2.Markup.inlineKeyboard([
                [
                    telegraf_2.Markup.button.callback('Top 10 Tokens 📈', 'top10'),
                    telegraf_2.Markup.button.callback('New Listings 🆕', 'newlistings'),
                ],
                [
                    telegraf_2.Markup.button.callback('Token Info 🔍', 'tokeninfo'),
                    telegraf_2.Markup.button.callback('Token Stats 📊', 'tokenstats'),
                ],
                [
                    telegraf_2.Markup.button.callback('Whale Alerts 🐋', 'whalealerts'),
                    telegraf_2.Markup.button.callback('Help 💡', 'help'),
                ],
                [telegraf_2.Markup.button.callback('💼 Wallet Portfolio 👜', 'portfolio')],
            ]));
        });
        const helpMessage = `Here are all the commands you can use:
  /top10 - Get the top 10 tokens by market cap and trading volume
  /newlistings - Get newly listed tokens on Solana
  /tokeninfo [address] - Get detailed information about a specific token by its address
  /tokenstats [address] - Get detailed token performance stats by its address
  /whalealerts - Get whale alerts for major token movements
  /portfolio [wallet] - Get the top tokens of the specified wallet
  /help - Show this help message

  Stay tuned for more updates! 🚀`;
        const helpKeyboard = telegraf_2.Markup.keyboard([
            ['📈 top10', '🆕 newlistings'],
            ['🔍 tokeninfo [address]', '📊 tokenstats [address]'],
            ['🐋 whalealerts', '💼 Wallet Portfolio 👜'],
            ['💡 help'],
        ])
            .resize()
            .oneTime();
        const sendHelpMessage = (ctx) => {
            ctx.reply(helpMessage, helpKeyboard);
        };
        const sendWhaleAlert = async (ctx) => {
            const message = await this.alertService.sendLastAlert();
            ctx.reply(message, { parse_mode: 'Markdown' });
        };
        const sendTopTokens = async (ctx) => {
            const message = await this.walletService.getTopToken();
            ctx.reply(message, { parse_mode: 'Markdown' });
        };
        const sendNewlistings = async (ctx) => {
            const message = await this.walletService.getNewListings();
            ctx.reply(message, { parse_mode: 'Markdown' });
        };
        const sendWalletPortfolio = async (ctx, wallet) => {
            const message = await this.walletService.getWalletPortfolio(wallet);
            ctx.reply(message, { parse_mode: 'Markdown' });
        };
        this.bot.command('help', sendHelpMessage);
        this.bot.hears('💡 help', (ctx) => {
            ctx.reply(helpMessage, helpKeyboard);
            ctx.deleteMessage();
        });
        this.bot.action('help', (ctx) => {
            ctx.reply(helpMessage, helpKeyboard);
            ctx.answerCbQuery();
        });
        this.bot.command('whalealerts', (ctx) => {
            sendWhaleAlert(ctx);
        });
        this.bot.action('whalealerts', (ctx) => {
            sendWhaleAlert(ctx);
            ctx.answerCbQuery();
        });
        this.bot.hears('Whale Alerts 🐋', (ctx) => {
            sendWhaleAlert(ctx);
            ctx.deleteMessage();
        });
        this.bot.command('top10', (ctx) => {
            sendTopTokens(ctx);
        });
        this.bot.action('top10', (ctx) => {
            sendTopTokens(ctx);
            ctx.answerCbQuery();
        });
        this.bot.hears('📈 top10', (ctx) => {
            sendTopTokens(ctx);
            ctx.deleteMessage();
        });
        this.bot.command('newlistings', (ctx) => {
            sendNewlistings(ctx);
        });
        this.bot.action('newlistings', (ctx) => {
            sendNewlistings(ctx);
            ctx.answerCbQuery();
        });
        this.bot.hears('New Listings 🆕', (ctx) => {
            sendNewlistings(ctx);
            ctx.deleteMessage();
        });
        this.bot.command('portfolio', (ctx) => {
            ctx.reply('Please enter your wallet address:');
            this.bot.on('text', async (ctx) => {
                const walletAddress = ctx.message.text;
                if (!this.isValidAddress(walletAddress)) {
                    ctx.reply('The wallet address provided is not valid. Please try again.');
                    return;
                }
                try {
                    await sendWalletPortfolio(ctx, walletAddress);
                }
                catch (error) {
                    ctx.reply('An error occurred while fetching your portfolio. Please try again later.');
                }
            });
        });
        this.bot.action('portfolio', (ctx) => {
            ctx.reply('Please enter your wallet address:');
            this.bot.on('text', async (ctx) => {
                const walletAddress = ctx.message.text;
                if (!this.isValidAddress(walletAddress)) {
                    ctx.reply('The wallet address provided is not valid. Please try again.');
                    return;
                }
                try {
                    await sendWalletPortfolio(ctx, walletAddress);
                    ctx.answerCbQuery();
                }
                catch (error) {
                    ctx.reply('An error occurred while fetching your portfolio. Please try again later.');
                }
            });
        });
        this.bot.hears('💼 Wallet Portfolio 👜', (ctx) => {
            ctx.reply('Please enter your wallet address:');
            this.bot.on('text', async (ctx) => {
                const walletAddress = ctx.message.text;
                if (!this.isValidAddress(walletAddress)) {
                    ctx.reply('The wallet address provided is not valid. Please try again.');
                    return;
                }
                try {
                    await sendWalletPortfolio(ctx, walletAddress);
                }
                catch (error) {
                    ctx.reply('An error occurred while fetching your portfolio. Please try again later.');
                }
            });
        });
        this.bot.command('tokeninfo', async (ctx) => {
            const tokenAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
            const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                const dexId = 'raydium';
                const pair = data?.pairs.length > 1
                    ? data?.pairs.find((pair) => pair.dexId === dexId)
                    : data?.pairs[0];
                const { baseToken, quoteToken, priceUsd, txns, volume, priceChange, liquidity, fdv, info, } = pair;
                const message = `
        📊 *Token Information for ${baseToken.name} (${baseToken.symbol})*

        🔗 *Pair Address:* [${pair.pairAddress}](${pair.url})
        💰 *Price:* $${parseFloat(priceUsd).toFixed(6)} / ${parseFloat(pair.priceNative).toFixed(8)} ${quoteToken.symbol}

        📈 *Price Change:*
        - Last 5 mins: ${priceChange.m5}%
        - Last 1 hour: ${priceChange.h1}%
        - Last 6 hours: ${priceChange.h6}%
        - Last 24 hours: ${priceChange.h24}%

        📊 *Transactions:*
        - 5 min: ${txns.m5.buys} buys, ${txns.m5.sells} sells
        - 1 hour: ${txns.h1.buys} buys, ${txns.h1.sells} sells
        - 24 hours: ${txns.h24.buys} buys, ${txns.h24.sells} sells

        💵 *Volume (24h):* ${volume.h24.toLocaleString()} USD
        💧 *Liquidity:*
        - Total: $${parseFloat(liquidity.usd).toLocaleString()}
        - Base: ${parseFloat(liquidity.base).toLocaleString()} ${baseToken.symbol}
        - Quote: ${parseFloat(liquidity.quote).toFixed(4)} ${quoteToken.symbol}

        🏦 *Fully Diluted Valuation (FDV):* $${fdv.toLocaleString()}

       🌐 *Links:*
         - [Website](${info?.websites[0]?.url})
        - [Twitter](${info?.socials?.find((s) => s.type === 'twitter')?.url})
        - [Telegram](${info?.socials?.find((s) => s.type === 'telegram')?.url})

        🖼️ *Token Image:* [View Image](${info.imageUrl})
                `;
                ctx.reply(message, { parse_mode: 'Markdown' });
            }
            catch (error) {
                console.error('Error fetching token data:', error);
                ctx.reply('Sorry, I could not retrieve the token information at this time.');
            }
        });
        this.bot.launch();
    }
    isValidAddress(walletAddress) {
        const address = new web3_js_1.PublicKey(walletAddress);
        return web3_js_1.PublicKey.isOnCurve(address);
    }
};
exports.BotService = BotService;
exports.BotService = BotService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        alert_service_1.AlertService,
        wallet_service_1.WalletService])
], BotService);
//# sourceMappingURL=bot.service.js.map