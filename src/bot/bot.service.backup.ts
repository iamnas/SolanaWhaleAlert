// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { AlertService } from 'src/alert/alert.service';
// import { WalletService } from 'src/wallet/wallet.service';
// import { Context, Telegraf, Markup, session } from 'telegraf';
// import { PublicKey } from '@solana/web3.js';

// @Injectable()
// export class BotService {
//   private bot: Telegraf;

//   private userState = {};

//   constructor(
//     private configService: ConfigService,
//     private alertService: AlertService,
//     private walletService: WalletService,
//   ) {
//     this.bot = new Telegraf(this.configService.get('TELEGRAM_TOKEN'));

//     this.bot.use(session());

//     this.bot.start((ctx) => {
//       ctx.reply(
//         'Welcome to SolanaWhaleWatch! 🚀\n\n' +
//           'Here are the commands you can use to get the latest updates and insights:\n' +
//           'Click on a button below to explore:\n',
//         Markup.inlineKeyboard([
//           [
//             Markup.button.callback('Top 10 Tokens 📈', 'top10'),
//             Markup.button.callback('New Listings 🆕', 'newlistings'),
//           ],

//           [
//             Markup.button.callback('💼 Wallet Portfolio 👜', 'portfolio'),
//             Markup.button.callback('Token Info 🔍', 'tokeninfo'),
//           ],

//           [
//             Markup.button.callback('Whale Alerts 🐋', 'whalealerts'),
//             Markup.button.callback('Create Wallet 🏦', 'createwallet'),
//           ],
//           [
//             // Markup.button.callback('Token Info 🔍', 'tokeninfo'),
//             Markup.button.callback('Help 💡', 'help'),
//           ],
//         ]),
//       );
//     });

//     const helpMessage = `Here are all the commands you can use:
//     /start - Welcome message and list of available commands
//     /top10 - Get the top 10 tokens by market cap and trading volume
//     /newlistings - Get newly listed tokens on Solana
//     /createwallet - Create a new wallet address on Solana
//     /whalealerts - Get whale alerts for major token movements
//     /portfolio [wallet] - Get the top tokens of the specified wallet
//     /tokeninfo [address] - Get detailed information about a specific token by its address
//     /help - Show this help message
//     Stay tuned for more updates! 🚀`;

//     // '💼 Wallet Portfolio 👜',
//     // ['🔍 tokeninfo [address]'],
//     // Define the keyboard layout
//     const helpKeyboard = Markup.keyboard([
//       ['📈 top10', 'New Listings 🆕'],
//       ['🐋 whalealerts', 'Create Wallet 🏦'],
//       ['🔍 tokeninfo [address]', '💼 Wallet Portfolio 👜'],
//       ['💡 help'],
//     ])
//       .resize()
//       .oneTime();

//     // Function to send message
//     const sendHelpMessage = (ctx: Context) => {
//       ctx.reply(helpMessage, helpKeyboard);
//     };

//     const sendWhaleAlert = async (ctx: Context) => {
//       const message = await this.alertService.sendLastAlert();
//       ctx.reply(message, { parse_mode: 'Markdown' });
//     };

//     const sendTopTokens = async (ctx: Context) => {
//       const message = await this.walletService.getTopToken();
//       ctx.reply(message, { parse_mode: 'Markdown' });
//     };

//     const sendNewlistings = async (ctx: Context) => {
//       const message = await this.walletService.getNewListings();
//       ctx.reply(message, { parse_mode: 'Markdown' });
//     };

//     const sendWalletPortfolio = async (ctx: Context, wallet: string) => {
//       const message = await this.walletService.getWalletPortfolio(wallet);
//       ctx.reply(message, { parse_mode: 'Markdown' });
//     };

//     const sendTokenInformation = async (ctx: Context, tokenAddress: string) => {
//       const sections =
//         await this.walletService.getTokenInformation(tokenAddress);
//       ctx.reply(sections, { parse_mode: 'Markdown' });
//     };

//     const sendCreateNewSolanaAddress = async (ctx: Context) => {
//       const message = await this.walletService.createNewSolanaAddress();
//       ctx.reply(message, { parse_mode: 'Markdown' });
//     };

//     // Handle /help command
//     this.bot.command('help', sendHelpMessage);

//     // Handle 💡 help message
//     this.bot.hears('💡 help', (ctx) => {
//       ctx.reply(helpMessage, helpKeyboard);
//       ctx.deleteMessage();
//     });

//     // Handle callback queries for help
//     this.bot.action('help', (ctx) => {
//       ctx.reply(helpMessage, helpKeyboard);
//       ctx.answerCbQuery();
//     });

//     this.bot.command('whalealerts', (ctx) => {
//       sendWhaleAlert(ctx);
//     });

//     this.bot.action('whalealerts', (ctx) => {
//       sendWhaleAlert(ctx);
//       ctx.answerCbQuery();
//     });

//     this.bot.hears('Whale Alerts 🐋', (ctx) => {
//       sendWhaleAlert(ctx);
//       ctx.deleteMessage();
//     });

//     this.bot.command('top10', (ctx) => {
//       sendTopTokens(ctx);
//     });

//     this.bot.action('top10', (ctx) => {
//       sendTopTokens(ctx);
//       ctx.answerCbQuery();
//     });

//     this.bot.hears('📈 top10', (ctx) => {
//       sendTopTokens(ctx);
//       ctx.deleteMessage();
//     });

//     this.bot.command('newlistings', (ctx) => {
//       sendNewlistings(ctx);
//     });

//     this.bot.action('newlistings', (ctx) => {
//       sendNewlistings(ctx);
//       ctx.answerCbQuery();
//     });

//     this.bot.hears('New Listings 🆕', (ctx) => {
//       sendNewlistings(ctx);
//       ctx.deleteMessage();
//     });

//     this.bot.command('portfolio', (ctx) => {
//       ctx.reply('Please enter your wallet address:');
//       // Listen for the user's next message, which should be the wallet address
//       this.userState[ctx.chat.id] = { waitingFor: 'portfolio' };
//       // this.bot.on('text', async (ctx) => {
//       //   const walletAddress = ctx.message.text;

//       //   // Validate the wallet address format if necessary
//       //   if (!this.isValidAddress(walletAddress)) {
//       //     ctx.reply(
//       //       'The wallet address provided is not valid. Please try again.',
//       //     );
//       //     return;
//       //   }

//       //   // Call the API with the provided wallet address
//       //   try {
//       //     await sendWalletPortfolio(ctx, walletAddress);
//       //   } catch (error) {
//       //     ctx.reply(
//       //       'An error occurred while fetching your portfolio. Please try again later.',
//       //     );
//       //   }
//       // });
//     });

//     this.bot.action('portfolio', (ctx) => {
//       ctx.reply('Please enter your wallet address:');
//       // Listen for the user's next message, which should be the wallet address
//       this.userState[ctx.chat.id] = { waitingFor: 'portfolio' };
//       // ctx.answerCbQuery();

//       // this.bot.on('text', async (ctx) => {
//       //   const walletAddress = ctx.message.text;

//       //   // Validate the wallet address format if necessary
//       //   if (!this.isValidAddress(walletAddress)) {
//       // ctx.reply(
//       //   'The wallet address provided is not valid. Please try again.',
//       // );
//       //     return;
//       //   }

//       //   // Call the API with the provided wallet address
//       //   try {
//       //     await sendWalletPortfolio(ctx, walletAddress);
//       //     await ctx.answerCbQuery();
//       //   } catch (error) {
//       //     ctx.reply(
//       //       'An error occurred while fetching your portfolio. Please try again later.',
//       //     );
//       //   }
//       // });
//     });

//     this.bot.hears('💼 Wallet Portfolio 👜', (ctx) => {
//       ctx.reply('Please enter your wallet address:');
//       // Listen for the user's next message, which should be the wallet address
//       this.bot.on('text', async (ctx) => {
//         const walletAddress = ctx.message.text;

//         // Validate the wallet address format if necessary
//         if (!this.isValidAddress(walletAddress)) {
//           ctx.reply(
//             'The wallet address provided is not valid. Please try again.',
//           );
//           return;
//         }

//         // Call the API with the provided wallet address
//         try {
//           await sendWalletPortfolio(ctx, walletAddress);
//         } catch (error) {
//           ctx.reply(
//             'An error occurred while fetching your portfolio. Please try again later.',
//           );
//         }
//       });
//     });

//     this.bot.command('tokeninfo', async (ctx) => {
//       ctx.reply('Please enter your token address');

//       this.userState[ctx.chat.id] = { waitingFor: 'tokeninfo' };

//       // this.bot.on('message', async (x) => {
//       //   const tokenAddress = x.message.text;
//       //   sendTokenInformation(x, tokenAddress);
//       // });
//     });

//     this.bot.action('tokeninfo', async (ctx) => {
//       ctx.reply('Please enter your token address');
//       this.userState[ctx.chat.id] = { waitingFor: 'tokeninfo' };
//       ctx.session.currentCommand = 'tokeninfo';
//       // ctx.answerCbQuery();

//       // try {
//       //   this.bot.on('text', async (x) => {
//       //     const tokenAddress = x.message.text;
//       //     await sendTokenInformation(x, tokenAddress);
//       //   });
//       // } catch (error) {
//       //   ctx.reply(
//       //     'An error occurred while fetching your portfolio. Please try again later.',
//       //   );
//       // }
//     });

//     this.bot.hears('🔍 tokeninfo [address]', async (ctx) => {
//       ctx.reply('Please enter your token address');
//       this.userState[ctx.chat.id] = { waitingFor: 'tokeninfo' };

//       // this.bot.on('text', async (x) => {
//       //   const tokenAddress = x.message.text;
//       //   sendTokenInformation(x, tokenAddress);
//       //   // ctx.deleteMessage();
//       // });
//     });

//     this.bot.command('createwallet', async (ctx) => {
//       sendCreateNewSolanaAddress(ctx);
//     });

//     this.bot.action('createwallet', async (ctx) => {
//       sendCreateNewSolanaAddress(ctx);
//       ctx.answerCbQuery();
//     });

//     this.bot.hears('Create Wallet 🏦', async (ctx) => {
//       sendCreateNewSolanaAddress(ctx);
//       ctx.deleteMessage();
//     });

//     this.bot.on('message', async (ctx) => {
//       const userState = this.userState[ctx.chat.id];

//       if (userState) {
//         // Ensure ctx.message exists and is a text message before accessing text property
//         if (!ctx.message || !('text' in ctx.message)) {
//           return ctx.reply('Please send a valid text message.');
//         }

//         const walletAddress = ctx.message.text; // Access text once verified

//         if (userState.waitingFor === 'tokeninfo') {
//           await sendTokenInformation(ctx, walletAddress);
//           ctx.answerCbQuery();
//         } else if (userState.waitingFor === 'portfolio') {
//           if (!this.isValidAddress(walletAddress)) {
//             ctx.reply(
//               'The wallet address provided is not valid. Please try again.',
//             );
//           }
//           await sendWalletPortfolio(ctx, walletAddress);
//           ctx.answerCbQuery();

//           // ctx.reply(`Portfolio for ${walletAddress}: ${portfolio}`);
//         }
//         // todo
//         // else if (userState.waitingFor === 'createtoken') {
//         //   const tokenDetails = walletAddress; // Assuming walletAddress is used for token details
//         //   const result = await this.createToken(tokenDetails);
//         //   ctx.reply(`Token created: ${result}`);
//         // }

//         // Clear state after handling
//         delete this.userState[ctx.chat.id];
//       }
//     });

//     this.bot.launch();
//   }

//   // Utility function to validate wallet address format (optional)
//   isValidAddress(walletAddress: string): boolean {
//     const address = new PublicKey(walletAddress);
//     return PublicKey.isOnCurve(address);
//   }
// }
