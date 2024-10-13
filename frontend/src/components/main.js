import {DatePickingUtil} from "../ulits/date-picking-util";
import Chart from 'chart.js/auto';
import {HttpUtils} from "../ulits/http-utils";

export class Main {

    constructor(openNewRoute) {
        this.openNewRoute= openNewRoute;
        this.operations = []; // Сохраняем все операции для фильтрации
        this.filteredOperations = []; // Текущие отфильтрованные операции

        this.incomeChart = document.getElementById('incomeChart');
        this.expensesChart = document.getElementById('expensesChart');

        this.incomeChartInstance = null;
        this.expensesChartInstance = null;

        this.setDateFilterListeners();
        DatePickingUtil.datePicking();

        this.getOperations().then();

    }

    async getOperations() {
        const result = await HttpUtils.request('/operations?period=all');
        this.operations = result.response;
        this.incomeOperations = this.operations.filter(op => op.type === 'income');
        this.expenseOperations = this.operations.filter(op => op.type === 'expense');
        console.log(result.response);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
            return alert("Возникла ошибка при запросе доходов и расходов! Обратитесь в поддержку.");
        }
        this.incomePieChart();
        this.expensePieChart();
        this.filterOperations();
    }


    groupByCategory(operations) {
        return operations.reduce((acc, op) => {
            if (!acc[op.category]) {
                acc[op.category] = 0;
            }
            acc[op.category] += op.amount;
            return acc;
        }, {});
    }

    getRandomColor() {
        // динамическая генерация цветов
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgb(${r}, ${g}, ${b})`;
    }

    generateColors(labels) {
        return labels.map(() => this.getRandomColor());
    }

    incomePieChart() {

        const incomeByCategory = this.groupByCategory(this.incomeOperations);
        const incomeLabels = Object.keys(incomeByCategory);
        const incomeData = Object.values(incomeByCategory);
        const backgroundColors = this.generateColors(incomeLabels);

        const legendMargin = {
            id: 'legendMargin',
            beforeInit(chart) {
                // console.log(chart.legend.fit);
                const fitValue = chart.legend.fit;
                chart.legend.fit = function fit() {
                    fitValue.bind(chart.legend)();
                    return this.height += 30;
                }
            }
        }

        const data = {
            labels: incomeLabels,
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
            },
            datasets: [{
                label: 'Сумма доходов',
                data: incomeData,
                backgroundColor: backgroundColors,
                hoverOffset: 4
            }]
        };

        let config = {
            type: 'pie',
            data: data,
            options: {
                plugins: {
                    legend: {
                        labels: {
                            // Изменение ширины блоков цвета
                            boxWidth: 35,
                            padding: 10,
                            usePointStyle: false
                        }
                    }
                },
                responsive: true
            },
            // Плагин для добавление отступа между диаграмой и label ( цветными кубиками )
            plugins: [legendMargin]
        };

        if (this.incomeChartInstance) {
            this.incomeChartInstance.destroy();
        }
        this.incomeChartInstance = new Chart(this.incomeChart, config);
        // new Chart(this.incomeChart, config);
    }

    expensePieChart() {
        const expenseByCategory = this.groupByCategory(this.expenseOperations);
        const expenseLabels = Object.keys(expenseByCategory);
        const expenseData = Object.values(expenseByCategory);

        const backgroundColors = this.generateColors(expenseLabels);


        const legendMargin = {
            id: 'legendMargin',
            beforeInit(chart) {
                // console.log(chart.legend.fit);
                const fitValue = chart.legend.fit;
                chart.legend.fit = function fit() {
                    fitValue.bind(chart.legend)();
                    return this.height += 30;
                }
            }
        }

        const data = {
            labels: expenseLabels,
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
            },
            datasets: [{
                label: 'Сумма расходов',
                data: expenseData,
                backgroundColor: backgroundColors,
                hoverOffset: 4
            }]
        };

        let config = {
            type: 'pie',
            data: data,
            options: {
                plugins: {
                    legend: {
                        labels: {
                            // Изменение ширины блоков цвета
                            boxWidth: 35,
                            padding: 10,
                            usePointStyle: false
                        }
                    }
                },
                responsive: true
            },
            // Плагин для добавление отступа между диаграмой и label ( цветными кубиками )
            plugins: [legendMargin]
        };
        // Если диаграмма уже существует, уничтожаем её
        if (this.expensesChartInstance) {
            this.expensesChartInstance.destroy();
        }
        // Создаём новую диаграмму и сохраняем её экземпляр
        this.expensesChartInstance = new Chart(this.expensesChart, config);
        // new Chart(this.expensesChart, config);
    }

    filterOperations(startDate = null, endDate = null) {
        const today = new Date();
        let filtered = [];

        if (startDate && endDate) {
            // Фильтрация по диапазону
            filtered = this.operations.filter(operation => {
                const operationDate = new Date(operation.date);
                // console.log(`Дата опепации: ${operationDate}`);
                return operationDate >= startDate && operationDate <= endDate;
            });
        } else {
            // По умолчанию фильтрует на "сегодня"
            filtered = this.operations.filter(operation => {
                const operationDate = new Date(operation.date);
                return operationDate.toDateString() === today.toDateString();
            });
        }
        this.filteredOperations = filtered;
        this.incomeOperations = this.filteredOperations.filter(op => op.type === 'income');
        this.expenseOperations = this.filteredOperations.filter(op => op.type === 'expense');

        this.incomePieChart();
        this.expensePieChart();
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

        document.querySelector('#allBtn').addEventListener('click', () => {
            this.filteredOperations = this.operations;
            this.incomeOperations = this.filteredOperations.filter(op => op.type === 'income');
            this.expenseOperations = this.filteredOperations.filter(op => op.type === 'expense');
            this.incomePieChart();
            this.expensePieChart();
        });

        document.querySelector('#intervalBtn').addEventListener('click', () => {
            const startDate = new Date(document.querySelector('#startDate').value);
            const endDate = new Date(document.querySelector('#endDate').value);
            if (startDate && endDate) {
                this.filterOperations(startDate, endDate);
            }
        });
    }
}