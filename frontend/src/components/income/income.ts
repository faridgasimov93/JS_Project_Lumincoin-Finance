import {HttpUtils} from "../../ulits/http-utils";
import bootstrap from "bootstrap";

export class Income {

    private openNewRoute: (url: string) => Promise<void>;
    private selectedIncomeId: string | null;
    private selectedIncomeTitle: string | null;
    declare bootstrap: any;

    constructor(openNewRoute: (url: string)=> Promise<void>) {

        this.openNewRoute = openNewRoute;
        this.selectedIncomeId = null;
        this.selectedIncomeTitle = null;

        this.getIncomes();
        const deleteButton: HTMLElement | null = document.getElementById('deleteButton')
        if (deleteButton) {
            deleteButton.addEventListener('click', this.deleteIncome.bind(this));
        }
    }

    private async getIncomes(): Promise<void> {
        const result:any = await HttpUtils.request('/categories/income');
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
            return alert("Возникла ошибка при запросе доходов! Обратитесь в поддержку.");
        }

        this.showRecords(result.response);
    }

    private showRecords(income:{ id: string, title: string }[]):void {
        const container: HTMLElement | null = document.getElementById('category-container');
        const createButton: HTMLElement | null = document.getElementById('addNew');

        income.forEach(item => {
            // создание блока карточки
            const categoryBlock: HTMLElement | null = document.createElement('div');
            categoryBlock.classList.add('category-block');
            // создание заголовка карточки и подставляет название
            const blockTitle: HTMLElement | null = document.createElement('div');
            blockTitle.classList.add('block-title');
            blockTitle.innerText = item.title;

            // создание кнопок
            const categoryActions: HTMLElement | null = document.createElement('div');
            categoryActions.classList.add('category-actions');
            categoryActions.innerHTML = `
            <a href="/income-edit?id=${item.id}" class="btn btn-primary me-2">Редактировать</a>
            <a href="#" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal" data-id="${item.id}">Удалить</a>
            `

            const dangerButton: HTMLElement | null = categoryActions.querySelector('.btn-danger');
            if (dangerButton) {
                dangerButton.addEventListener('click', (e) => {
                    this.selectedIncomeId = item.id; // Сохраняет ID и название расхода для удаления и замены текста
                    this.selectedIncomeTitle = item.title;
                    this.updateModalText();
                });
            }
            categoryBlock.appendChild(blockTitle);
            categoryBlock.appendChild(categoryActions);
            if (container) {
                container.appendChild(categoryBlock);
            }
        });
        if (container && createButton) {
            container.appendChild(createButton);
        }
    }

    private updateModalText():void {
        const modalTitleElement:HTMLElement | null = document.getElementById('deleteModalLabel');
        if (modalTitleElement && this.selectedIncomeTitle) {
            modalTitleElement.innerText = `Вы действительно хотите удалить категорию "${this.selectedIncomeTitle}"?`;
        }
    }

   private async deleteIncome():Promise<void> {
        if (this.selectedIncomeId) {
            const result = await HttpUtils.request('/categories/income/' + this.selectedIncomeId, 'DELETE', true);

            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }

            if (result.error || !result.response || (result.response && result.response.error)) {
                return alert("Возникла ошибка при удалении дохода! Обратитесь в поддержку.");
            }

            const incomeBlock:HTMLElement | null = document.querySelector(`.category-block[data-id="${this.selectedIncomeId}"]`);
            if (incomeBlock) {
                incomeBlock.remove();
            }

            const deleteModal:HTMLElement | null = document.getElementById('deleteModal');
            if (deleteModal) {
                 const modalInstance: bootstrap.Modal | null = bootstrap.Modal.getInstance(deleteModal);
                if (modalInstance) {
                  modalInstance.hide();
                }
            }
            this.openNewRoute('/income');

        }
    }

}