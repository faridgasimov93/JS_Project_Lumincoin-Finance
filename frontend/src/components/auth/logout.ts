import {AuthUtils} from "../../ulits/auth-utils";
import {HttpUtils} from "../../ulits/http-utils";

export class Logout {

    private openNewRoute: (url: string) => Promise<void>;

    constructor(openNewRoute: (url: string) => Promise<void>) {
        this.openNewRoute = openNewRoute;

        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) || !AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey)) {
            void this.openNewRoute('/login');
            return;
        }
        this.logout();
    }

    private async logout():Promise<void> {

        await HttpUtils.request('/logout', 'POST', false,{
            refreshToken: AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey),
        });
        AuthUtils.deleteAuthInfo();
        this.openNewRoute('/login');
    }

}