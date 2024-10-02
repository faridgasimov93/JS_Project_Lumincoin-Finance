import {HttpUtils} from "../../ulits/http-utils";

export class Expenses {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        this.getExpenses().then();
    }

    async getExpenses() {
        const result = await HttpUtils.request('/categories/expense');
        if (result.redirect) {
           return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
            return alert("Возникла ошибка при запросе расходов! Обратитесь в поддержку.");
        }

        this.showExpenses(result.response);
    }

    showExpenses(expenses) {
        console.log("Expenses to display:", expenses);
    }
}