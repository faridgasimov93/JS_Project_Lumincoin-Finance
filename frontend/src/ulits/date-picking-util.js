import AirDatepicker from "air-datepicker";
import 'air-datepicker/air-datepicker.css';

export class DatePickingUtil {

    static datePicking() {
        document.querySelectorAll('.date-btn').forEach(button => {
            button.addEventListener('click', function () {
                document.querySelectorAll('.date-btn').forEach(btn => {
                    btn.classList.remove('btn-secondary');
                    btn.classList.add('btn-outline-secondary');
                });

                this.classList.remove('btn-outline-secondary');
                this.classList.add('btn-secondary');

                if (this.id === 'intervalBtn') {
                    document.getElementById('dateRangeInputs').classList.remove('d-none');
                } else {
                    document.getElementById('dateRangeInputs').classList.add('d-none');
                }
            });
        });

       const startDatePicker = new AirDatepicker('#startDate', {
            buttons: "clear",
           autoClose: true,
            onSelect({date}) {
                if (date) {
                    endDatePicker.update({
                        minDate: date instanceof Array ? date[0] : date
                    });
                }
            }
        });

        const endDatePicker = new AirDatepicker('#endDate', {
            buttons: "clear",
            autoClose: true,
            onSelect({date}) {
                if (date) {
                    startDatePicker.update({
                        maxDate: date instanceof Array ? date[0] : date
                    });
                }
            }
        });

        const createOperationDatePicker = new AirDatepicker('#operationDatepicker', {
            buttons: "clear",
            autoClose: true,
            maxDate: new Date(),
        })
    }
}