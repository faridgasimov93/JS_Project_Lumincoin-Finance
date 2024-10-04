import {HttpUtils} from "../../ulits/http-utils";
import {AuthUtils} from "../../ulits/auth-utils";

export class Login {

    constructor(openNewRoute) {

        this.openNewRoute = openNewRoute;

        this.emailInputElement = document.getElementById('email');
        this.emailErrorInputElement = document.getElementById('email-error');

        this.passwordInputElement = document.getElementById('password');
        this.passwordErrorInputElement = document.getElementById('password-error');

        this.rememberMeElement = document.getElementById('remember');
        this.commonErrorElement = document.getElementById('common-error');


        document.getElementById('process-button').addEventListener('click', this.login.bind(this));
    }

    validateForm() {
        let isValid = true;

        if (this.emailInputElement.value && this.emailInputElement.value.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)) {
            this.emailInputElement.classList.remove('is-invalid');
            this.emailErrorInputElement.classList.replace('invalid-feedback', 'valid-feedback');
        } else {
            this.emailInputElement.classList.add('is-invalid');
            this.emailErrorInputElement.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
        }

        if (this.passwordInputElement.value) {
            this.passwordInputElement.classList.remove('is-invalid');
            this.passwordErrorInputElement.classList.replace('invalid-feedback', 'valid-feedback');
        } else {
            this.passwordInputElement.classList.add('is-invalid');
            this.passwordErrorInputElement.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
        }

        return isValid;
    }


    async login() {

        this.commonErrorElement.style.display = 'none';

        if (this.validateForm()) {
            const result = await HttpUtils.request('/login', 'POST', false, {
                email: this.emailInputElement.value,
                password: this.passwordInputElement.value,
                rememberMe: this.rememberMeElement.checked
            });


            if (result.error || !result.response || (result.response && (!result.response.tokens.accessToken || !result.response.tokens.refreshToken || !result.response.user.id || !result.response.user.name || !result.response.user.lastName))) {
                this.commonErrorElement.style.display = 'block';
                return;
            }

            AuthUtils.setAuthInfo(result.response.tokens.accessToken, result.response.tokens.refreshToken, {
                name: result.response.user.name,
                lastName: result.response.user.lastName,
                id: result.response.user.id
            });

            this.openNewRoute('/');
        }

    }

}