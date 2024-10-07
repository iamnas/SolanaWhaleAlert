import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Keypair, PublicKey, Connection } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

import axios from 'axios';
import { firstValueFrom } from 'rxjs';
import bs58 from 'bs58';

@Injectable()
export class WalletService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async getWalletPortfolio(wallet: string) {
    const options = {
      headers: {
        'x-chain': 'solana',
        'X-API-KEY': this.configService.get('BIRDEYE_API_KEY'),
      },
    };
    const URL = `${this.configService.get('BIRDEYE_URL')}${wallet}`;
    try {
      const response = await firstValueFrom(this.httpService.get(URL, options));

      const topTokens = response?.data?.data?.items?.slice(0, 10);

      let telegramMessage = `*Top 10 Tokens for Wallet:* \`${wallet}\`\n\n`;

      topTokens.forEach((token, index) => {
        telegramMessage += `*${index + 1}. ${token?.symbol}* `;
        telegramMessage += `[🅵](https://solscan.io/token/${token?.address})\n`;
        telegramMessage += `Name: \`${token?.name}\`\n`;
        telegramMessage += `Balance: \`${token?.uiAmount}\`\n`;
        telegramMessage += `Value: \`$${token?.valueUsd?.toFixed(2)}\`\n\n`;
      });

      return telegramMessage;
    } catch (error) {
      // console.error(error);
      throw new HttpException(
        'An error occurred while fetching the data.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      const response = await firstValueFrom(this.httpService.get(URL, options));
      const tokens = response?.data?.data?.tokens;

      let telegramMessage = '*Top Tokens on Solana*\n\n';

      tokens.forEach((token: any, index: number) => {
        const formatValue = (value: number | null): string => {
          const formattedValue =
            value && value >= 1000
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
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'An error occurred while fetching the data.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getNewListings(): Promise<string> {
    try {
      const options = {
        method: 'GET',
        headers: {
          'x-chain': 'solana',
          'X-API-KEY': this.configService.get('BIRDEYE_API_KEY'),
        },
      };
      const URL = this.configService.get('BIRDEYE_NEW_LIST_URL');

      const response = await firstValueFrom(this.httpService.get(URL, options));
      const items = response?.data?.data?.items;

      let telegramMessage = '*New Listings on Solana*\n\n';

      items.forEach((item: any, index: number) => {
        const formatValue = (value: number | null): string => {
          const formattedValue =
            value && value >= 1000
              ? `$${(value / 1e3).toFixed(2)}K`
              : `$${value?.toFixed(2) || '0'}`;
          return `\`${formattedValue}\``;
        };

        telegramMessage += `*${index + 1}. ${item.name || 'Unknown'} (${item.symbol || 'N/A'})*\n`;
        telegramMessage += `**Address**: [🅵](https://dexscreener.com/solana/${item.address})\`${item.address}\`\n`;
        telegramMessage += `**Liquidity**: ${formatValue(item.liquidity)}\n`;
        // telegramMessage += `🔗 [Quick Buy Link](https://t.me/achilles_trojanbot?start=r-naseth-${item.address})\n\n`;
      });

      return telegramMessage;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'An error occurred while fetching the data.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTokenInformation(tokenAddress: string) {
    try {
      const token = await this.isToken(tokenAddress);

      if (!token) {
        return `Error checking token address: ${token}`;
      }
      const response = await axios.get(
        `https://api.rugcheck.xyz/v1/tokens/${tokenAddress}/report`,
      );
      const data = response.data;

      const tokenPriceData = await axios.get(
        `https://price.jup.ag/v4/price?ids=${tokenAddress}`,
      );

      const tokenPrice = tokenPriceData?.data?.data[tokenAddress].price || 0;

      // Markets Section
      const markets = data.markets
        .slice(0, 5)
        .map((market) => {
          return (
            `📈 *Market:* ${market?.marketType?.toUpperCase().replace(/_/g, '\\_')}\n` +
            `💧 *LP Mint:* \`${market?.lp?.lpMint}\`\n` +
            `💰 *Liquidity:* \`$${(market?.lp?.quoteUSD + market?.lp?.baseUSD).toLocaleString()}\`\n` +
            `🔒 *LP Locked:* \`${market?.lp?.lpLockedPct?.toFixed(2)}%\``
          );
        })
        .join('\n\n');

      // Token Overview
      const tokenOverview =
        `*💡 Token Overview* \n` +
        `* Name:* \`${data.tokenMeta.name}\`\n` +
        `* Symbol:* \`${data.tokenMeta.symbol}\`\n` +
        `* 🪙 Mint Address:* \`${data.mint}\`\n` +
        `* 💵 Supply:* \`${(data.token.supply / Math.pow(10, data.token.decimals)).toLocaleString()} ${data.tokenMeta.symbol}\`\n` +
        `* 👤 Creator:* \`${data.creator}\`\n` +
        `* 🏷️ Market Cap:* \`$${(data.token.supply * tokenPrice).toLocaleString()}\`\n` +
        `* 🔒 LP Locked:* \`${data.markets[0].lp.lpLockedPct.toFixed(2)}%\``;

      // Top Holders
      const topHoldersData = data.topHolders.slice(0, 5); // Get top 5 holders
      const totalTopHoldersPct = topHoldersData.reduce(
        (acc, holder) => acc + holder.pct,
        0,
      );

      const topHolders = topHoldersData
        .map((holder) => {
          const ownerShort = `${holder.owner}`;
          const amountInMillions = (holder.uiAmount / 1_000_000).toFixed(2);
          return `*Account* \`${ownerShort}\` \n*Amount* ${amountInMillions}M  \n*Percentage* ${holder.pct.toFixed(2)}% \n`;
        })
        .join('\n');

      const riskLevel = data.score === 0 ? '🔴 *Risk:*' : '🟢 *Good*';
      const riskAnalysis = data.risks
        .slice(0, 5)
        .map((risk) => {
          return `⚠️ *${risk.level.toUpperCase()}*: ${risk.name} - ${risk.description}`;
        })
        .join('\n');

      const sections =
        `\n ${tokenOverview}` +
        `\n\n📊 *Markets* \n${markets}` +
        `\n\n👥 *Top Holders* (${totalTopHoldersPct.toFixed(2)}%) \n${topHolders}` +
        `\n🔍 *Risk Analysis* \n📊 *Status:* *${data.score}* ${riskLevel} \n\`${riskAnalysis}\``;
      // ];

      return sections;
    } catch (error) {
      // console.error('Error fetching token info:', error);
      return 'Failed to fetch token info. Please try again later.';
    }
  }

  async createNewSolanaAddress() {
    try {
      const newKeyPair = Keypair.generate();
      const pubkey = new PublicKey(newKeyPair.publicKey);
      const privateKey = bs58.encode(newKeyPair.secretKey);

      const message = `
        *🔑 Public Key:* \`${pubkey}\`

        *🔒 Private Key:* \`${privateKey}\`

        ⚠️ *Warning:* Keep your private key secure and do not share it with anyone. If someone has access to your private key, they can control your funds.
      `;

      return message;
    } catch (error) {
      console.log(error);
      return 'Something went wrong, please try again later.';
    }
  }

  async isToken(address: string): Promise<boolean> {
    try {
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const publicKey = new PublicKey(address);

      // Fetch the account information
      const accountInfo = await connection.getParsedAccountInfo(publicKey);

      // Check if the account exists
      if (!accountInfo || !accountInfo.value) {
        return false;
      }

      const parsedData = accountInfo.value.data;

      // Check if the account is a token mint for either program version
      const isTokenProgram =
        accountInfo.value.owner.equals(TOKEN_PROGRAM_ID) ||
        accountInfo.value.owner.equals(TOKEN_2022_PROGRAM_ID);

      // Ensure the data is of the correct type (should be parsed)
      if (isTokenProgram && parsedData['parsed']) {
        const type = parsedData['parsed'].type;
        return type === 'mint';
      }

      return false;
    } catch (error) {
      // console.error('Error checking token address:', error);
      return false;
    }
  }
}
