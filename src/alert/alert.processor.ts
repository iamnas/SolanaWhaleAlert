import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import { AlertService } from './alert.service';

@Processor('alert-queue')
export class AlertProcessor {
  constructor(private readonly alertService: AlertService) {}

  @Process('sendWhaleAlert')
  async handleSendWhaleAlert(job: Job) {
    const { signature, amount, from, to, mint } = job.data;
    await this.alertService.sendWhaleAlert(signature, amount, from, to, mint);
  }
}
