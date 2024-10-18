import {HttpUtils} from "../../ulits/http-utils";

export class IncomeCreate {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        this.createIncomeElement = document.getElementById('incomeTitle');
        this.createIncomeErrorElement = document.getElementById('incomeTitleError');

        document.getElementById('createButton').addEventListener('click', this.createNewIncome.bind(this));
    }

    validateForm() {
        let isValid = true;

        if (this.createIncomeElement.value) {
            this.createIncomeElement.classList.remove('is-invalid');
            this.createIncomeErrorElement.classList.replace('invalid-feedback', 'valid-feedback');
        } else {
            this.createIncomeElement.classList.add('is-invalid');
            this.createIncomeErrorElement.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
        }

        return isValid;
    }

    async createNewIncome(e) {
        e.preventDefault();

        if (this.validateForm()) {
            const result = await HttpUtils.request('/categories/income', 'POST', true,{
                title: this.createIncomeElement.value
            });
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }
            if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
                return alert("Возникла ошибка при создании дохода! Обратитесь в поддержку.");
            }
            this.openNewRoute('/income');
        }
    }
}