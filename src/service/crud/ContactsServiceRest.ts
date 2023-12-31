import { Observable, Subscriber } from "rxjs";
import Contact from "../../model/Contact";
import { AUTH_DATA_JWT } from "../auth/AuthServiceJwt";
import ContactsService from "./ContactsService";
import ResponseObj from "../../model/ResponseObj";
import UserData from "../../model/UserData";
import ChatMessage from "../../model/ChatMessage";
import { CONTACT_ID } from "../../components/pages/Contacts";
import { INIT_MSG } from "../../components/cards/Messages";
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
async function fetchRequest(url: string, options: RequestInit, cont?: Contact): Promise<Response> {
    options.headers = getHeaders();
    if (cont) {
        options.body = JSON.stringify(cont);
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
        if (el.blocked == 0) {
            activeContacts.includes(el.username) ? el.active = "online" :  el.active = "offline";
         } else {
            el.active = "blocked";
         }
    })
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

export default class ContactsServiceRest implements ContactsService {
    private observable: Observable<Contact[] | string> | null = null;
    private observableMessage: Observable<ChatMessage[] | string> | null = null;
    private subscriber: Subscriber <string | Contact[] > | undefined;
    private subscriberMessage: Subscriber <string | ChatMessage[] > | undefined;
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
     async getMessagesFromDB(username: string, id: string): Promise<ChatMessage[] | string> {
        let res: string | ChatMessage[];
        try {
            res = await fetchMessagesByContact (this.urlService, username, id);
        } catch (error) {
            throw error;
        }
        return res;
    }
    getMessages(username: string, id: string): Observable<ChatMessage[] | string> {
        if (this.observableMessage) {
            this.observableMessage = null;
        }
            this.observableMessage = new Observable<ChatMessage[] | string>(subscriber => {
                this.subscriberMessage = subscriber;
                const msg: ChatMessage = {
                    from: "",
                    text: "",
                    to: "",
                    dateTime: ""
                }
                
                id && this.subscriberMessageNext(username, id, msg);
            })
        
        return this.observableMessage;
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

    subscriberMessageNext(username: string, id: string, message:ChatMessage): void {
 
        
        let msg: ChatMessage[] = JSON.parse(localStorage.getItem(INIT_MSG) as string);
        if(localStorage.getItem(CONTACT_ID) == message.from) {
            msg.unshift(message);
            localStorage.setItem(INIT_MSG, JSON.stringify(msg));
            //this.subscriberMessage?.next(msg);
        }

        fetchMessagesByContact(this.urlService, username, id).then(msg => {
            (msg as ChatMessage[]).sort((a,b) => (new Date(b.dateTime) as any) - (new Date(a.dateTime) as any));
            this.subscriberMessage?.next(msg);
        }).catch(error => this.subscriberMessage?.next(error));
                
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
        if (localStorage.getItem(AUTH_ITEM)) {
            this.webSocket = new WebSocket(this.urlWebsocket+JSON.parse(localStorage.getItem(AUTH_ITEM)|| "").email, localStorage.getItem(AUTH_DATA_JWT) || '');
            this.webSocket.onmessage = message => {
                console.log(message.data);  
                this.subscriberNext();
                if (username?.email != null  && localStorage.getItem(CONTACT_ID)!=null) {
                    this.subscriberMessageNext(username.email, localStorage.getItem(CONTACT_ID) as string, message.data);
                }
             }
        }   
    }
    private disconnectWS(): void {
       this.webSocket?.close();
    }
    async block(username:string, blocked:number): Promise<void> {
        const serverRequestData:any = {};
        serverRequestData.username = username;
        serverRequestData.blocked = blocked;
        const response = await fetch(this.urlService + "users/block", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem(AUTH_DATA_JWT) || ''}`
            },
            body: JSON.stringify(serverRequestData)
          });
        //  if(response.ok) {
        // this.subscriberNext();
        //  }
    } 
}
