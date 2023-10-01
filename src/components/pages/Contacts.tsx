import { Box,  Modal, useMediaQuery, useTheme } from "@mui/material"
import { useState, useEffect, useRef, useMemo } from "react";
import Contact from "../../model/Contact";
import { contactsService } from "../../config/service-config";
import { Subscription } from 'rxjs';
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import { Delete, Details, Edit, Man, Visibility, Woman, } from "@mui/icons-material";
import { useSelectorAuth } from "../../redux/store";
import { Confirmation } from "../common/Confirmation";
import { EmployeeForm } from "../forms/EmployeeForm";
import InputResult from "../../model/InputResult";
import { useDispatchCode, useSelectorContacts } from "../../hooks/hooks";
import EmployeeCard from "../cards/EmployeeCard";
// const columnsCommon: GridColDef[] = [
//     {
//         field: 'id', headerName: 'ID', flex: 0.5, headerClassName: 'data-grid-header',
//         align: 'center', headerAlign: 'center'
//     },
//     {
//         field: 'name', headerName: 'Name', flex: 0.7, headerClassName: 'data-grid-header',
//         align: 'center', headerAlign: 'center'
//     },
//     {
//         field: 'birthDate', headerName: "Date", flex: 0.8, type: 'date', headerClassName: 'data-grid-header',
//         align: 'center', headerAlign: 'center'
//     },
//     {
//         field: 'department', headerName: 'Department', flex: 0.8, headerClassName: 'data-grid-header',
//         align: 'center', headerAlign: 'center'
//     },
//     {
//         field: 'salary', headerName: 'Salary', type: 'number', flex: 0.6, headerClassName: 'data-grid-header',
//         align: 'center', headerAlign: 'center'
//     },
//     {
//         field: 'gender', headerName: 'Gender', flex: 0.6, headerClassName: 'data-grid-header',
//         align: 'center', headerAlign: 'center', renderCell: params => {
//             return params.value == "male" ? <Man/> : <Woman/>
//         }
//     },
//    ];

   const columnsCommon: GridColDef[] = [
    {
        field: 'nickname', headerName: 'NICKNAME', flex: 0.5, headerClassName: 'data-grid-header',
        align: 'center', headerAlign: 'center'
    },
    {
        field: 'active', headerName: 'STATUS', flex: 0.7, headerClassName: 'data-grid-header',
        align: 'center', headerAlign: 'center'
    },
    
    
   ];
   
   
const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const Employees: React.FC = () => {
    const columnsActions: GridColDef[] = [
        {
            field: 'actions', type: "actions", getActions: (params) => {
                return [
                    <GridActionsCellItem label="messages" icon={<CommentOutlinedIcon />}
                        onClick={() => showMessages(params.id)
                            //TODO
                        } />,
                    <GridActionsCellItem label="new message" icon={<AddCommentOutlinedIcon />}
                        onClick={() => {
                            //TODO
                            //newMessage(params.id)
                            employeeId.current = params.id as any;
                            if (params.row) {
                                const empl = params.row;
                                empl && (employee.current = empl);
                                setFlEdit(true)
                            }
    
                        }
                        } />
                ] ;
            }
        }
       ]
       const columnsPortrait: GridColDef[] = [
        columnsCommon[0],
        columnsCommon[1],
        {
            field: 'actions', type: "actions", getActions: (params) => {
                return [
                   
                    <GridActionsCellItem label="details" icon={<Visibility />}
                        onClick={() => {
                            employeeId.current = params.id as any;
                            if (params.row) {
                                const empl = params.row;
                                empl && (employee.current = empl);
                                setFlDetails(true)
                            }
    
                        }
                        } />
                ] ;
            }
        }
       ]
    const dispatch = useDispatchCode();
    const userData = useSelectorAuth();
    const contacts = useSelectorContacts();
    const theme = useTheme();
    const isPortrait = useMediaQuery(theme.breakpoints.down('sm'));
    const columns = useMemo(() => getColumns(), [userData, contacts, isPortrait]);

    const [openConfirm, setOpenConfirm] = useState(false);
    const [openEdit, setFlEdit] = useState(false);
    const [openDetails, setFlDetails] = useState(false);
    const title = useRef('');
    const content = useRef('');
    const employeeId = useRef('');
    const confirmFn = useRef<any>(null);
    const employee = useRef<Contact | undefined>();
    
    
    function getColumns(): GridColDef[] {
        
        return isPortrait ? columnsPortrait : getColumnsFromLandscape();
    }
    function getColumnsFromLandscape(): GridColDef[]{
        let res: GridColDef[] = columnsCommon;
        if (userData && userData.role == 'user') {
            res = res.concat(columnsActions);
        }
        return res;
    }
    function showMessages(id: any) {
        title.current = "Remove Employee object?";
        const employee = contacts.find(empl => empl.id == id);
        content.current = `You are going remove employee with id ${employee?.id}`;
        employeeId.current = id;
        confirmFn.current = actualRemove;
        setOpenConfirm(true);
    }
    async function actualRemove(isOk: boolean) {
        let errorMessage: string = '';
        if (isOk) {
            try {
                await contactsService.deleteEmployee(employeeId.current);
            } catch (error: any) {
                errorMessage = error;
            }
        }
        dispatch(errorMessage, '');
        setOpenConfirm(false);
    }
    function updateEmployee(empl: Contact): Promise<InputResult> {
        setFlEdit(false)
        const res: InputResult = { status: 'error', message: '' };
        if (JSON.stringify(employee.current) != JSON.stringify(empl)) {
            title.current = "Update Employee object?";
            employee.current = empl;
            content.current = `You are going update employee with id ${empl.id}`;
            confirmFn.current = actualUpdate;
            setOpenConfirm(true);
        }
        return Promise.resolve(res);
    }
    async function actualUpdate(isOk: boolean) {
       
        let errorMessage: string = '';

        if (isOk) {
            try {
                await contactsService.updateEmployee(employee.current!);
            } catch (error: any) {
                errorMessage = error
            }
        }
        dispatch(errorMessage, '');
        setOpenConfirm(false);

    }
    function cardAction(isDelete: boolean){
        if (isDelete) {
            showMessages(employeeId.current);
        } else {
            setFlEdit(true)
        }
        setFlDetails(false)
    }

    return <Box sx={{
        display: 'flex', justifyContent: 'center',
        alignContent: 'center'
    }}>
        <Box sx={{ height: '80vh', width: '50vw' }}>
            <DataGrid columns={columns} rows={contacts} />
        </Box>
        <Confirmation confirmFn={confirmFn.current} open={openConfirm}
            title={title.current} content={content.current}></Confirmation>
        <Modal
            open={openEdit}
            onClose={() => setFlEdit(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <EmployeeForm submitFn={updateEmployee} employeeUpdated={employee.current} />
            </Box>
        </Modal>
        <Modal
            open={openDetails}
            onClose={() => setFlDetails(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <EmployeeCard actionFn={cardAction} employee={employee.current!} />
            </Box>
        </Modal>


    </Box>
}
export default Employees;