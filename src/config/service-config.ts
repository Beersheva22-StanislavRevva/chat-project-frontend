
import AuthService from "../service/auth/AuthService";
import AuthserviceFake from "../service/auth/AuthServiceFake";
import AuthServiceJwt from "../service/auth/AuthServiceJwt";
import EmployeesService from "../service/crud/ContactsService";
import EmployeesServiceRest from "../service/crud/ContactsServiceRest";

export const authService: AuthService = new AuthServiceJwt('http://localhost:3500/users')
export const contactsService: EmployeesService = new EmployeesServiceRest('localhost:3500/');