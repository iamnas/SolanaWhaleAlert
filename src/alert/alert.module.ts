import { Module } from '@nestjs/common';
// import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';
// import { BullModule } from '@nestjs/bull';
import { AlertProcessor } from './alert.processor';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'alert-queue',
    }),
  ],
  // controllers: [AlertController],
  providers: [AlertProcessor, AlertService],
  exports: [AlertService],
})
export class AlertModule {}
