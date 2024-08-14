import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

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
        telegramMessage += `*${index + 1}. ${token.symbol}* `;
        telegramMessage += `[🅵](https://solscan.io/token/${token.address})\n`;
        telegramMessage += `Name: ${token.name}\n`;
        telegramMessage += `Balance: ${token.uiAmount}\n`;
        telegramMessage += `Value: $${token.valueUsd.toFixed(2)}\n\n`;
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
      // console.log(tokens);

      const formattedTokens = tokens.map((token) => {
        const formatValue = (value: number | null): string => {
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
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'An error occurred while fetching the data.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getNewListings(): Promise<any> {
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

      const formattedListings = items.map((item) => {
        return `
          🚀 ${item.name || 'Unknown'} (${item.symbol || 'N/A'}) | ${item.address}
          Liquidity: $${item.liquidity.toFixed(2)}
          🔗 [Quick Buy Link](https://t.me/achilles_trojanbot?start=r-naseth-${item.address})
        `;
      });
      return formattedListings;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'An error occurred while fetching the data.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
