import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlertModule } from './alert/alert.module';
import { ConfigModule } from '@nestjs/config';
import { WalletModule } from './wallet/wallet.module';
import { BotService } from './bot/bot.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'alert-queue',
    }),
    AlertModule,
    ConfigModule.forRoot({ isGlobal: true }),
    WalletModule,
  ],
  controllers: [AppController],
  providers: [AppService, BotService],
})
export class AppModule {}
