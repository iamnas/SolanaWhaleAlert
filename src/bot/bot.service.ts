import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AlertService } from 'src/alert/alert.service';
import { WalletService } from 'src/wallet/wallet.service';
import { Context, Telegraf } from 'telegraf';
import { Markup } from 'telegraf';
import { PublicKey } from '@solana/web3.js';

@Injectable()
export class BotService {
  private bot: Telegraf;

  constructor(
    private configService: ConfigService,
    private alertService: AlertService,
    private walletService: WalletService,
  ) {
    this.bot = new Telegraf(this.configService.get('TELEGRAM_TOKEN'));

    this.bot.start((ctx) => {
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
            Markup.button.callback('Token Info 🔍', 'tokeninfo'),
            Markup.button.callback('Token Stats 📊', 'tokenstats'),
          ],

          [
            Markup.button.callback('Whale Alerts 🐋', 'whalealerts'),
            Markup.button.callback('💼 Wallet Portfolio 👜', 'portfolio'),
          ],
          [Markup.button.callback('Help 💡', 'help')],
        ]),
      );
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

    // Define the keyboard layout
    const helpKeyboard = Markup.keyboard([
      ['📈 top10', 'New Listings 🆕'],
      ['🔍 tokeninfo [address]', '📊 tokenstats [address]'],
      ['🐋 whalealerts', '💼 Wallet Portfolio 👜'],
      ['💡 help'],
    ])
      .resize()
      .oneTime();

    // Function to send message
    const sendHelpMessage = (ctx: Context) => {
      ctx.reply(helpMessage, helpKeyboard);
    };

    const sendWhaleAlert = async (ctx: Context) => {
      const message = await this.alertService.sendLastAlert();
      ctx.reply(message, { parse_mode: 'Markdown' });
    };

    const sendTopTokens = async (ctx: Context) => {
      const message = await this.walletService.getTopToken();
      ctx.reply(message, { parse_mode: 'Markdown' });
    };

    const sendNewlistings = async (ctx: Context) => {
      const message = await this.walletService.getNewListings();
      ctx.reply(message, { parse_mode: 'Markdown' });
    };

    const sendWalletPortfolio = async (ctx: Context, wallet: string) => {
      const message = await this.walletService.getWalletPortfolio(wallet);
      ctx.reply(message, { parse_mode: 'Markdown' });
    };

    //

    // this.bot.command('tokeninfo', (ctx) => {
    //   // Your logic to handle /tokeninfo command
    // });

    // this.bot.command('tokenstats', (ctx) => {
    //   // Your logic to handle /tokenstats command
    // });

    // Handle /help command
    this.bot.command('help', sendHelpMessage);

    // Handle 💡 help message
    this.bot.hears('💡 help', (ctx) => {
      ctx.reply(helpMessage, helpKeyboard);
      ctx.deleteMessage();
    });

    // Handle callback queries for help
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
      // Listen for the user's next message, which should be the wallet address
      this.bot.on('text', async (ctx) => {
        const walletAddress = ctx.message.text;

        // Validate the wallet address format if necessary
        if (!this.isValidAddress(walletAddress)) {
          ctx.reply(
            'The wallet address provided is not valid. Please try again.',
          );
          return;
        }

        // Call the API with the provided wallet address
        try {
          await sendWalletPortfolio(ctx, walletAddress);

          // Send the portfolio details to the user
          //   ctx.reply(`Here are the top tokens in your wallet:\n${portfolio}`);
        } catch (error) {
          ctx.reply(
            'An error occurred while fetching your portfolio. Please try again later.',
          );
        }
      });
    });

    this.bot.action('portfolio', (ctx) => {
      ctx.reply('Please enter your wallet address:');
      // Listen for the user's next message, which should be the wallet address
      this.bot.on('text', async (ctx) => {
        const walletAddress = ctx.message.text;

        // Validate the wallet address format if necessary
        if (!this.isValidAddress(walletAddress)) {
          ctx.reply(
            'The wallet address provided is not valid. Please try again.',
          );
          return;
        }

        // Call the API with the provided wallet address
        try {
          await sendWalletPortfolio(ctx, walletAddress);
          ctx.answerCbQuery();
          // Send the portfolio details to the user
          //   ctx.reply(`Here are the top tokens in your wallet:\n${portfolio}`);
        } catch (error) {
          ctx.reply(
            'An error occurred while fetching your portfolio. Please try again later.',
          );
        }
      });
    });

    this.bot.hears('💼 Wallet Portfolio 👜', (ctx) => {
      ctx.reply('Please enter your wallet address:');
      // Listen for the user's next message, which should be the wallet address
      this.bot.on('text', async (ctx) => {
        const walletAddress = ctx.message.text;

        // Validate the wallet address format if necessary
        if (!this.isValidAddress(walletAddress)) {
          ctx.reply(
            'The wallet address provided is not valid. Please try again.',
          );
          return;
        }

        // Call the API with the provided wallet address
        try {
          await sendWalletPortfolio(ctx, walletAddress);

          // Send the portfolio details to the user
          //   ctx.reply(`Here are the top tokens in your wallet:\n${portfolio}`);
        } catch (error) {
          ctx.reply(
            'An error occurred while fetching your portfolio. Please try again later.',
          );
        }
      });
    });

    this.bot.command('tokeninfo', async (ctx) => {
      const tokenAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // Replace with actual token address if dynamic
      const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        const dexId = 'raydium';
        const pair =
          data?.pairs.length > 1
            ? data?.pairs.find((pair) => pair.dexId === dexId)
            : data?.pairs[0];
        //     console.log(pair);

        const {
          baseToken,
          quoteToken,
          priceUsd,
          txns,
          volume,
          priceChange,
          liquidity,
          fdv,
          info,
        } = pair;

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
      } catch (error) {
        console.error('Error fetching token data:', error);
        ctx.reply(
          'Sorry, I could not retrieve the token information at this time.',
        );
      }
    });

    this.bot.launch();
  }

  // Utility function to validate wallet address format (optional)
  isValidAddress(walletAddress: string): boolean {
    const address = new PublicKey(walletAddress);
    return PublicKey.isOnCurve(address);
  }
}
