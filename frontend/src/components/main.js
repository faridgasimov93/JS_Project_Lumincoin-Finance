import {DatePickingUtil} from "../ulits/date-picking-util";
import Chart from 'chart.js/auto';

export class Main {

    constructor() {

        DatePickingUtil.datePicking();

        this.incomeChart = document.getElementById('incomeChart');
        this.expensesChart = document.getElementById('expensesChart');

        this.incomePieChart();
        this.expensePieChart();

    }

    incomePieChart() {

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
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Orange'],
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
            },
            datasets: [{
                label: 'My First Dataset',
                data: [300, 50, 100, 130, 190],
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)',
                    'rgb(5,243,47)',
                    'rgb(244,118,14)',
                ],
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
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Orange'],
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
            },
            datasets: [{
                label: 'My First Dataset',
                data: [300, 50, 100, 130, 190],
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)',
                    'rgb(5,243,47)',
                    'rgb(244,118,14)',
                ],
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
}