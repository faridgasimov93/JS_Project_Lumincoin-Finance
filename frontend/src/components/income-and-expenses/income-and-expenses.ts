import {DatePickingUtil} from "../../ulits/date-picking-util";
import {HttpUtils} from "../../ulits/http-utils";

export class IncomeAndExpenses {

    constructor(openNewRoute) {

        this.openNewRoute = openNewRoute;
        this.allOperations = []; // Сохраняем все операции для фильтрации
        this.filteredOperations = []; // Текущие отфильтрованные операции
        this.operationToDelete = null;

        this.setDateFilterListeners(); // Устанавливаем обработчики для фильтров даты

        DatePickingUtil.datePicking();
        this.getOperations().then();
        this.filterOperations();
        this.setModalListeners().then();
    }

    async getOperations() {
        const result = await HttpUtils.request('/operations?period=all');
        // console.log(result.response);

        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
            return alert("Возникла ошибка при запросе доходов и расходов! Обратитесь в поддержку.");
        }
        this.allOperations = result.response;
        this.showRecords(result.response);

        this.filterOperations();
    }

    filterOperations(startDate = null, endDate = null) {
        const today = new Date();
        let filtered = [];
        if (startDate && endDate) {
            // Фильтрация по диапазону
            filtered = this.allOperations.filter(operation => {
                const operationDate = new Date(operation.date);
                return operationDate >= startDate && operationDate <= endDate;
            });
        } else {
            // По умолчанию фильтрует на "сегодня"
            filtered = this.allOperations.filter(operation => {
                const operationDate = new Date(operation.date);
                return operationDate.toDateString() === today.toDateString();
            });
        }
        this.filteredOperations = filtered;
        this.showRecords(this.filteredOperations);
    }

    setDateFilterListeners() {

        document.querySelector('#todayBtn').addEventListener('click', () => this.filterOperations());

        document.querySelector('#weekBtn').addEventListener('click', () => {
            const today = new Date();
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            this.filterOperations(weekAgo, today);
        });

        document.querySelector('#monthBtn').addEventListener('click', () => {
            const today = new Date();
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            this.filterOperations(monthAgo, today);
        });

        document.querySelector('#yearBtn').addEventListener('click', () => {
            const today = new Date();
            const yearAgo = new Date(today);
            yearAgo.setFullYear(today.getFullYear() - 1);
            this.filterOperations(yearAgo, today);
        });

        document.querySelector('#allBtn').addEventListener('click', () => this.showRecords(this.allOperations));

        document.querySelector('#intervalBtn').addEventListener('click', () => {
            const startDate = new Date(document.querySelector('#startDate').value);
            const endDate = new Date(document.querySelector('#endDate').value);
            if (startDate && endDate) {
                this.filterOperations(startDate, endDate);
            }
        });
    }

    showRecords(operations) {

        const recordsElement = document.getElementById('records');
        recordsElement.innerHTML = '';

        let index = 1;
        operations.forEach((operation) => {

            const trElement = document.createElement('tr');
            const formattedDate = new Date(operation.date).toLocaleDateString('ru-RU');
            const typeClass = operation.type === 'income' ? 'table-type-income' : 'table-type-expenses';
            const typeText = operation.type === 'income' ? 'доход' : 'расход';

            trElement.innerHTML = `
            <th scope="row" class="text-center">${index}</th>
            <td class="${typeClass}">${typeText}</td>
            <td>${operation.category}</td>
            <td>${operation.amount + ' $'}</td>
            <td>${formattedDate}</td>
            <td>${operation.comment}</td>
            <td class="table-actions-buttons d-flex align-items-center justify-content-end">
                <div class="delete-table" data-operation-id="${operation.id}" data-bs-toggle="modal" data-bs-target="#deleteModal">
                    <svg width="14" height="15" viewBox="0 0 14 15" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.5 5.5C4.77614 5.5 5 5.72386 5 6V12C5 12.2761 4.77614 12.5 4.5 12.5C4.22386 12.5 4 12.2761 4 12V6C4 5.72386 4.22386 5.5 4.5 5.5Z"
                                      fill="black"/>
                                <path d="M7 5.5C7.27614 5.5 7.5 5.72386 7.5 6V12C7.5 12.2761 7.27614 12.5 7 12.5C6.72386 12.5 6.5 12.2761 6.5 12V6C6.5 5.72386 6.72386 5.5 7 5.5Z"
                                      fill="black"/>
                                <path d="M10 6C10 5.72386 9.77614 5.5 9.5 5.5C9.22386 5.5 9 5.72386 9 6V12C9 12.2761 9.22386 12.5 9.5 12.5C9.77614 12.5 10 12.2761 10 12V6Z"
                                      fill="black"/>
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                      d="M13.5 3C13.5 3.55228 13.0523 4 12.5 4H12V13C12 14.1046 11.1046 15 10 15H4C2.89543 15 2 14.1046 2 13V4H1.5C0.947715 4 0.5 3.55228 0.5 3V2C0.5 1.44772 0.947715 1 1.5 1H5C5 0.447715 5.44772 0 6 0H8C8.55229 0 9 0.447715 9 1H12.5C13.0523 1 13.5 1.44772 13.5 2V3ZM3.11803 4L3 4.05902V13C3 13.5523 3.44772 14 4 14H10C10.5523 14 11 13.5523 11 13V4.05902L10.882 4H3.11803ZM1.5 3V2H12.5V3H1.5Z"
                                      fill="black"/>
                            </svg>
                </div>
                <a href="/income-and-expenses-edit?id=${operation.id}" class="edit-table">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"xmlns="http://www.w3.org/2000/svg">
                       <path d="M12.1465 0.146447C12.3417 -0.0488155 12.6583 -0.0488155 12.8536 0.146447L15.8536 3.14645C16.0488 3.34171 16.0488 3.65829 15.8536 3.85355L5.85357 13.8536C5.80569 13.9014 5.74858 13.9391 5.68571 13.9642L0.68571 15.9642C0.500001 16.0385 0.287892 15.995 0.146461 15.8536C0.00502989 15.7121 -0.0385071 15.5 0.0357762 15.3143L2.03578 10.3143C2.06092 10.2514 2.09858 10.1943 2.14646 10.1464L12.1465 0.146447ZM11.2071 2.5L13.5 4.79289L14.7929 3.5L12.5 1.20711L11.2071 2.5ZM12.7929 5.5L10.5 3.20711L4.00001 9.70711V10H4.50001C4.77616 10 5.00001 10.2239 5.00001 10.5V11H5.50001C5.77616 11 6.00001 11.2239 6.00001 11.5V12H6.29291L12.7929 5.5ZM3.03167 10.6755L2.92614 10.781L1.39754 14.6025L5.21903 13.0739L5.32456 12.9683C5.13496 12.8973 5.00001 12.7144 5.00001 12.5V12H4.50001C4.22387 12 4.00001 11.7761 4.00001 11.5V11H3.50001C3.28561 11 3.10272 10.865 3.03167 10.6755Z"
                                      fill="black"/>
                    </svg>
                </a>
            </td>
            `
            index++;
            recordsElement.appendChild(trElement);
        });

        this.attachDeleteListeners();
    }

    attachDeleteListeners() {
        const deleteButtons = document.querySelectorAll('.delete-table');
        if (deleteButtons.length === 0) {
            return;
        }

        deleteButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const operationId = event.currentTarget.getAttribute('data-operation-id');
                this.operationToDelete = operationId;
            });
        });
    }



   async setModalListeners() {
        const modalSuccessButton = document.querySelector('.btn-modal-success');

        if (!modalSuccessButton) {
            return;
        }
        document.querySelector('.btn-modal-success').addEventListener('click', async () => {
            if (this.operationToDelete) {
                // Proceed with deletion
                const result = await HttpUtils.request('/operations/' + this.operationToDelete, 'DELETE', true);

                if (result.redirect) {
                    return this.openNewRoute(result.redirect);
                }
                if (result.error || !result.response || (result.response && result.response.error)) {
                    return alert("Возникла ошибка при удалении Операции! Обратитесь в поддержку.");
                }

                this.openNewRoute('/income-and-expenses');
            }
        });
    }

}
