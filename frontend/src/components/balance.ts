import {HttpUtils} from "../ulits/http-utils";

export class Balance {
    constructor() {
        this.getBalance().then();
    }
    async getBalance() {
        const result = await HttpUtils.request('/balance');
        if (result && result.response) {
            this.updateBalance(result.response.balance);
        }
    }
    updateBalance(balance) {
        const balanceElement = document.getElementById('balance');
        if (balanceElement) {
            balanceElement.textContent = `${balance}$`
        }
    }
}