import { Observable } from "rxjs";
import Contact from "../../model/Contact";
import ChatMessage from "../../model/ChatMessage";

export default interface ContactsService {
    block(username:string, status:number): Promise<void>
    sendNewMessage(message:ChatMessage) : void;
    getMessagesFromDB(username: string, id: string): Promise<ChatMessage[] | string>;
    subscriberMessageNext(username: string, id: string, message: ChatMessage): void
    getMessages(username: string, id: string): Observable<ChatMessage[] | string>;
    getContacts(): Observable<Contact[] | string>;
    
}