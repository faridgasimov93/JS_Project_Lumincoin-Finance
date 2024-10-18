import {DatePickingUtil} from "../../ulits/date-picking-util";
import {HttpUtils} from "../../ulits/http-utils";

export class IncomeAndExpensesEdit {
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

        this.categoriesMap = {};

        const urlParams = new URLSearchParams(window.location.search);
        this.id = urlParams.get('id');
        if (!this.id) {
            return this.openNewRoute('/');
        }
        this.getOperation(this.id).then();
        document.getElementById('editButton').addEventListener('click',this.updateOperation.bind(this))
    }

    async getOperation(id) {
        const result = await HttpUtils.request('/operations/' + id);
        // console.log(result);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            console.log(result.response.message);
            return alert("Возникла ошибка при редактировании операции! Обратитесь в поддержку.");
        }
        this.showOperation(result.response).then();
    }

    async showOperation(operation) {
        this.incomeExpenseSelector.value = operation.type === 'income' ? '1' : '2';

        await this.updateOperationCategories(); // Загрузка категорий в зависимости от типа операции

        this.operationCategorySelect.value = operation.category_id = operation.category;

        this.operationAmountInput.value = operation.amount;
        this.operationDatepickerInput.value = new Date(operation.date).toLocaleDateString('ru-RU');
        this.operationCommentaryInput.value = operation.comment;
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

            option.value = item.title;
            option.textContent = item.title;

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

    async updateOperation(e) {
        e.preventDefault();

        if (this.validateForm()) {
            const operationType = this.incomeExpenseSelector.value === "1" ? "income" : "expense";
            const formattedDate = this.convertToBackendFormat(this.operationDatepickerInput.value);
            const categoryTitle = this.operationCategorySelect.value;
            const categoryId = this.categoriesMap[categoryTitle];
            const operationAmount = parseFloat(this.operationAmountInput.value);

            const result = await HttpUtils.request('/operations/' + this.id, 'PUT', true,{
                type: operationType,
                amount: operationAmount,
                date: formattedDate,
                comment: this.operationCommentaryInput.value,
                category_id: categoryId ,
            });
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }
            if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
                return alert("Возникла ошибка при редактировании категории! Обратитесь в поддержку.");
            }
            this.openNewRoute('/income-and-expenses');
        }
    }
}