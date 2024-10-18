import {HttpUtils} from "../../ulits/http-utils";

export class ExpensesCreate {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        this.createExpenseElement = document.getElementById('expenseTitle');
        this.createExpenseErrorElement = document.getElementById('expenseTitleError');

        document.getElementById('createButton').addEventListener('click', this.createNewExpense.bind(this));
    }

    validateForm() {
        let isValid = true;
        if (this.createExpenseElement.value) {
            this.createExpenseElement.classList.remove('is-invalid');
            this.createExpenseErrorElement.classList.replace('invalid-feedback', 'valid-feedback');
        } else {
            this.createExpenseElement.classList.add('is-invalid');
            this.createExpenseErrorElement.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
        }
        return isValid;
    }

    async createNewExpense(e) {
        e.preventDefault();

        if (this.validateForm()) {
            const result = await HttpUtils.request('/categories/expense', 'POST', true,{
                title: this.createExpenseElement.value
            });
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }
            if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
                return alert("Возникла ошибка при создании расхода! Обратитесь в поддержку.");
            }
            this.openNewRoute('/expenses');
        }
    }


}