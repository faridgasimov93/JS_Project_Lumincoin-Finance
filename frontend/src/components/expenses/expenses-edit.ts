import {HttpUtils} from "../../ulits/http-utils";

export class ExpensesEdit { 
    
    private openNewRoute: (url: string) => Promise<void>;
    private editExpenseElement: HTMLElement | null;
    private editExpenseErrorElement: HTMLElement | null;
    private id: string | null ;

    constructor(openNewRoute: (url: string) => Promise<void>) {
        this.openNewRoute = openNewRoute;


        this.editExpenseElement = document.getElementById('expenseTitle');
        this.editExpenseErrorElement = document.getElementById('expenseTitleError');

        const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
        this.id = urlParams.get('id');
        this.checkId();

        if (this.id) {
        this.getExpense(this.id);
        }

        const updateButton: HTMLElement | null = document.getElementById('updateButton')
        if (updateButton) {
        updateButton.addEventListener('click', this.updateExpense.bind(this));
        }
    }

    private async checkId(): Promise<void> {
        if (!this.id) {
            await this.openNewRoute('/');
        }
    }


    private async getExpense(id:string):Promise<void> {
        const result:any = await HttpUtils.request('/categories/expense/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            console.log(result.response.message);
            return alert("Возникла ошибка при редактировании расхода! Обратитесь в поддержку.");
        }

        this.showExpense(result.response);
    }

    private showExpense(expense:{ id: string, title: string }):void {
        if (expense.title) {
            (this.editExpenseElement as HTMLInputElement).value = expense.title;
        }
    }

    private validateForm():boolean {
        let isValid:boolean = true;
        if (this.editExpenseElement && this.editExpenseErrorElement && (this.editExpenseElement as HTMLInputElement).value) {
            this.editExpenseElement.classList.remove('is-invalid');
            this.editExpenseErrorElement.classList.replace('invalid-feedback', 'valid-feedback');
        } else if (this.editExpenseElement && this.editExpenseErrorElement) {
            this.editExpenseElement.classList.add('is-invalid');
            this.editExpenseErrorElement.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
        }
        return isValid;
    }

    async updateExpense(e: { preventDefault: () => void; }): Promise<void> {
        e.preventDefault();

        if (this.validateForm()) {
            const result = await HttpUtils.request('/categories/expense/' + this.id, 'PUT', true,{
                title: (this.editExpenseElement as HTMLInputElement).value
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