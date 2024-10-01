export class AuthUtils {

    static accessTokenKey = 'accessToken';
    static refreshTokenKey = 'refreshToken';
    static userInfoTokenKey = 'userInfo';

    static setAuthInfo(accessToken, refreshToken, userInfo) {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
        localStorage.setItem(this.userInfoTokenKey, JSON.stringify(userInfo));
        // if (accessToken) {
        //     localStorage.setItem(this.accessTokenKey, accessToken);
        // }
        // if (refreshToken) {
        //     localStorage.setItem(this.refreshTokenKey, refreshToken);
        // }
        // if (userInfo) {
        //     localStorage.setItem(this.userInfoTokenKey, JSON.stringify(userInfo));
        // }
    }

    static deleteAuthInfo() {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userInfoTokenKey);
    }

    static getAuthInfo(key = null) {
        if (key && [this.accessTokenKey, this.refreshTokenKey, this.userInfoTokenKey].includes(key)) {
            return localStorage.getItem(key);
        } else {
            return {
                [this.accessTokenKey]: localStorage.getItem(this.accessTokenKey),
                [this.refreshTokenKey]: localStorage.getItem(this.refreshTokenKey),
                [this.userInfoTokenKey]: localStorage.getItem(this.userInfoTokenKey),
            }

        }
    }
}