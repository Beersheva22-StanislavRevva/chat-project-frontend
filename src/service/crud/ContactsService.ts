import { Observable } from "rxjs";
import Contact from "../../model/Contact";

export default interface EmployeesService {
    addEmployee(empl: Contact): Promise<Contact>;
    getContacts(): Observable<Contact[] | string>;
    deleteEmployee(id: any): Promise<void>;
    updateEmployee(empl: Contact): Promise<Contact>;
}