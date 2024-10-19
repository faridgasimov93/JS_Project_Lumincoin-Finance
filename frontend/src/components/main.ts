import Chart from "chart.js/auto";
import { DatePickingUtil } from "../ulits/date-picking-util";
import { HttpUtils } from "../ulits/http-utils";

interface Operation {
    id: number;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: string;
    comment?: string;
}
interface Operations {
    category: string;
    amount: number;
}

export class Main {

    private openNewRoute: (url: string) => Promise<void>;
    private operations: Operation[];
    private incomeChart: HTMLCanvasElement | null;
    private expensesChart: HTMLCanvasElement | null;
    private incomeChartInstance: Chart | null;
    private expensesChartInstance: Chart | null;
    private incomeOperations: Operation[];
    private expenseOperations: Operation[];

    constructor(openNewRoute: (url: string) => Promise<void>) {
        this.openNewRoute = openNewRoute;
        this.operations = [];
        this.incomeOperations = [];
        this.expenseOperations = [];

        this.incomeChart = document.getElementById("incomeChart") as HTMLCanvasElement | null;
        this.expensesChart = document.getElementById("expensesChart") as HTMLCanvasElement | null;

        this.incomeChartInstance = null;
        this.expensesChartInstance = null;

        this.setDateFilterListeners();

        DatePickingUtil.datePicking(( startDate, endDate,) => {
            this.getOperations(startDate, endDate,);
        });

        const today: Date = new Date();
        this.getOperations(today, today);

    }

    private async getOperations(startDate?: Date, endDate?: Date, customUrl: string | null = null):Promise<void> {
        const result:any = await HttpUtils.request(
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

    private groupByCategory(operations:Operations[]):{[key:string]:number} {
        return operations.reduce((acc: { [key: string]: number }, op: Operations) => {
            if (!acc[op.category]) {
                acc[op.category] = 0;
            }
            acc[op.category] += op.amount;
            return acc;
        }, {});
    }

    private getRandomColor():string {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgb(${r}, ${g}, ${b})`;
    }

    private generateColors(labels: (string | number)[]): string[] {
        return labels.map(() => this.getRandomColor());
    }

    private incomePieChart():void {
        const incomeByCategory: {[key: string]: number} = this.groupByCategory(this.incomeOperations);
        const incomeLabels:string[] = Object.keys(incomeByCategory);
        const incomeData:number[] = Object.values(incomeByCategory);
        const backgroundColors:string[] = this.generateColors(incomeLabels);

        const legendMargin = {
            id: "legendMargin",
            beforeInit(chart: { legend: { height: number; fit: () => any; }; }) {
                const fitValue = chart.legend.fit;
                chart.legend.fit = function fit() {
                    fitValue.bind(chart.legend)();
                    return (this.height += 30);
                };
            },
        };

        const data:any = {
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

        let config: any = {
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

        if (this.incomeChart) {
            if (this.incomeChartInstance) {
                this.incomeChartInstance.data = data;
                this.incomeChartInstance.update();
            } else {
                this.incomeChartInstance = new Chart(this.incomeChart, config);
            } 
        }
    }

    private expensePieChart():void {
        const expenseByCategory: {[key: string]: number} = this.groupByCategory(this.expenseOperations);
        const expenseLabels:string[] = Object.keys(expenseByCategory);
        const expenseData:number[] = Object.values(expenseByCategory);

        const backgroundColors:string[] = this.generateColors(expenseLabels);

        const legendMargin:any = {
            id: "legendMargin",
            beforeInit(chart: { legend: { height: number; fit: () => any; }; }) {
                // console.log(chart.legend.fit);
                const fitValue = chart.legend.fit;
                chart.legend.fit = function fit() {
                    fitValue.bind(chart.legend)();
                    return (this.height += 30);
                };
            },
        };

        const data:any = {
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

        let config: any = {
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

        if (this.expensesChart) {
            if (this.expensesChartInstance) {
                this.expensesChartInstance.data = data;
                this.expensesChartInstance.update();
            } else {
                this.expensesChartInstance = new Chart(this.expensesChart, config);
            }
        }
        
    }

    private setDateFilterListeners():void {
        const todayButton: HTMLElement | null = document.querySelector("#todayBtn");
        if (todayButton) {
            todayButton.addEventListener("click", () => {
                const today = new Date();
                this.getOperations(today, today);
            });
        }
        
        const weekButton: Element | null = document.querySelector("#weekBtn");
        if (weekButton) {
            weekButton.addEventListener("click", () => {
                const today = new Date();
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                this.getOperations(weekAgo, today);
            });
        }
        
        const monthButton: Element | null = document.querySelector("#monthBtn");
        if (monthButton) {
            monthButton.addEventListener("click", () => {
                const today = new Date();
                const monthAgo = new Date(today);
                monthAgo.setMonth(today.getMonth() - 1);
                this.getOperations(monthAgo, today);
            });
        }
        
        const yearButton: Element | null = document.querySelector("#yearBtn");
        if (yearButton) {
            yearButton.addEventListener("click", () => {
                const today = new Date();
                const yearAgo = new Date(today);
                yearAgo.setFullYear(today.getFullYear() - 1);
                this.getOperations(yearAgo, today);
            });  
        }
        
        const allButton: Element | null = document.querySelector("#allBtn");
        if (allButton) {
            allButton.addEventListener("click", () => {
                this.getOperations(undefined, undefined, `/operations?period=all`);
            });
        }
        
    }
}
