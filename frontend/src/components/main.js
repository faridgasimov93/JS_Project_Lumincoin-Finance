import Chart from "chart.js/auto";
import { DatePickingUtil } from "../ulits/date-picking-util";
import { HttpUtils } from "../ulits/http-utils";

export class Main {

    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.operations = []; // Сохраняем все операции для фильтрации

        this.incomeChart = document.getElementById("incomeChart");
        this.expensesChart = document.getElementById("expensesChart");

        this.incomeChartInstance = null;
        this.expensesChartInstance = null;

        this.setDateFilterListeners();

        DatePickingUtil.datePicking((startDate, endDate) => {
            this.getOperations(startDate, endDate);
        });

        const today = new Date();
        this.getOperations(today, today);

    }

    async getOperations(startDate, endDate, customUrl) {
        const result = await HttpUtils.request(
            customUrl ??
            `/operations?period=interval&dateFrom=${startDate}&dateTo=${endDate}`
        );

        if (result.error) {
            return alert(
                "Возникла ошибка при запросе доходов и расходов! Обратитесь в поддержку."
            );
        }

        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        this.operations = result.response;
        this.incomeOperations = this.operations.filter(
            (op) => op.type === "income"
        );
        this.expenseOperations = this.operations.filter(
            (op) => op.type === "expense"
        );

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
            id: "legendMargin",
            beforeInit(chart) {
                // console.log(chart.legend.fit);
                const fitValue = chart.legend.fit;
                chart.legend.fit = function fit() {
                    fitValue.bind(chart.legend)();
                    return (this.height += 30);
                };
            },
        };

        const data = {
            labels: incomeLabels,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
            datasets: [
                {
                    label: "Сумма доходов",
                    data: incomeData,
                    backgroundColor: backgroundColors,
                    hoverOffset: 4,
                },
            ],
        };

        let config = {
            type: "pie",
            data: data,
            options: {
                plugins: {
                    legend: {
                        labels: {
                            // Изменение ширины блоков цвета
                            boxWidth: 35,
                            padding: 10,
                            usePointStyle: false,
                        },
                    },
                },
                responsive: true,
            },
            // Плагин для добавление отступа между диаграмой и label ( цветными кубиками )
            plugins: [legendMargin],
        };

        if (this.incomeChartInstance) {
            this.incomeChartInstance.data = data;
            this.incomeChartInstance.update();
        } else {
            this.incomeChartInstance = new Chart(this.incomeChart, config);
        }
    }

    expensePieChart() {
        const expenseByCategory = this.groupByCategory(this.expenseOperations);
        const expenseLabels = Object.keys(expenseByCategory);
        const expenseData = Object.values(expenseByCategory);

        const backgroundColors = this.generateColors(expenseLabels);

        const legendMargin = {
            id: "legendMargin",
            beforeInit(chart) {
                // console.log(chart.legend.fit);
                const fitValue = chart.legend.fit;
                chart.legend.fit = function fit() {
                    fitValue.bind(chart.legend)();
                    return (this.height += 30);
                };
            },
        };

        const data = {
            labels: expenseLabels,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
            datasets: [
                {
                    label: "Сумма расходов",
                    data: expenseData,
                    backgroundColor: backgroundColors,
                    hoverOffset: 4,
                },
            ],
        };

        let config = {
            type: "pie",
            data: data,
            options: {
                plugins: {
                    legend: {
                        labels: {
                            // Изменение ширины блоков цвета
                            boxWidth: 35,
                            padding: 10,
                            usePointStyle: false,
                        },
                    },
                },
                responsive: true,
            },
            // Плагин для добавление отступа между диаграмой и label ( цветными кубиками )
            plugins: [legendMargin],
        };

        if (this.expensesChartInstance) {
            this.expensesChartInstance.data = data;
            this.expensesChartInstance.update();
        } else {
            this.expensesChartInstance = new Chart(this.expensesChart, config);
        }
    }

    setDateFilterListeners() {
        document.querySelector("#todayBtn").addEventListener("click", () => {
            const today = new Date();
            this.getOperations(today, today);
        });

        document.querySelector("#weekBtn").addEventListener("click", () => {
            const today = new Date();
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            this.getOperations(weekAgo, today);
        });

        document.querySelector("#monthBtn").addEventListener("click", () => {
            const today = new Date();
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            this.getOperations(monthAgo, today);
        });

        document.querySelector("#yearBtn").addEventListener("click", () => {
            const today = new Date();
            const yearAgo = new Date(today);
            yearAgo.setFullYear(today.getFullYear() - 1);
            this.getOperations(yearAgo, today);
        });

        document.querySelector("#allBtn").addEventListener("click", () => {
            this.getOperations(undefined, undefined, `/operations?period=all`);
        });
    }
}
