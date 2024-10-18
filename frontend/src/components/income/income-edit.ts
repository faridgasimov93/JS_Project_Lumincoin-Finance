import {HttpUtils} from "../../ulits/http-utils";

export class IncomeEdit {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        this.editIncomeElement = document.getElementById('incomeTitle');
        this.editIncomeErrorElement = document.getElementById('incomeTitleError');

        const urlParams = new URLSearchParams(window.location.search);
        this.id = urlParams.get('id');
        if (!this.id) {
            return this.openNewRoute('/');
        }

        this.getIncome(this.id).then();

        document.getElementById('updateButton').addEventListener('click', this.updateIncome.bind(this));
    }

    async getIncome(id) {
        const result = await HttpUtils.request('/categories/income/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            console.log(result.response.message);
            return alert("Возникла ошибка при редактировании дохода! Обратитесь в поддержку.");
        }

        this.showIncome(result.response);
    }

    showIncome(income) {
        if (income.title) {
            this.editIncomeElement.value = income.title;
        }
    }

    validateForm() {
        let isValid = true;
        if (this.editIncomeElement.value) {
            this.editIncomeElement.classList.remove('is-invalid');
            this.editIncomeErrorElement.classList.replace('invalid-feedback', 'valid-feedback');
        } else {
            this.editIncomeElement.classList.add('is-invalid');
            this.editIncomeErrorElement.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
        }
        return isValid;
    }

    async updateIncome(e) {
        e.preventDefault();
        if (this.validateForm()) {

            const result = await HttpUtils.request('/categories/income/' + this.id, 'PUT', true,{
                title: this.editIncomeElement.value
            });
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }
            if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
                return alert("Возникла ошибка при редактировании дохода! Обратитесь в поддержку.");
            }
            this.openNewRoute('/income');
        }
    }
}