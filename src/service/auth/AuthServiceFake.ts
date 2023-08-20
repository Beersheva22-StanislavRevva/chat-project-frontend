import LoginData from "../../model/LoginData";
import UserData from "../../model/UserData";
import AuthService from "./AuthService";

export  default class AuthserviceFake implements AuthService {
    getAvailableProvider(): { providerName: string; providerIconUrl: string; }[] {
        return [];
    }
    async login(loginData: LoginData): Promise<UserData> {
        const UserData: UserData = 
        { email: loginData.email,
            role: loginData.email.includes('admin') ?
            'admin' : 'user' }
        return UserData;
    }
    async logout(): Promise<void> {
        
    }
    
}