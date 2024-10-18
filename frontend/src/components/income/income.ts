import {HttpUtils} from "../../ulits/http-utils";

export class Income {
    constructor(openNewRoute) {

        this.openNewRoute = openNewRoute;
        this.selectedIncomeId = null;
        this.selectedIncomeTitle = null;

        this.getIncomes().then();
        document.getElementById('deleteButton').addEventListener('click', this.deleteIncome.bind(this));
    }

    async getIncomes() {
        const result = await HttpUtils.request('/categories/income');
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
            return alert("Возникла ошибка при запросе доходов! Обратитесь в поддержку.");
        }

        this.showRecords(result.response);
    }

    showRecords(income) {
        const container = document.getElementById('category-container');
        const createButton = document.getElementById('addNew');

        income.forEach(item => {
            // создание блока карточки
            const categoryBlock = document.createElement('div');
            categoryBlock.classList.add('category-block');
            // создание заголовка карточки и подставляет название
            const blockTitle = document.createElement('div');
            blockTitle.classList.add('block-title');
            blockTitle.innerText = item.title;

            // создание кнопок
            const categoryActions = document.createElement('div');
            categoryActions.classList.add('category-actions');
            categoryActions.innerHTML = `
            <a href="/income-edit?id=${item.id}" class="btn btn-primary me-2">Редактировать</a>
            <a href="#" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal" data-id="${item.id}">Удалить</a>
            `

            categoryActions.querySelector('.btn-danger').addEventListener('click', (e) => {
                this.selectedIncomeId = item.id; // Сохраняет ID и название расхода для удаления и замены текста
                this.selectedIncomeTitle = item.title;
                this.updateModalText();
            });

            categoryBlock.appendChild(blockTitle);
            categoryBlock.appendChild(categoryActions);

            container.appendChild(categoryBlock);
        });
        // вставляет карточку для создания после того как вставит все карточки  Расходов
        container.appendChild(createButton);
    }

    updateModalText() {
        const modalTitleElement = document.getElementById('deleteModalLabel');
        if (modalTitleElement && this.selectedIncomeTitle) {
            modalTitleElement.innerText = `Вы действительно хотите удалить категорию "${this.selectedIncomeTitle}"?`;
        }
    }

    async deleteIncome() {
        if (this.selectedIncomeId) {
            const result = await HttpUtils.request('/categories/income/' + this.selectedIncomeId, 'DELETE', true);

            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }

            if (result.error || !result.response || (result.response && result.response.error)) {
                return alert("Возникла ошибка при удалении дохода! Обратитесь в поддержку.");
            }

            const incomeBlock = document.querySelector(`.category-block[data-id="${this.selectedIncomeId}"]`);
            if (incomeBlock) {
                incomeBlock.remove();
            }

            const deleteModal = document.getElementById('deleteModal');
            const modalInstance = bootstrap.Modal.getInstance(deleteModal);
            modalInstance.hide();

            this.openNewRoute('/income');

        }
    }

}