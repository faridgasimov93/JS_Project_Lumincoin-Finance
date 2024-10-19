import { RequestResultType } from "../types/request-result.type";
import {HttpUtils} from "../ulits/http-utils";

export class Balance {
    constructor() {
        this.getBalance();
    }
    private async getBalance():Promise<void> {
        const result: RequestResultType = await HttpUtils.request('/balance');
        if (result && result.response) {
            this.updateBalance(result.response.balance);
        }
    }
    private updateBalance(balance:string):void {
        const balanceElement: HTMLElement | null = document.getElementById('balance');
        if (balanceElement) {
            balanceElement.textContent = `${balance}$`
        }
    }
}