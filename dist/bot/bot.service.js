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
                    telegraf_2.Markup.button.callback('Whale Alerts 🐋', 'whalealerts'),
                    telegraf_2.Markup.button.callback('Create Wallet 🏦', 'createwallet'),
                ],
                [
                    telegraf_2.Markup.button.callback('Token Info 🔍', 'tokeninfo'),
                    telegraf_2.Markup.button.callback('Help 💡', 'help'),
                ],
            ]));
        });
        const helpMessage = `Here are all the commands you can use:
  /start - Welcome message and list of available commands
  /top10 - Get the top 10 tokens by market cap and trading volume
  /newlistings - Get newly listed tokens on Solana
  /createwallet - Create a new wallet address on Solana
  /whalealerts - Get whale alerts for major token movements
  /tokeninfo [address] - Get detailed information about a specific token by its address
  /help - Show this help message

  Stay tuned for more updates! 🚀`;
        const helpKeyboard = telegraf_2.Markup.keyboard([
            ['📈 top10', 'New Listings 🆕'],
            ['🐋 whalealerts', 'Create Wallet 🏦'],
            ['🔍 tokeninfo [address]', '💡 help'],
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
        const sendTokenInformation = async (ctx, tokenAddress) => {
            const message = await this.walletService.getTokenInformation(tokenAddress);
            ctx.reply(message, { parse_mode: 'Markdown' });
        };
        const sendCreateNewSolanaAddress = async (ctx) => {
            const message = await this.walletService.createNewSolanaAddress();
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
        this.bot.command('tokeninfo', async (ctx) => {
            ctx.reply('Please enter your token address');
            this.bot.on('text', async (ctx) => {
                const tokenAddress = ctx.message.text;
                sendTokenInformation(ctx, tokenAddress);
            });
        });
        this.bot.action('tokeninfo', async (ctx) => {
            ctx.reply('Please enter your token address');
            try {
                this.bot.on('text', async (ctx) => {
                    const tokenAddress = ctx.message.text;
                    await sendTokenInformation(ctx, tokenAddress);
                });
                ctx.answerCbQuery();
            }
            catch (error) {
                ctx.reply('An error occurred while fetching your portfolio. Please try again later.');
            }
        });
        this.bot.hears('🔍 tokeninfo [address]', async (ctx) => {
            ctx.reply('Please enter your token address');
            this.bot.on('text', async (ctx) => {
                const tokenAddress = ctx.message.text;
                sendTokenInformation(ctx, tokenAddress);
            });
        });
        this.bot.command('createwallet', async (ctx) => {
            sendCreateNewSolanaAddress(ctx);
        });
        this.bot.action('createwallet', async (ctx) => {
            sendCreateNewSolanaAddress(ctx);
            ctx.answerCbQuery();
        });
        this.bot.hears('Create Wallet 🏦', async (ctx) => {
            sendCreateNewSolanaAddress(ctx);
            ctx.deleteMessage();
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