import {DatePickingUtil} from "../ulits/date-picking-util";
import Chart from 'chart.js/auto';
import {HttpUtils} from "../ulits/http-utils";

export class Main {

    constructor(openNewRoute) {
        this.openNewRoute= openNewRoute;

        DatePickingUtil.datePicking();

        this.incomeChart = document.getElementById('incomeChart');
        this.expensesChart = document.getElementById('expensesChart');

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
        new Chart(this.incomeChart, config);
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
        new Chart(this.expensesChart, config);
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
}