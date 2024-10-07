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
const web3_js_1 = require("@solana/web3.js");
let BotService = class BotService {
    constructor(configService, alertService, walletService) {
        this.configService = configService;
        this.alertService = alertService;
        this.walletService = walletService;
        this.userState = {};
        this.sendWelcomeMessage = (ctx) => {
            ctx.reply('Welcome to SolanaWhaleWatch! 🚀\n\n' +
                'Here are the commands you can use to get the latest updates and insights:\n' +
                'Click on a button below to explore:\n', telegraf_1.Markup.inlineKeyboard([
                [
                    telegraf_1.Markup.button.callback('Top 10 Tokens 📈', 'top10'),
                    telegraf_1.Markup.button.callback('New Listings 🆕', 'newlistings'),
                ],
                [
                    telegraf_1.Markup.button.callback('💼 Wallet Portfolio 👜', 'portfolio'),
                    telegraf_1.Markup.button.callback('Token Info 🔍', 'tokeninfo'),
                ],
                [
                    telegraf_1.Markup.button.callback('Whale Alerts 🐋', 'whalealerts'),
                    telegraf_1.Markup.button.callback('Create Wallet 🏦', 'createwallet'),
                ],
                [telegraf_1.Markup.button.callback('Help 💡', 'help')],
            ]));
        };
        this.sendHelpMessage = (ctx) => {
            const helpMessage = `Here are all the commands you can use:
    /start - Welcome message and list of available commands
    /top10 - Get the top 10 tokens by market cap and trading volume
    /newlistings - Get newly listed tokens on Solana
    /createwallet - Create a new wallet address on Solana
    /whalealerts - Get whale alerts for major token movements
    /portfolio [wallet] - Get the top tokens of the specified wallet
    /tokeninfo [address] - Get detailed information about a specific token by its address
    /help - Show this help message
    Stay tuned for more updates! 🚀`;
            const helpKeyboard = telegraf_1.Markup.keyboard([
                ['📈 top10', 'New Listings 🆕'],
                ['🐋 whalealerts', 'Create Wallet 🏦'],
                ['🔍 tokeninfo [address]', '💼 Wallet Portfolio 👜'],
                ['💡 help'],
            ])
                .resize()
                .oneTime();
            ctx.reply(helpMessage, helpKeyboard);
        };
        this.handleCallback = (ctx, callback) => {
            callback(ctx);
            ctx.answerCbQuery();
        };
        this.handleMessage = async (ctx) => {
            const userState = this.userState[ctx.chat.id];
            if (userState && ctx.message && 'text' in ctx.message) {
                const userMessage = ctx.message.text.trim();
                const { waitingFor } = userState;
                try {
                    if (waitingFor === 'portfolio' && this.isValidAddress(userMessage)) {
                        await this.sendWalletPortfolio(ctx, userMessage);
                    }
                    else if (waitingFor === 'tokeninfo') {
                        await this.sendTokenInformation(ctx, userMessage);
                    }
                    else {
                        ctx.reply('Invalid input. Please try again.');
                    }
                }
                catch (error) {
                    ctx.reply('Error occurred while processing your request. Please try again.');
                }
                delete this.userState[ctx.chat.id];
            }
        };
        this.requestWalletAddress = (ctx) => {
            ctx.reply('Please enter your wallet address:');
            this.userState[ctx.chat.id] = { waitingFor: 'portfolio' };
        };
        this.requestTokenAddress = (ctx) => {
            ctx.reply('Please enter your token address:');
            this.userState[ctx.chat.id] = { waitingFor: 'tokeninfo' };
        };
        this.sendWhaleAlert = async (ctx) => {
            const message = await this.alertService.sendLastAlert();
            ctx.reply(message, { parse_mode: 'Markdown' });
        };
        this.sendTopTokens = async (ctx) => {
            const message = await this.walletService.getTopToken();
            ctx.reply(message, { parse_mode: 'Markdown' });
        };
        this.sendNewListings = async (ctx) => {
            const message = await this.walletService.getNewListings();
            ctx.reply(message, { parse_mode: 'Markdown' });
        };
        this.sendWalletPortfolio = async (ctx, wallet) => {
            const message = await this.walletService.getWalletPortfolio(wallet);
            ctx.reply(message, { parse_mode: 'Markdown' });
        };
        this.sendTokenInformation = async (ctx, tokenAddress) => {
            const sections = await this.walletService.getTokenInformation(tokenAddress);
            ctx.reply(sections, { parse_mode: 'Markdown' });
        };
        this.sendCreateNewSolanaAddress = async (ctx) => {
            const message = await this.walletService.createNewSolanaAddress();
            ctx.reply(message, { parse_mode: 'Markdown' });
        };
        this.isValidAddress = (walletAddress) => {
            try {
                const address = new web3_js_1.PublicKey(walletAddress);
                return web3_js_1.PublicKey.isOnCurve(address);
            }
            catch (e) {
                return false;
            }
        };
        this.bot = new telegraf_1.Telegraf(this.configService.get('TELEGRAM_TOKEN'));
        this.bot.start((ctx) => this.sendWelcomeMessage(ctx));
        this.bot.command('help', (ctx) => this.sendHelpMessage(ctx));
        this.bot.command('whalealerts', (ctx) => this.sendWhaleAlert(ctx));
        this.bot.command('top10', (ctx) => this.sendTopTokens(ctx));
        this.bot.command('newlistings', (ctx) => this.sendNewListings(ctx));
        this.bot.command('portfolio', (ctx) => this.requestWalletAddress(ctx));
        this.bot.command('tokeninfo', (ctx) => this.requestTokenAddress(ctx));
        this.bot.command('createwallet', (ctx) => this.sendCreateNewSolanaAddress(ctx));
        this.bot.action('top10', (ctx) => this.handleCallback(ctx, this.sendTopTokens));
        this.bot.action('newlistings', (ctx) => this.handleCallback(ctx, this.sendNewListings));
        this.bot.action('portfolio', (ctx) => this.handleCallback(ctx, this.requestWalletAddress));
        this.bot.action('tokeninfo', (ctx) => this.handleCallback(ctx, this.requestTokenAddress));
        this.bot.action('whalealerts', (ctx) => this.handleCallback(ctx, this.sendWhaleAlert));
        this.bot.action('createwallet', (ctx) => this.handleCallback(ctx, this.sendCreateNewSolanaAddress));
        this.bot.action('help', (ctx) => this.sendHelpMessage(ctx));
        this.bot.on('message', (ctx) => this.handleMessage(ctx));
        this.bot.launch();
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