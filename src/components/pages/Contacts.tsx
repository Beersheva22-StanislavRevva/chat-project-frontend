import { Box, Modal, useMediaQuery, useTheme } from "@mui/material"
import { useState, useEffect, useRef, useMemo } from "react";
import Contact from "../../model/Contact";
import { contactsService } from "../../config/service-config";
import { Subscription } from 'rxjs';
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import AddCommentOutlined from '@mui/icons-material/AddCommentOutlined';
import {AppsOutlined,AppBlockingOutlined } from "@mui/icons-material";
import { useSelectorAuth } from "../../redux/store";
import { Confirmation } from "../common/Confirmation";
import { EmployeeForm } from "../forms/EmployeeForm";
import InputResult from "../../model/InputResult";
import { useDispatchCode, useSelectorContacts, useSelectorMessages } from "../../hooks/hooks";
import EmployeeCard from "../cards/EmployeeCard";
import ChatMessage from "../../model/ChatMessage";
import { error } from "console";
import Messages from "../cards/Messages";
import NewMessageForm from "../forms/NewMessageForm";
import AdminMessages from "../cards/AdminMessages";
export const CONTACT_ID = 'contact-id';

const columnsCommon: GridColDef[] = [
    {
        field: 'imageLink',
        headerName: '',
        flex: 0.7,
        headerClassName: 'data-grid-header',
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => <img src={params.row.avatar} alt="avatar" width="40vw" height="40vh"  />,
    },
    {
        field: 'nickname', headerName: '', flex: 0.5, headerClassName: 'data-grid-header',
        align: 'center', headerAlign: 'center'
    },
    {
        field: 'active', headerName: '', flex: 0.7, headerClassName: 'data-grid-header',
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

const Contacts: React.FC = () => {
    const columnsActions: GridColDef[] = [
        {
            field: 'actions', type: "actions", getActions: (params) => {
                return params.row.id != userData?.email && params.row.blocked == 0
                ? [<GridActionsCellItem label="messages" icon={<CommentOutlinedIcon />}
                        onClick={() => {
                            contactId.current = params.id as string;
                            showMessages();
                        }} />,
                    <GridActionsCellItem label="new message" icon={<AddCommentOutlined />}
                        onClick={() => {
                            contactId.current = params.id as string;
                            sendNewMessage();
                        }} />
                ]
                : []
            }
        }
    ]

    const columnsAdminActions: GridColDef[] = [
        {
            field: 'adminActions', type: "actions", getActions: (params) => {
                return params.row.id != userData?.email
                ? [<GridActionsCellItem label="all messages" icon={<AppsOutlined />}
                        onClick={() => {
                            contactId.current = params.id as string;
                            showAllContactMessages();
                            
                        }} />,
                    <GridActionsCellItem label="block" icon={<AppBlockingOutlined />}
                        onClick={() => {
                            contactId.current = params.id as string;
                            blockUser();
                        }} />
                ]
                : []
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
    const [messages, setMessages] = useState<ChatMessage[] | string>([]);
    const [openMessages, setFlOpenMessages] = useState(false);
    const [openNewMessage, setFlOpenNewMessage] = useState(false);
    const [openAdminMessages, setFlOpenAdminMessages] = useState(false);

    function getColumns(): GridColDef[] {

        return isPortrait ? columnsPortrait : getColumnsFromLandscape();
    }
    function getColumnsFromLandscape(): GridColDef[] {
        let res: GridColDef[] = columnsCommon;
        res = res.concat(columnsActions);
        if (userData && userData.role == "admin") {
            res = res.concat(columnsAdminActions);
        }
        return res;
    }
    async function showMessages() {
        localStorage.setItem(CONTACT_ID, contactId.current);
        const initialMessages = await contactsService.getMessagesFromDB(userData?.email as string, contactId.current);
        sortMessagesByDate(initialMessages as ChatMessage[]);
        setMessages(initialMessages);
        setFlOpenNewMessage(false);
        setFlOpenMessages(true);
    }

    async function showAllContactMessages() {
        localStorage.setItem(CONTACT_ID, contactId.current);
        const initialMessages = await contactsService.getMessagesFromDB(contactId.current, 'all');
        sortMessagesByDate(initialMessages as ChatMessage[]);
        changeUsernametoNick((initialMessages as ChatMessage[]));
        setMessages(initialMessages);
        setFlOpenAdminMessages(true);
    }

    async function blockUser() {
        localStorage.setItem(CONTACT_ID, contactId.current);
        let newStatus;
        contacts.find(el => el.id == contactId.current)?.blocked == 0
        ? newStatus = 1 : newStatus = 0;
        await contactsService.block(contactId.current, newStatus);
    }

    function changeUsernametoNick(currentMessages: ChatMessage[]): void {
        currentMessages.forEach(el => {
            el.from = contacts.find(c => c.username == el.from)?.nickname as string;
            el.to = contacts.find(c => c.username == el.to)?.nickname as string;
        })
    }
    function sortMessagesByDate(currentMessages: ChatMessage[]): void {
        currentMessages.sort((a, b) => (new Date(b.dateTime) as any) - (new Date(a.dateTime) as any));
    }

    function sendNewMessage() {
        setFlOpenMessages(false);
        localStorage.removeItem(CONTACT_ID);
        setFlOpenNewMessage(true);
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
    function cardAction(isDelete: boolean) {
        if (isDelete) {
            showMessages();
        } else {
            setFlEdit(true)
        }
        setFlDetails(false)
    }
    function messagesCloseFn() {
        localStorage.removeItem(CONTACT_ID);
        setFlOpenMessages(false);
        setFlOpenAdminMessages(false);
    }
    function newMessageCloseFn() {
        setFlOpenNewMessage(false);
    }
    function newMessageSubmitFn(inputText: string) {
        const username = userData?.email;
        const contactName = contactId.current;
        const message: ChatMessage = {
            from: username as string,
            to: contactName,
            text: inputText,
            dateTime: new Date().toString(),
            readByRecepient: 0
        };
        contactsService.sendNewMessage(message);
        setFlOpenNewMessage(false);
        showMessages();

    }

    return <Box sx={{
        display: 'flex', flexDirection: "column",
        alignContent: 'center', justifyContent: 'center'
    }}>
        <Box sx={{ height: '7vh', width: 'auto', textAlign: 'center', fontSize: '1.2em', display: 'flex',
            flexDirection: 'row', alignContent: 'center', justifyContent: 'center'}} >
                {`Select contact`}
        </Box>

        <Box sx={{ height: '80vh', width: 'auto', marginLeft:'10vw', marginRight:'10vw' }}>
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
                <Messages actionFn={messagesCloseFn} sendNewMessageFn={sendNewMessage} initialMessages={messages as ChatMessage[]} contact={contacts.find(el => el.id == contactId.current) as Contact} />
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
                    submitFn={newMessageSubmitFn} actionFn={newMessageCloseFn} showMessagesFn={showMessages} />
            </Box>
        </Modal>
        <Modal
            open={openAdminMessages}
            onClose={() => setFlOpenAdminMessages(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}  >
                <AdminMessages actionFn={messagesCloseFn} initialMessages={messages as ChatMessage[]} contact={contacts.find(el => el.id == contactId.current) as Contact} />
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
export default Contacts;