import {AuthUtils} from "./auth-utils";

export class AuthCheckUtils {

    constructor(openNewRoute) {

        this.openNewRoute = openNewRoute;

    }

    checkAndRedirect() {
        const accessToken = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey);
        if (!accessToken) {
            this.openNewRoute('/login');
            return false;
        }
        return true;
    }

}