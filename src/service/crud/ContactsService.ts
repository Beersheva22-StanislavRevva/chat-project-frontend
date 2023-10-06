import { Observable } from "rxjs";
import Contact from "../../model/Contact";
import ChatMessage from "../../model/ChatMessage";

export default interface EmployeesService {
    block(username:string, status:number): Promise<void>
    sendNewMessage(message:ChatMessage) : void;
    getMessagesFromDB(username: string, id: string): Promise<ChatMessage[] | string>;
    subscriberMessageNext(username: string, id: string): void
    getMessages(username: string, id: string): Observable<ChatMessage[] | string>;
    addEmployee(empl: Contact): Promise<Contact>;
    getContacts(): Observable<Contact[] | string>;
    deleteEmployee(id: any): Promise<void>;
    updateEmployee(empl: Contact): Promise<Contact>;
}