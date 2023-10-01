import { useDispatch } from "react-redux";
import CodePayload from "../model/CodePayload";
import CodeType from "../model/CodeType";
import { codeActions } from "../redux/slices/codeSlice";
import { useEffect, useState } from "react";
import Contact from "../model/Contact";
import { Subscription } from "rxjs";
import { contactsService } from "../config/service-config";

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
                next(emplArray: Contact[] | string) {
                    let errorMessage: string = '';
                    if (typeof emplArray === 'string') {
                        errorMessage = emplArray;
                    } else {
                        setContacts(emplArray.map(e => ({ ...e, birthDate: new Date(e.birthDate) })));
                    }
                    dispatch(errorMessage, '');

                }
            });
        return () => subscription.unsubscribe();
    }, []);
    return contacts;
}
