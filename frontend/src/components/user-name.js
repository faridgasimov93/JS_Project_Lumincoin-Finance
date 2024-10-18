import {AuthUtils} from "../ulits/auth-utils";

export class UserName {
    constructor() {
        const userInfo = AuthUtils.getAuthInfo(AuthUtils.userInfoTokenKey);
        if (userInfo) {
            const parsedUserInfo = JSON.parse(userInfo);
            const firstName = parsedUserInfo.name || '';
            const lastName = parsedUserInfo.lastName || '';
            const fullName = `
            ${firstName} ${lastName}
            `.trim();

            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = fullName;
            }
        }
    }
}