import { useDispatch } from "react-redux";
import CodePayload from "../model/CodePayload";
import CodeType from "../model/CodeType";
import { codeActions } from "../redux/slices/codeSlice";
import { useEffect, useState } from "react";
import Contact from "../model/Contact";
import { Subscription } from "rxjs";
import { contactsService } from "../config/service-config";
import ChatMessage from "../model/ChatMessage";

export function useDispatchCode() {
    const dispatch = useDispatch();
    return (error: string, successMessage: string) => {
        let code: CodeType = CodeType.OK;
        let message: string = '';
        
        if (error.includes('Authentication')) {

            code = CodeType.AUTH_ERROR;
            message = "Authentication error, mooving to Sign In";
        } else {
            code = error.includes('unavailable') ? CodeType.SERVER_ERROR :
                CodeType.UNKNOWN;
            message = error;
        }
        dispatch(codeActions.set({ code, message: message || successMessage }))
    }
}
export function useSelectorContacts() {
    const dispatch = useDispatchCode();
    const [contacts, setContacts] = useState<Contact[]>([]);
    useEffect(() => {

        const subscription: Subscription = contactsService.getContacts()
            .subscribe({
                next(contArray: Contact[] | string) {
                    let errorMessage: string = '';
                    if (typeof contArray === 'string') {
                        errorMessage = contArray;
                    } else {
                        setContacts(contArray);
                    }
                    dispatch(errorMessage, '');

                }
            });
        return () => subscription.unsubscribe();
    }, []);
    return contacts;
}
export function useSelectorMessages(username:string, contact:string) {
    const dispatch = useDispatchCode();
   
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    
    useEffect(() => {
        const subscriptionMsg: Subscription = contactsService.getMessages(username, contact)
            .subscribe({
                next(msgArray: ChatMessage[] | string) {
                    let errorMessage: string = '';
                    if (typeof msgArray === 'string') {
                        errorMessage = msgArray;
                    } else {
                        setMessages(msgArray);
                    }
                    dispatch(errorMessage, '');

                }
            });
        return () => subscriptionMsg.unsubscribe();
    }, []);
    return messages;
}
