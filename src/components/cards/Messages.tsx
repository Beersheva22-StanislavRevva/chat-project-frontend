import { Box, Button, Card, CardActions, CardContent, IconButton, Typography } from "@mui/material"
import { useSelectorAuth } from "../../redux/store";
import { getISODateStr } from "../../util/date-functions";
import ChatMessage from "../../model/ChatMessage";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";

import Contact from "../../model/Contact";
import {AddBoxOutlined, CancelPresentationOutlined, FileDownloadOutlined, IosShareOutlined } from "@mui/icons-material";
import { useSelectorMessages } from "../../hooks/hooks";
import { CONTACT_ID } from "../pages/Contacts";

type Props = {
    initialMessages: ChatMessage[];
    contact: Contact;
    actionFn: () => void;
    sendNewMessageFn: () => void
}

const Message: React.FC<Props> = ({initialMessages, contact, actionFn, sendNewMessageFn}) => {
    const userData = useSelectorAuth();
    const messages = useSelectorMessages(userData?.email as string, contact.username as string);
    
    
    //initialMessages.sort((a,b) => (new Date(b.dateTime) as any) - (new Date(a.dateTime) as any));
    
    const showMessages = messages.length == 0 ? initialMessages.map(el => {
     el.from == contact.username ? el.direction = "IN" : el.direction = "OUT"}) : messages.map(el => {
          el.from == contact.username ? el.direction = "IN" : el.direction = "OUT"
    })
   
    const columnsCommon: GridColDef[] = [
     {
          field: 'direction', headerName: '', flex: 0.5, headerClassName: 'data-grid-header',
          align: 'center', headerAlign: 'center', type: "actions", getActions: (params) => {
               let res = [];
               if(params && params.row.direction == "IN") {
                res = [
                    <GridActionsCellItem label="messages" icon={<FileDownloadOutlined />}
                         />
                ] 
               } else {
                    res = [
                         <GridActionsCellItem label="messages" icon={<IosShareOutlined />}
                              />
                     ]  
               }
               return res;
          }

      },
     {
          field: 'text', headerName: 'Message', flex: 1.0, headerClassName: 'data-grid-header',
          align: 'center', headerAlign: 'center'
      },
      {
          field: 'dateTime', headerName: 'Date&Time', flex: 0.5, headerClassName: 'data-grid-header',
          align: 'center', headerAlign: 'center', sortable: true ,sortingOrder: ['desc']
      },
     
    ];



      return <Box sx={{ height: '80vh', width: '80vw' }}>
          <Box sx={{ height: '3vh', width: 'auto', display: 'flex', direction: 'row', justifyContent:'right'}}>
               <IconButton onClick={sendNewMessageFn} > <AddBoxOutlined/><div style={{fontSize:'0.8em', marginLeft:'1vw'}}>new message</div></IconButton>
               <IconButton onClick={actionFn} sx={{marginLeft:'2vw'}}> <CancelPresentationOutlined/></IconButton>
          </Box>
           <Box sx={{ height: '10vh', width: 'auto', textAlign: 'center', fontSize: '1.5em' }} >
            {`History of correspondence with ${contact.nickname}`}
        </Box>
      <DataGrid columns={columnsCommon} rows = {messages.length == 0 ? initialMessages : messages} />
  </Box>
    }
    export default Message;