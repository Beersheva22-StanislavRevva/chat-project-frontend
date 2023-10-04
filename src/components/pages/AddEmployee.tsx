import Contact from "../../model/Contact";
import { EmployeeForm } from "../forms/EmployeeForm";
import InputResult from "../../model/InputResult";
import { authService, contactsService } from "../../config/service-config";

import { useDispatchCode } from "../../hooks/hooks";

const AddEmployee: React.FC = () => {
     let successMessage: string = '';
        let errorMessage = '';
        const dispatch = useDispatchCode();
    async function submitFn(empl: Contact): Promise<InputResult> {
       
        const res: InputResult = {status: 'success', message: ''};
        try {
            const employee: Contact = await contactsService.addEmployee(empl);
            successMessage = `employee with id: ${employee.id} has been added`
            
        } catch (error: any) {
           errorMessage = error;
        }
        dispatch(errorMessage, successMessage);
        return res;
    }
    return <EmployeeForm submitFn={submitFn}/>
}
export default AddEmployee;