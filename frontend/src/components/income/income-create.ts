import {HttpUtils} from "../../ulits/http-utils";

export class IncomeCreate {

    private openNewRoute: (url: string) => Promise<void>;
    private createIncomeElement: HTMLElement | null;
    private createIncomeErrorElement: HTMLElement | null;

    constructor(openNewRoute: (url: string) => Promise<void>) {
        this.openNewRoute = openNewRoute;

        this.createIncomeElement = document.getElementById('incomeTitle');
        this.createIncomeErrorElement = document.getElementById('incomeTitleError');

        const createButton: HTMLElement | null = document.getElementById('createButton');
        if (createButton) {
        createButton.addEventListener('click', this.createNewIncome.bind(this))
        }
    }

    private validateForm():boolean {
        let isValid: boolean = true;
        if (this.createIncomeElement && this.createIncomeErrorElement && (this.createIncomeElement as HTMLInputElement).value) {
            this.createIncomeElement.classList.remove('is-invalid');
            this.createIncomeErrorElement.classList.replace('invalid-feedback', 'valid-feedback');
        } else if (this.createIncomeElement && this.createIncomeErrorElement) {
            this.createIncomeElement.classList.add('is-invalid');
            this.createIncomeErrorElement.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
            }
        return isValid;
    }

    private async createNewIncome(e: { preventDefault: () => void; }):Promise<void> {
        e.preventDefault();

        if (this.validateForm()) {
            const result = await HttpUtils.request('/categories/income', 'POST', true,{
                title: (this.createIncomeElement as HTMLInputElement).value
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