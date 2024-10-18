import {DatePickingUtil} from "../../ulits/date-picking-util";
import {HttpUtils} from "../../ulits/http-utils";


export class IncomeAndExpensesCreate {

    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        DatePickingUtil.datePicking();

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


        const urlParams = new URLSearchParams(window.location.search);
        const operationType = urlParams.get('type');
        if (operationType === 'income') {
            this.incomeExpenseSelector.value = '1';
        } else if (operationType === 'expense') {
            this.incomeExpenseSelector.value = '2';
        }

        this.incomeExpenseSelector.addEventListener('change', this.updateOperationCategories.bind(this));
        this.updateOperationCategories().then();
        document.getElementById('createButton').addEventListener('click', this.createNewOperation.bind(this));
    }

    async updateOperationCategories() {
        const selectedValue = this.incomeExpenseSelector.value;

        // В зависимости от выбранного значения, выбираются категории
        let url = selectedValue === "1" ? '/categories/income' : '/categories/expense';

        const result = await HttpUtils.request(url);
        if (result.error || !result.response) {
            alert("Ошибка загрузки категорий!");
            return;
        }
        this.operationCategorySelect.innerHTML = '<option value="">Выберите категорию</option>';
        this.categoriesMap = {};

        result.response.forEach(item => {
            const option = document.createElement('option');

            option.value = item.title; // сохраняет названия категорий
            option.textContent = item.title; // отображает названия категорий

            this.categoriesMap[item.title] = item.id; // мапит title в ID
            this.operationCategorySelect.appendChild(option);

        });
    }

    // Функция для конвертации формата даты
     convertToBackendFormat(dateStr) {
        // Ожидаемый формат: DD.MM.YYYY
        const [day, month, year] = dateStr.split(".");

        // Возвращаем дату в формате YYYY-MM-DD
        return `${year}-${month}-${day}`;
    }

    validateForm() {
        let isValid = true;

        if (this.operationCategorySelect.value) {
            this.operationCategorySelect.classList.remove('is-invalid');
            this.operationCategorySelectError.classList.replace('invalid-feedback', 'valid-feedback');
        } else {
            this.operationCategorySelect.classList.add('is-invalid');
            this.operationCategorySelectError.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
        }

        if (this.operationAmountInput.value) {
            this.operationAmountInput.classList.remove('is-invalid');
            this.operationAmountErrorInput.classList.replace('invalid-feedback', 'valid-feedback');
        } else {
            this.operationAmountInput.classList.add('is-invalid');
            this.operationAmountErrorInput.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
        }

        if (this.operationDatepickerInput.value) {
            this.operationDatepickerInput.classList.remove('is-invalid');
            this.operationDatepickerErrorInput.classList.replace('invalid-feedback', 'valid-feedback');
        } else {
            this.operationDatepickerInput.classList.add('is-invalid');
            this.operationDatepickerErrorInput.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
        }
        if (this.operationCommentaryInput.value) {
            this.operationCommentaryInput.classList.remove('is-invalid');
            this.operationCommentaryErrorInput.classList.replace('invalid-feedback', 'valid-feedback');
        } else {
            this.operationCommentaryInput.classList.add('is-invalid');
            this.operationCommentaryErrorInput.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
        }

        return isValid;
    }

    async createNewOperation(e) {
        e.preventDefault();

        if (this.validateForm()) {

            const operationType = this.incomeExpenseSelector.value === "1" ? "income" : "expense";
            const formattedDate = this.convertToBackendFormat(this.operationDatepickerInput.value);
            const categoryTitle = this.operationCategorySelect.value;
            const categoryId = this.categoriesMap[categoryTitle]; // Сохраняет ID выбранной категории

            const result = await HttpUtils.request('/operations', 'POST', true,{
                type: operationType,
                amount: this.operationAmountInput.value,
                date: formattedDate,
                comment: this.operationCommentaryInput.value,
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