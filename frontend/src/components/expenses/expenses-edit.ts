import {HttpUtils} from "../../ulits/http-utils";

export class ExpensesEdit {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;


        this.editExpenseElement = document.getElementById('expenseTitle');
        this.editExpenseErrorElement = document.getElementById('expenseTitleError');

        const urlParams = new URLSearchParams(window.location.search);
        this.id = urlParams.get('id');
        if (!this.id) {
            return this.openNewRoute('/');
        }

        this.getExpense(this.id).then();

        document.getElementById('updateButton').addEventListener('click', this.updateExpense.bind(this));
    }


    async getExpense(id) {
        const result = await HttpUtils.request('/categories/expense/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            console.log(result.response.message);
            return alert("Возникла ошибка при редактировании расхода! Обратитесь в поддержку.");
        }

        this.showExpense(result.response);
    }

    showExpense(expense) {
        if (expense.title) {
            this.editExpenseElement.value = expense.title;
        }
    }

    validateForm() {
        let isValid = true;
        if (this.editExpenseElement.value) {
            this.editExpenseElement.classList.remove('is-invalid');
            this.editExpenseErrorElement.classList.replace('invalid-feedback', 'valid-feedback');
        } else {
            this.editExpenseElement.classList.add('is-invalid');
            this.editExpenseErrorElement.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
        }
        return isValid;
    }

    async updateExpense(e) {
        e.preventDefault();

        if (this.validateForm()) {
            const result = await HttpUtils.request('/categories/expense/' + this.id, 'PUT', true,{
                title: this.editExpenseElement.value
            });
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }
            if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
                return alert("Возникла ошибка при редактировании расхода! Обратитесь в поддержку.");
            }
            this.openNewRoute('/expenses');
        }
    }


}