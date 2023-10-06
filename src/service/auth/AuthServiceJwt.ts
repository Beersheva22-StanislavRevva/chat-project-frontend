import { CONTACT_ID } from "../../components/pages/Contacts";
import LoginData from "../../model/LoginData";
import UserData from "../../model/UserData";
import AuthService from "./AuthService";
export const AUTH_DATA_JWT = 'auth-data-jwt';
function getUserData(data: any): UserData {
    const jwt = data.accessToken;
    localStorage.setItem(AUTH_DATA_JWT, jwt);
    const jwtPayloadJSON = atob(jwt.split('.')[1]);
    const jwtPayloadObj = JSON.parse(jwtPayloadJSON);
    return {email: jwtPayloadObj.sub, role: jwtPayloadObj.roles.includes("ADMIN") ? "admin": "user"};

}
function getSignUpData(data: any): UserData {
        return {email: data.username, role: data.roles.includes("ADMIN") ? "admin": "user"};

}
export default class AuthServiceJwt implements AuthService {
    constructor(private url: string){}
    async addNewUser(loginData: LoginData): Promise<UserData> {
        const serverLoginData:any = {};
        serverLoginData.username = loginData.email;
        serverLoginData.password = loginData.password;
        serverLoginData.roles = ["USER"];
        serverLoginData.nickname = loginData.nickname;
        serverLoginData.blocked = 0;
        serverLoginData.avatar = loginData.avatar;
        const response = await fetch(this.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(serverLoginData)
           });
       
        return response.ok ? getSignUpData(await response.json()) : null;
    }
    getAvailableProvider(): { providerName: string; providerIconUrl: string; }[] {
        return [];
    }
    async login(loginData: LoginData): Promise<UserData > {
        const serverLoginData:any = {}; 
        serverLoginData.username = loginData.email;
        serverLoginData.password = loginData.password;
       const response = await fetch(this.url + "/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(serverLoginData)
       });
       
        return response.ok ? getUserData(await response.json()) : null;
    }
    async logout(): Promise<void> {
       localStorage.removeItem(AUTH_DATA_JWT);
    }
    
    
}