import { Observable } from 'rxjs';
import { IApiErrorResponse } from '../api';


export class WorkProgress {
    requestInProgress: boolean = false;
    startDate: Date | null;
    showSpinner: boolean = false;

    constructor(private doRequest: () => Observable<any>,
        private onDataReceived: (res: any) => any,
        private onDataReceiveError?: (error?: IApiErrorResponse) => any) {
    }

    public doStopProgress() {
        this.startDate = null;
        this.requestInProgress = false;
        this.showSpinner = false;
    }

    public startRequest() {
        if (!this.doRequest()) return;
        this.startGetProgress();
        this.doRequest().subscribe({
            // parse data
            next: res => {
                this.onDataReceived(res);
            },
            error: (apiError: IApiErrorResponse) => {
                this.stopGetProgress();
                if (this.onDataReceiveError) {            
                    this.onDataReceiveError(apiError);
                } else {
                    console.log(apiError);
                }
            },
            // success
            complete: () => {
                this.stopGetProgress();
            }
        });
    }

    private startGetProgress() {
        this.requestInProgress = true;
        setTimeout(() => {
            this.startDate = new Date();
            if (this.requestInProgress) this.showSpinner = true;
        }, 500);
    }

    private stopGetProgress() {
        if (this.startDate) {
            let now = new Date();
            let duration = (now.getTime() - this.startDate.getTime()) / 1000;
            if (duration < 1000) {
                // let it be at least one second.
                setTimeout(() => this.doStopProgress(), 1000 - duration);
            }
        } else {
            this.doStopProgress();
        }
    }
}
