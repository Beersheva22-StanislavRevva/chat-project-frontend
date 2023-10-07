
import AuthService from "../service/auth/AuthService";
import AuthServiceJwt from "../service/auth/AuthServiceJwt";
import ContactsService from "../service/crud/ContactsService";
import ContactsServiceRest from "../service/crud/ContactsServiceRest";

export const authService: AuthService = new AuthServiceJwt('http://localhost:3500/users')
export const contactsService: ContactsService = new ContactsServiceRest('localhost:3500/');