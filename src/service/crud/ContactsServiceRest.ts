import { Observable, Subscriber } from "rxjs";
import Contact from "../../model/Contact";
import { AUTH_DATA_JWT } from "../auth/AuthServiceJwt";
import EmployeesService from "./ContactsService";
import ResponseObj from "../../model/ResponseObj";
import UserData from "../../model/UserData";
import ChatMessage from "../../model/ChatMessage";
const AUTH_ITEM = "auth-item";

async function getResponseText(response: Response): Promise<string> {
    let res = '';
    if (!response.ok) {
        const { status, statusText } = response;
        res = status == 401 || status == 403 ? 'Authentication' : await response.text();
    }
    return res;

}
function getHeaders(): HeadersInit {
    const res: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(AUTH_DATA_JWT) || ''}`
    }
    return res;
}
async function fetchRequest(url: string, options: RequestInit, empl?: Contact): Promise<Response> {
    options.headers = getHeaders();
    if (empl) {
        options.body = JSON.stringify(empl);
    }

    let flUpdate = true;
    let responseText = '';
    try {
        if (options.method == "DELETE" || options.method == "PUT") {
            flUpdate = false;
            await fetchRequest(url, {method: "GET"});
            flUpdate = true;
        }

        const response = await fetch(url, options);
        responseText = await getResponseText(response);
        if (responseText) {
            throw responseText;
        }
        return response;
    } catch (error: any) {
        if (!flUpdate) {
            throw error;
        }
        throw responseText ? responseText : "Server is unavailable. Repeat later on";
    }
}
async function fetchAllContacts(url: string):Promise< Contact[]|string> {
    let activeContacts:string[] = await fetchActiveContacts(url+"contacts");
    const response = await fetchRequest(url+"users", {});
    let res = await response.json();
    (res as Contact[]).forEach(el => {
    activeContacts.includes(el.username) ? el.active = "online" :  el.active = "offline";
    }
    )
    return res;
}

async function fetchMessagesByContact(url: string, username: string, contactname: string):Promise< ChatMessage[]|string> {
    let response = await fetchRequest(url+"messages/from/"+ username + "/to/" + contactname, {});
    let res = await response.json() as [];
    response = await fetchRequest(url+"messages/from/"+ contactname + "/to/" + username, {});
    const tmp = await response.json() as [];
    tmp.forEach(el => res.push(el));
    return res;
}

async function fetchActiveContacts(url: string):Promise<[]> {
    const response = await fetchRequest(url, {});
    return await response.json()
}

export default class EmployeesServiceRest implements EmployeesService {
    private observable: Observable<Contact[] | string> | null = null;
    private subscriber: Subscriber <string | Contact[] > | undefined;
    private urlService:string;
    private urlWebsocket:string;
    private webSocket: WebSocket | undefined;
    private contacts: Map <string, Contact>;
    private activeContacts:[] = [];
    constructor( baseUrl: string) { 
        this.urlService = `http://${baseUrl}`;
        this.urlWebsocket = `ws://${baseUrl}users/websocket/`;
        this.contacts = new Map <string, Contact>
        
    }
    sendNewMessage(message: ChatMessage): void {
        this.webSocket?.send(JSON.stringify(message));
    }
     async getMessages(username: string, id: string): Promise<ChatMessage[] | string> {
        let res: string | ChatMessage[];
        try {
            res = await fetchMessagesByContact (this.urlService, username, id);
        } catch (error) {
            throw error;
        }
        return res;
    }
    
   
    async updateEmployee(empl: Contact): Promise<Contact> {
        const response = await fetchRequest(this.getUrlWithId(empl.id!),
            { method: 'PUT' }, empl);
            
        return await response.json();

    }
    private getUrlWithId(id: any): string {
        return `${this.urlService}/${id}`;
    }
    private subscriberNext(): void {
        
        fetchAllContacts(this.urlService).then(cont => {
            (cont as Contact[]).forEach(e => {
                this.contacts.set(e.id = e.username, e);
            })
            this.subscriber?.next(cont);
            })
        .catch(error => this.subscriber?.next(error));
    }
    async deleteEmployee(id: any): Promise<void> {
            await fetchRequest(this.getUrlWithId(id), {
                method: 'DELETE',
            });
    }
    getContacts(): Observable<Contact[] | string> {
        if (!this.observable) {
            this.observable = new Observable<Contact[] | string>(subscriber => {
                this.subscriber = subscriber;
                this.subscriberNext();
               this.connectWS();
                return () => this.disconnectWS();
            })
        }
        return this.observable;
    }
    private connectWS() {
        const usernameStr = localStorage.getItem(AUTH_ITEM);
        let username:UserData;
        usernameStr? username = JSON.parse(usernameStr) : username = null ;
        if (localStorage.getItem(AUTH_ITEM)){
            this.webSocket = new WebSocket(this.urlWebsocket+JSON.parse(localStorage.getItem(AUTH_ITEM)|| "").email, localStorage.getItem(AUTH_DATA_JWT) || '');
            this.webSocket.onmessage = message => {
            console.log(message.data);
            this.subscriberNext();
            
        }
        }   
    }
    private disconnectWS(): void {
       this.webSocket?.close();
    }  
    async addEmployee(empl: Contact): Promise<Contact> {
        if (empl.id == 0) {
            delete empl.id;    
        }
            const response = await fetchRequest(this.urlService, {
                method: 'POST',
               }, empl)
           ;
           return response.json();

    }
    private editEmployeesMap(responseObj: ResponseObj) {
       switch (responseObj.task) {
        case "add":
           this.contacts.set(responseObj.employee.id, responseObj.employee);
           break;
        case "delete":
            this.contacts.delete(responseObj.employee.id);
            break;
        case "update":
            this.contacts.delete(responseObj.employee.id);
            this.contacts.set(responseObj.employee.id, responseObj.employee);
            break;
        }
        this.subscriber?.next(Array.from(this.contacts.values()));
    }
}
