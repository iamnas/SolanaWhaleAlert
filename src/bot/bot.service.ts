// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { AlertService } from 'src/alert/alert.service';
// import { WalletService } from 'src/wallet/wallet.service';
// import { Context, Telegraf, Markup } from 'telegraf';
// import { PublicKey } from '@solana/web3.js';

// @Injectable()
// export class BotService {
//   private bot: Telegraf;
//   private userState = {}; // To track what each user is waiting for

//   constructor(
//     private configService: ConfigService,
//     private alertService: AlertService,
//     private walletService: WalletService,
//   ) {
//     // Initialize the bot with the token from the config service
//     this.bot = new Telegraf(this.configService.get('TELEGRAM_TOKEN'));

//     // Define the main /start command
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
//           [Markup.button.callback('Help 💡', 'help')],
//         ]),
//       );
//     });

//     // Help message text
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

//     // Define the keyboard layout for help command
//     // const helpKeyboard = Markup.keyboard([
//     //   ['📈 top10', 'New Listings 🆕'],
//     //   ['🐋 whalealerts', 'Create Wallet 🏦'],
//     //   ['🔍 tokeninfo [address]', '💼 Wallet Portfolio 👜'],
//     //   ['💡 help'],
//     // ])
//     //   .resize()
//     //   .oneTime();

//     // Send Help Message
//     const sendHelpMessage = (ctx: Context) => {
//       ctx.reply(helpMessage);
//     };

//     // Various helper methods to send specific information
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

//     // Command handlers
//     this.bot.command('help', sendHelpMessage);

//     this.bot.command('whalealerts', (ctx) => {
//       sendWhaleAlert(ctx);
//     });

//     this.bot.command('top10', (ctx) => {
//       sendTopTokens(ctx);
//     });

//     this.bot.command('newlistings', (ctx) => {
//       sendNewlistings(ctx);
//     });

//     this.bot.command('portfolio', (ctx) => {
//       ctx.reply('Please enter your wallet address:');
//       this.userState[ctx.chat.id] = { waitingFor: 'portfolio' }; // Track user input state
//     });

//     this.bot.command('tokeninfo', async (ctx) => {
//       ctx.reply('Please enter your token address');
//       this.userState[ctx.chat.id] = { waitingFor: 'tokeninfo' };
//     });

//     this.bot.command('createwallet', async (ctx) => {
//       sendCreateNewSolanaAddress(ctx);
//     });

//     // Button action handlers
//     this.bot.action('top10', (ctx) => {
//       sendTopTokens(ctx);
//       ctx.answerCbQuery();
//     });

//     this.bot.action('newlistings', (ctx) => {
//       sendNewlistings(ctx);
//       ctx.answerCbQuery();
//     });

//     this.bot.action('portfolio', (ctx) => {
//       ctx.reply('Please enter your wallet address:');
//       this.userState[ctx.chat.id] = { waitingFor: 'portfolio' };
//       ctx.answerCbQuery();
//     });

//     this.bot.action('tokeninfo', async (ctx) => {
//       ctx.reply('Please enter your token address');
//       this.userState[ctx.chat.id] = { waitingFor: 'tokeninfo' };
//       ctx.answerCbQuery();
//     });

//     this.bot.action('whalealerts', (ctx) => {
//       sendWhaleAlert(ctx);
//       ctx.answerCbQuery();
//     });

//     this.bot.action('createwallet', async (ctx) => {
//       sendCreateNewSolanaAddress(ctx);
//       ctx.answerCbQuery();
//     });

//     this.bot.action('help', (ctx) => {
//       sendHelpMessage(ctx);
//       ctx.answerCbQuery();
//     });

//     // Handle all user messages based on state (waiting for wallet address or token address)
//     this.bot.on('message', async (ctx) => {
//       const userState = this.userState[ctx.chat.id];

//       if (userState && ctx.message && 'text' in ctx.message) {
//         const userMessage = ctx.message.text.trim();

//         if (userState.waitingFor === 'portfolio') {
//           if (this.isValidAddress(userMessage)) {
//             try {
//               await sendWalletPortfolio(ctx, userMessage);
//             } catch (error) {
//               ctx.reply(
//                 'Error occurred while fetching the portfolio. Please try again.',
//               );
//             }
//           } else {
//             ctx.reply('Invalid wallet address. Please try again.');
//           }
//           delete this.userState[ctx.chat.id]; // Clear state after processing
//         } else if (userState.waitingFor === 'tokeninfo') {
//           try {
//             await sendTokenInformation(ctx, userMessage);
//           } catch (error) {
//             ctx.reply(
//               'Error occurred while fetching token info. Please try again.',
//             );
//           }
//           delete this.userState[ctx.chat.id]; // Clear state after processing
//         }
//       }
//     });

//     // Launch the bot
//     this.bot.launch();
//   }
//   // Utility function to validate wallet address format
//   isValidAddress(walletAddress: string): boolean {
//     try {
//       const address = new PublicKey(walletAddress);
//       return PublicKey.isOnCurve(address);
//     } catch (e) {
//       return false;
//     }
//   }
// }

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AlertService } from 'src/alert/alert.service';
import { WalletService } from 'src/wallet/wallet.service';
import { Context, Telegraf, Markup } from 'telegraf';
import { PublicKey } from '@solana/web3.js';

@Injectable()
export class BotService {
  private bot: Telegraf;
  private userState = {}; // To track what each user is waiting for

  constructor(
    private configService: ConfigService,
    private alertService: AlertService,
    private walletService: WalletService,
  ) {
    // Initialize the bot with the token from the config service
    this.bot = new Telegraf(this.configService.get('TELEGRAM_TOKEN'));

    // Start the bot with a welcome message and keyboard
    this.bot.start((ctx) => this.sendWelcomeMessage(ctx));

    // Command handlers
    this.bot.command('help', (ctx) => this.sendHelpMessage(ctx));
    this.bot.command('whalealerts', (ctx) => this.sendWhaleAlert(ctx));
    this.bot.command('top10', (ctx) => this.sendTopTokens(ctx));
    this.bot.command('newlistings', (ctx) => this.sendNewListings(ctx));
    this.bot.command('portfolio', (ctx) => this.requestWalletAddress(ctx));
    this.bot.command('tokeninfo', (ctx) => this.requestTokenAddress(ctx));
    this.bot.command('createwallet', (ctx) =>
      this.sendCreateNewSolanaAddress(ctx),
    );

    // Button action handlers
    this.bot.action('top10', (ctx) =>
      this.handleCallback(ctx, this.sendTopTokens),
    );
    this.bot.action('newlistings', (ctx) =>
      this.handleCallback(ctx, this.sendNewListings),
    );
    this.bot.action('portfolio', (ctx) =>
      this.handleCallback(ctx, this.requestWalletAddress),
    );
    this.bot.action('tokeninfo', (ctx) =>
      this.handleCallback(ctx, this.requestTokenAddress),
    );
    this.bot.action('whalealerts', (ctx) =>
      this.handleCallback(ctx, this.sendWhaleAlert),
    );
    this.bot.action('createwallet', (ctx) =>
      this.handleCallback(ctx, this.sendCreateNewSolanaAddress),
    );
    this.bot.action('help', (ctx) => this.sendHelpMessage(ctx));

    // Handle incoming messages based on user state
    this.bot.on('message', (ctx) => this.handleMessage(ctx));

    // Launch the bot
    this.bot.launch();
  }

  // Function to send the welcome message with inline buttons
  private sendWelcomeMessage = (ctx: Context) => {
    ctx.reply(
      'Welcome to SolanaWhaleWatch! 🚀\n\n' +
        'Here are the commands you can use to get the latest updates and insights:\n' +
        'Click on a button below to explore:\n',
      Markup.inlineKeyboard([
        [
          Markup.button.callback('Top 10 Tokens 📈', 'top10'),
          Markup.button.callback('New Listings 🆕', 'newlistings'),
        ],
        [
          Markup.button.callback('💼 Wallet Portfolio 👜', 'portfolio'),
          Markup.button.callback('Token Info 🔍', 'tokeninfo'),
        ],
        [
          Markup.button.callback('Whale Alerts 🐋', 'whalealerts'),
          Markup.button.callback('Create Wallet 🏦', 'createwallet'),
        ],
        [Markup.button.callback('Help 💡', 'help')],
      ]),
    );
  };

  // Helper function to send help message
  private sendHelpMessage = (ctx: Context) => {
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

    const helpKeyboard = Markup.keyboard([
      ['📈 top10', 'New Listings 🆕'],
      ['🐋 whalealerts', 'Create Wallet 🏦'],
      ['🔍 tokeninfo [address]', '💼 Wallet Portfolio 👜'],
      ['💡 help'],
    ])
      .resize()
      .oneTime();

    ctx.reply(helpMessage, helpKeyboard);
  };

  // General function to handle inline button callbacks
  private handleCallback = (ctx: Context, callback: (ctx: Context) => void) => {
    callback(ctx);
    ctx.answerCbQuery();
  };

  // Handler for incoming messages (portfolio or tokeninfo requests)
  private handleMessage = async (ctx: Context) => {
    const userState = this.userState[ctx.chat.id];
    if (userState && ctx.message && 'text' in ctx.message) {
      const userMessage = ctx.message.text.trim();
      const { waitingFor } = userState;

      try {
        if (waitingFor === 'portfolio' && this.isValidAddress(userMessage)) {
          await this.sendWalletPortfolio(ctx, userMessage);
        } else if (waitingFor === 'tokeninfo') {
          await this.sendTokenInformation(ctx, userMessage);
        } else {
          ctx.reply('Invalid input. Please try again.');
        }
      } catch (error) {
        ctx.reply(
          'Error occurred while processing your request. Please try again.',
        );
      }

      // Clear user state after processing
      delete this.userState[ctx.chat.id];
    }
  };

  // Functions to prompt user for wallet or token address
  private requestWalletAddress = (ctx: Context) => {
    ctx.reply('Please enter your wallet address:');
    this.userState[ctx.chat.id] = { waitingFor: 'portfolio' };
  };

  private requestTokenAddress = (ctx: Context) => {
    ctx.reply('Please enter your token address:');
    this.userState[ctx.chat.id] = { waitingFor: 'tokeninfo' };
  };

  // Function to send whale alerts
  private sendWhaleAlert = async (ctx: Context) => {
    const message = await this.alertService.sendLastAlert();
    ctx.reply(message, { parse_mode: 'Markdown' });
  };

  // Function to send top tokens
  private sendTopTokens = async (ctx: Context) => {
    const message = await this.walletService.getTopToken();
    ctx.reply(message, { parse_mode: 'Markdown' });
  };

  // Function to send new listings
  private sendNewListings = async (ctx: Context) => {
    const message = await this.walletService.getNewListings();
    ctx.reply(message, { parse_mode: 'Markdown' });
  };

  // Function to send wallet portfolio
  private sendWalletPortfolio = async (ctx: Context, wallet: string) => {
    const message = await this.walletService.getWalletPortfolio(wallet);
    ctx.reply(message, { parse_mode: 'Markdown' });
  };

  // Function to send token information
  private sendTokenInformation = async (ctx: Context, tokenAddress: string) => {
    const sections = await this.walletService.getTokenInformation(tokenAddress);
    ctx.reply(sections, { parse_mode: 'Markdown' });
  };

  // Function to create and send new Solana address
  private sendCreateNewSolanaAddress = async (ctx: Context) => {
    const message = await this.walletService.createNewSolanaAddress();
    ctx.reply(message, { parse_mode: 'Markdown' });
  };

  // Utility function to validate wallet address format
  private isValidAddress = (walletAddress: string): boolean => {
    try {
      const address = new PublicKey(walletAddress);
      return PublicKey.isOnCurve(address);
    } catch (e) {
      return false;
    }
  };
}
