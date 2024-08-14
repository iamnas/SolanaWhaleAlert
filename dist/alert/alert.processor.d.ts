import { Job } from 'bullmq';
import { AlertService } from './alert.service';
export declare class AlertProcessor {
    private readonly alertService;
    constructor(alertService: AlertService);
    handleSendWhaleAlert(job: Job): Promise<void>;
}
