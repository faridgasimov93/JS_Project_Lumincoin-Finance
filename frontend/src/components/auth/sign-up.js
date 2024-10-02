import {AuthUtils} from "../../ulits/auth-utils";

export class SignUp {

    constructor(openNewRoute) {

        this.openNewRoute = openNewRoute;

        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
            return this.openNewRoute('/');
        }

        this.nameInputElement = document.getElementById('name');
        this.nameErrorInputElement = document.getElementById('name-error');

        this.emailInputElement = document.getElementById('email');
        this.emailErrorInputElement = document.getElementById('email-error');

        this.passwordInputElement = document.getElementById('password');
        this.passwordErrorInputElement = document.getElementById('password-error');

        this.repeatPasswordInputElement = document.getElementById('repeat-password');
        this.repeatPasswordErrorInputElement = document.getElementById('repeat-password-error');

        this.commonErrorElement = document.getElementById('common-error');


        document.getElementById('process-button').addEventListener('click', this.singUp.bind(this));
    }

    validateForm() {
        let isValid = true;

        if (this.nameInputElement.value && this.nameInputElement.value.match(/^[А-ЯЁ][а-яё]+(?: [А-ЯЁ][а-яё]+)*[^\s]$/)) {
            this.nameInputElement.classList.remove('is-invalid');
            this.nameErrorInputElement.classList.replace('invalid-feedback', 'valid-feedback');
        } else {
            this.nameInputElement.classList.add('is-invalid');
            this.nameErrorInputElement.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
        }

        if (this.emailInputElement.value && this.emailInputElement.value.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)) {
            this.emailInputElement.classList.remove('is-invalid');
            this.emailErrorInputElement.classList.replace('invalid-feedback', 'valid-feedback');
        } else {
            this.emailInputElement.classList.add('is-invalid');
            this.emailErrorInputElement.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
        }

        if (this.passwordInputElement.value && this.passwordInputElement.value.match(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
            this.passwordInputElement.classList.remove('is-invalid');
            this.passwordErrorInputElement.classList.replace('invalid-feedback', 'valid-feedback');
        } else {
            this.passwordInputElement.classList.add('is-invalid');
            this.passwordErrorInputElement.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
        }

        if (this.repeatPasswordInputElement.value && this.repeatPasswordInputElement.value === this.passwordInputElement.value) {
            this.repeatPasswordInputElement.classList.remove('is-invalid');
            this.repeatPasswordErrorInputElement.classList.replace('invalid-feedback', 'valid-feedback');
        } else {
            this.repeatPasswordInputElement.classList.add('is-invalid');
            this.repeatPasswordErrorInputElement.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
        }

        return isValid;
    }

    async singUp() {

        this.commonErrorElement.style.display = 'none';

        if (this.validateForm()) {
            // Разделение имени и фамилии
            const fullName = this.nameInputElement.value.trim();
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

            const response = await fetch('http://localhost:3000/api/signup', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                useAuth: false,
                body: JSON.stringify({
                    name: firstName,
                    lastName: lastName,
                    email: this.emailInputElement.value,
                    password: this.passwordInputElement.value,
                    passwordRepeat: this.repeatPasswordInputElement.value,
                })
            });

            const result = await response.json();

            if (result.error || !result.user.id || !result.user.name || !result.user.lastName) {
                this.commonErrorElement.style.display = 'block';
                return;
            }

            AuthUtils.setAuthInfo(null, null, {
                name: result.user.name,
                lastName: result.user.lastName,
                id: result.user.id
            })

            this.openNewRoute('/');
        }
    }
}