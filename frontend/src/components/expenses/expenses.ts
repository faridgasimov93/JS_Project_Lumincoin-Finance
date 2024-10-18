import {HttpUtils} from "../../ulits/http-utils";

export class Expenses {
    constructor(openNewRoute) {

        this.openNewRoute = openNewRoute;
        this.selectedExpenseId = null;
        this.selectedExpenseTitle = null;

        this.getExpenses().then();
        document.getElementById('deleteButton').addEventListener('click', this.deleteExpense.bind(this));
    }

    async getExpenses() {
        const result = await HttpUtils.request('/categories/expense');
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
            return alert("Возникла ошибка при запросе расходов! Обратитесь в поддержку.");
        }

        this.showRecords(result.response);

    }

    showRecords(expenses) {

        const container = document.getElementById('category-container');
        const createButton = document.getElementById('addNew');

        expenses.forEach(expense => {
            // создание блока карточки
            const categoryBlock = document.createElement('div');
            categoryBlock.classList.add('category-block');
            // создание заголовка карточки и подставляет название
            const blockTitle = document.createElement('div');
            blockTitle.classList.add('block-title');
            blockTitle.innerText = expense.title;

            // создание кнопок
            const categoryActions = document.createElement('div');
            categoryActions.classList.add('category-actions');
            categoryActions.innerHTML = `
            <a href="/expenses-edit?id=${expense.id}" class="btn btn-primary me-2">Редактировать</a>
            <a href="#" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal" data-id="${expense.id}">Удалить</a>
            `

            // Сохраняет ID при клике на кнопку "Удалить"
            categoryActions.querySelector('.btn-danger').addEventListener('click', (e) => {
                this.selectedExpenseId = expense.id; // Сохраняет ID и название расхода для удаления и замены текста
                this.selectedExpenseTitle = expense.title;
                this.updateModalText();
            });

            categoryBlock.appendChild(blockTitle);
            categoryBlock.appendChild(categoryActions);

            container.appendChild(categoryBlock);
        });
        // вставляет карточку для создания после того как вставит все карточки Расходов
        container.appendChild(createButton);
    }

    updateModalText() {
        const modalTitleElement = document.getElementById('deleteModalLabel');
        if (modalTitleElement && this.selectedExpenseTitle) {
            modalTitleElement.innerText = `Вы действительно хотите удалить категорию "${this.selectedExpenseTitle}"?`;
        }
    }

    async deleteExpense() {
        if (this.selectedExpenseId) {
            const result = await HttpUtils.request('/categories/expense/' + this.selectedExpenseId, 'DELETE', true);

            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }

            if (result.error || !result.response || (result.response && result.response.error)) {
                return alert("Возникла ошибка при удалении расхода! Обратитесь в поддержку.");
            }

            const expenseBlock = document.querySelector(`.category-block[data-id="${this.selectedExpenseId}"]`);
            if (expenseBlock) {
                expenseBlock.remove();
            }
            const deleteModal = document.getElementById('deleteModal');
            const modalInstance = bootstrap.Modal.getInstance(deleteModal);
            modalInstance.hide();

            this.openNewRoute('/expenses');
        }
    }
}