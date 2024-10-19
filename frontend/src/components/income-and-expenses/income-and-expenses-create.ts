import { callback } from "chart.js/dist/helpers/helpers.core";
import {DatePickingUtil} from "../../ulits/date-picking-util";
import {HttpUtils} from "../../ulits/http-utils";


interface Category {
    id: number;
    title: string;
}

export class IncomeAndExpensesCreate {

    private openNewRoute: (url: string) => Promise<void>;
    private incomeExpenseSelector: HTMLElement | null;
    private operationCategorySelect: HTMLElement | null;
    private operationCategorySelectError: HTMLElement | null;
    private operationAmountInput: HTMLElement | null;
    private operationAmountErrorInput: HTMLElement | null;
    private operationDatepickerInput: HTMLElement | null;
    private operationDatepickerErrorInput: HTMLElement | null;
    private operationCommentaryInput: HTMLElement | null;
    private operationCommentaryErrorInput: HTMLElement | null;
    private categoriesMap: { [key: string]: number };

    constructor(openNewRoute: (url: string)=> Promise<void>) {
        this.openNewRoute = openNewRoute;

        DatePickingUtil.datePicking(callback);

        this.incomeExpenseSelector = document.getElementById('operationSelector');

        this.operationCategorySelect = document.getElementById('operationCategory');
        this.operationCategorySelectError = document.getElementById('operationCategoryError');

        this.operationAmountInput = document.getElementById('operationAmount');
        this.operationAmountErrorInput = document.getElementById('operationAmountError');

        this.operationDatepickerInput = document.getElementById('operationDatepicker');
        this.operationDatepickerErrorInput = document.getElementById('operationDatepickerError');

        this.operationCommentaryInput = document.getElementById('operationCommentary');
        this.operationCommentaryErrorInput = document.getElementById('operationCommentaryError');

        this.categoriesMap = {}; //объект для хранения категорий по именам и ID


        const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
        const operationType: string | null = urlParams.get('type');
        if (operationType === 'income') {
            (this.incomeExpenseSelector as HTMLInputElement).value = '1';
        } else if (operationType === 'expense') {
            (this.incomeExpenseSelector as HTMLInputElement).value = '2';
        }

        if (this.incomeExpenseSelector) {
            this.incomeExpenseSelector.addEventListener('change', this.updateOperationCategories.bind(this));
        }
        this.updateOperationCategories().then();
        const createButton = document.getElementById('createButton');
        if (createButton) {
        createButton.addEventListener('click', this.createNewOperation.bind(this));
        }
    }

    private async updateOperationCategories():Promise<void> {
        const selectedValue: string | null = (this.incomeExpenseSelector as HTMLSelectElement).value;
        // В зависимости от выбранного значения, выбираются категории
        let url:string = selectedValue === "1" ? '/categories/income' : '/categories/expense';

        const result: { response: Category[]; error?: string } = await HttpUtils.request(url);
        if (result.error || !result.response) {
            alert("Ошибка загрузки категорий!");
            return;
        }
        if (this.operationCategorySelect) {
        this.operationCategorySelect.innerHTML = '<option value="">Выберите категорию</option>';
        this.categoriesMap = {};

        result.response.forEach(item => {
            const option:HTMLElement | null = document.createElement('option');

            (option as HTMLInputElement).value = item.title; // сохраняет названия категорий
            option.textContent = item.title; // отображает названия категорий
            if (this.categoriesMap) {
                this.categoriesMap[(item).title] = item.id; // мапит title в ID
            }
            if (this.operationCategorySelect) {
            this.operationCategorySelect.appendChild(option);
            }
        });
        }
    }
    // Функция для конвертации формата даты
     private convertToBackendFormat(dateStr: string): string {
        // Ожидаемый формат: DD.MM.YYYY
        const [day, month, year] = dateStr.split(".");

        // Возвращаем дату в формате YYYY-MM-DD
        return `${year}-${month}-${day}`;
    }

    private validateForm():boolean {
        let isValid:boolean = true;

        if (this.operationCategorySelect && this.operationCategorySelectError) {
            if ((this.operationCategorySelect as HTMLInputElement).value) {
                this.operationCategorySelect.classList.remove('is-invalid');
                this.operationCategorySelectError.classList.replace('invalid-feedback', 'valid-feedback');
            } else {
                this.operationCategorySelect.classList.add('is-invalid');
                this.operationCategorySelectError.classList.replace('valid-feedback', 'invalid-feedback');
                isValid = false;
            }
        }
        

        if (this.operationAmountInput && this.operationAmountErrorInput) {
            if ((this.operationAmountInput as HTMLInputElement).value) {
                this.operationAmountInput.classList.remove('is-invalid');
                this.operationAmountErrorInput.classList.replace('invalid-feedback', 'valid-feedback');
            } else {
                this.operationAmountInput.classList.add('is-invalid');
                this.operationAmountErrorInput.classList.replace('valid-feedback', 'invalid-feedback');
                isValid = false;
            }
        }
        
        if (this.operationDatepickerInput && this.operationDatepickerErrorInput) {
            if ((this.operationDatepickerInput as HTMLInputElement).value) {
                this.operationDatepickerInput.classList.remove('is-invalid');
                this.operationDatepickerErrorInput.classList.replace('invalid-feedback', 'valid-feedback');
            } else {
                this.operationDatepickerInput.classList.add('is-invalid');
                this.operationDatepickerErrorInput.classList.replace('valid-feedback', 'invalid-feedback');
                isValid = false;
            }
        }
        if (this.operationCommentaryInput && this.operationCommentaryErrorInput) {
            if ((this.operationCommentaryInput as HTMLInputElement).value) {
                this.operationCommentaryInput.classList.remove('is-invalid');
                this.operationCommentaryErrorInput.classList.replace('invalid-feedback', 'valid-feedback');
            } else {
                this.operationCommentaryInput.classList.add('is-invalid');
                this.operationCommentaryErrorInput.classList.replace('valid-feedback', 'invalid-feedback');
                isValid = false;
            }
        }
        

        return isValid;
    }

    private async createNewOperation(e: { preventDefault: () => void; }):Promise<void> {
        e.preventDefault();

        if (this.validateForm()) {

            const operationType: string = (this.incomeExpenseSelector as HTMLSelectElement).value === "1" ? "income" : "expense";
            const formattedDate: string = this.convertToBackendFormat((this.operationDatepickerInput as HTMLInputElement).value);
            const categoryTitle: string | null = (this.operationCategorySelect as HTMLSelectElement).value;
            const categoryId: number | null = this.categoriesMap[categoryTitle]; // Сохраняет ID выбранной категории

            const result:any = await HttpUtils.request('/operations', 'POST', true,{
                type: operationType,
                amount: (this.operationAmountInput as HTMLInputElement).value,
                date: formattedDate,
                comment: (this.operationCommentaryInput as HTMLInputElement).value,
                category_id: categoryId ,
            });
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }
            if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
                return alert("Возникла ошибка при создании категории! Обратитесь в поддержку.");
            }
            this.openNewRoute('/income-and-expenses');
        }
    }

}