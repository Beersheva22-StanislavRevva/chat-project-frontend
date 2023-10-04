import { Box,  Modal, useMediaQuery, useTheme } from "@mui/material"
import { useState, useEffect, useRef, useMemo } from "react";
import Contact from "../../model/Contact";
import { contactsService } from "../../config/service-config";
import { Subscription } from 'rxjs';
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import AddCommentOutlined from '@mui/icons-material/AddCommentOutlined';
import { Delete, Details, Edit, Man, Visibility, Woman, } from "@mui/icons-material";
import { useSelectorAuth } from "../../redux/store";
import { Confirmation } from "../common/Confirmation";
import { EmployeeForm } from "../forms/EmployeeForm";
import InputResult from "../../model/InputResult";
import { useDispatchCode, useSelectorContacts } from "../../hooks/hooks";
import EmployeeCard from "../cards/EmployeeCard";
import ChatMessage from "../../model/ChatMessage";
import { error } from "console";
import Messages from "../cards/Messages";
import NewMessageForm from "../forms/NewMessageForm";

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
    width: '70vw',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center'
};

const Employees: React.FC = () => {
    const columnsActions: GridColDef[] = [
        {
            field: 'actions', type: "actions", getActions: (params) => {
                return [
                    <GridActionsCellItem label="messages" icon={<CommentOutlinedIcon />}
                        onClick={() => {
                        contactId.current = params.id as string;
                        showMessages();
                        }} />,
                    <GridActionsCellItem label="new message" icon={<AddCommentOutlined />}
                        onClick={() => {
                            contactId.current = params.id as string;
                            sendNewMessage();                      
                        }} />
                ] ;
            }
        }
       ]
    
    const dispatch = useDispatchCode();
    const userData = useSelectorAuth();
    const contacts = useSelectorContacts();
    const theme = useTheme();
    const isPortrait = useMediaQuery(theme.breakpoints.down('sm'));
    const columnsPortrait: GridColDef[] = getColumnsFromLandscape();
    const columns = useMemo(() => getColumns(), [userData, contacts, isPortrait]);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openEdit, setFlEdit] = useState(false);
    const [openDetails, setFlDetails] = useState(false);
    const title = useRef('');
    const content = useRef('');
    const contactId = useRef('');
    const confirmFn = useRef<any>(null);
    const employee = useRef<Contact | undefined>();
    const [messages, setMessages] = useState<ChatMessage[]| string>([]);
    const [openMessages, setFlOpenMessages] = useState(false);
    const [openNewMessage, setFlOpenNewMessage] = useState(false);   
    
    
    function getColumns(): GridColDef[] {
        
        return isPortrait ? columnsPortrait : getColumnsFromLandscape();
    }
    function getColumnsFromLandscape(): GridColDef[]{
        let res: GridColDef[] = columnsCommon;
        if (userData && userData.role == 'user'||'admin') {
            res = res.concat(columnsActions);
        }
        return res;
    }
    async function showMessages() {
        const username = userData?.email || "";
       let currentMessages = await getCurrentMessages(username, contactId.current) || [];
      if (typeof currentMessages != 'string' ) {
        changeUsernametoNick(currentMessages);
        sortMessagesByDate(currentMessages);
       }
       setMessages(currentMessages);
       setFlOpenNewMessage(false);
       setFlOpenMessages(true);
    }
    function changeUsernametoNick(currentMessages:ChatMessage[]):void {
        currentMessages.forEach(el => {
            el.from = contacts.find(c => c.username == el.from)?.nickname as string;
            el.to = contacts.find(c => c.username == el.to)?.nickname as string;
        })
    }
    function sortMessagesByDate(currentMessages:ChatMessage[]):void {
        currentMessages.sort((a,b) => (new Date(b.dateTime) as any) - (new Date(a.dateTime) as any));
    }
    
    function sendNewMessage() {
        setFlOpenMessages(false);
        setFlOpenNewMessage(true);
    }
    async function getCurrentMessages(username:string, contactName:string) {
        let res: ChatMessage[] | string = "";
        try {
        res =  await contactsService.getMessages(username, contactName);
        } catch(error) {
          throw error;
        }
        return res;
    }
    async function actualRemove(isOk: boolean) {
        let errorMessage: string = '';
        if (isOk) {
            try {
                await contactsService.deleteEmployee(contactId.current);
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
            showMessages();
        } else {
            setFlEdit(true)
        }
        setFlDetails(false)
    }
    function messagesCloseFn() {
        setFlOpenMessages(false)
    }
    function newMessageCloseFn() {
        setFlOpenNewMessage(false);
    }
    function newMessageSubmitFn(inputText:string) {
        const username = userData?.email;
        const contactName = contactId.current;
        const message : ChatMessage = {
            from: username as string,
            to: contactName,
            text: inputText,
            dateTime: "2023-01-01 00:00:00",
            readByRecepient: 0
        };
        contactsService.sendNewMessage(message);
        setFlOpenNewMessage(false);
    }

    return <Box sx={{
        display: 'flex', justifyContent: 'center',
        alignContent: 'center'
    }}>
        <Box sx={{ height: '80vh', width: 'auto' }}>
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
            open={openMessages}
            onClose={() => setFlOpenMessages(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}  >
                <Messages actionFn={messagesCloseFn} sendNewMessageFn={sendNewMessage} messages={messages as ChatMessage[]} contact={contacts.find(el => el.id == contactId.current) as Contact} />
            </Box>
        </Modal>
        <Modal
            open={openNewMessage}
            onClose={() => setFlOpenNewMessage(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}  >
            <NewMessageForm contact={contacts.find(el => el.id == contactId.current) as Contact}
            submitFn={newMessageSubmitFn} actionFn={newMessageCloseFn} showMessagesFn={showMessages}/>
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