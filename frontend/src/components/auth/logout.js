import {AuthUtils} from "../../ulits/auth-utils";
import {HttpUtils} from "../../ulits/http-utils";

export class Logout {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) || !AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey)) {
            return this.openNewRoute('/login');
        }
        this.logout().then();
    }

    async logout() {

        await HttpUtils.request('/logout', 'POST', false,{
            refreshToken: AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey),
        });
        AuthUtils.deleteAuthInfo();
        this.openNewRoute('/login');
    }

}