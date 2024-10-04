import 'flatpickr/dist/flatpickr.min.css';
import flatpickr from "flatpickr";
import {Russian} from "flatpickr/dist/l10n/ru.js";
import rangePlugin from "flatpickr/dist/plugins/rangePlugin"; // плагин для выбора диапозона от первой до второй даты
require("flatpickr/dist/themes/dark.css"); // стиль календаря

export class DatePickingUtil {

    static datePicking() {
        document.querySelectorAll('.datepicker-btn').forEach(button => {
            button.addEventListener('click', function () {
                document.querySelectorAll('.datepicker-btn').forEach(btn => {
                    btn.classList.remove('btn-outline-secondary');
                });
                this.classList.add('btn-secondary');

                if (this.id === 'intervalBtn') {
                    document.getElementById('dateRangeInputs').classList.remove('hidden');
                } else {
                    document.getElementById('dateRangeInputs').classList.add('hidden');
                }
            });

            flatpickr('#first-datepicker', {
                "locale": Russian,
                "plugins": [new rangePlugin({input: "#second-datepicker"})]
            });

        });

        flatpickr('#income-create-datepicker', {
            "locole": Russian,
        })

    }
}