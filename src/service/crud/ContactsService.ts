import { Observable } from "rxjs";
import Contact from "../../model/Contact";
import ChatMessage from "../../model/ChatMessage";

export default interface EmployeesService {
    sendNewMessage(message:ChatMessage) : void;
    getMessages(username: string, id: string): Promise<ChatMessage[] | string>;
    addEmployee(empl: Contact): Promise<Contact>;
    getContacts(): Observable<Contact[] | string>;
    deleteEmployee(id: any): Promise<void>;
    updateEmployee(empl: Contact): Promise<Contact>;
}