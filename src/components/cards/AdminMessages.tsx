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
}

const AdminMessages: React.FC<Props> = ({initialMessages, contact, actionFn}) => {
    const userData = useSelectorAuth();
    //const messages = useSelectorMessages(userData?.email as string, contact.username as string);
    
    // const showMessages = messages.length == 0 ? initialMessages.map(el => {
    //  el.from == contact.username ? el.direction = "IN" : el.direction = "OUT"}) : messages.map(el => {
    //       el.from == contact.username ? el.direction = "IN" : el.direction = "OUT"
    // })
   
    const columnsCommon: GridColDef[] = [
    //  {
    //       field: 'direction', headerName: '', flex: 0.5, headerClassName: 'data-grid-header',
    //       align: 'center', headerAlign: 'center', type: "actions", getActions: (params) => {
    //            let res = [];
    //            if(params && params.row.direction == "IN") {
    //             res = [
    //                 <GridActionsCellItem label="messages" icon={<FileDownloadOutlined />}
    //                      />
    //             ] 
    //            } else {
    //                 res = [
    //                      <GridActionsCellItem label="messages" icon={<IosShareOutlined />}
    //                           />
    //                  ]  
    //            }
    //            return res;
    //       }

    //   },
        {
            field: 'from', headerName: 'from', flex: 0.5, headerClassName: 'data-grid-header',
            align: 'center', headerAlign: 'center'
        },
        {
            field: 'to', headerName: 'to', flex: 0.5, headerClassName: 'data-grid-header',
            align: 'center', headerAlign: 'center'
        },
        {
            field: 'text', headerName: 'message', flex: 0.5, headerClassName: 'data-grid-header',
            align: 'center', headerAlign: 'center'
        },
        {
            field: 'dateTime', headerName: 'Date&Time', flex: 0.5, headerClassName: 'data-grid-header',
            align: 'center', headerAlign: 'center', sortable: true
        },
     
    ];

      return <Box sx={{ height: '80vh', width: '80vw' }}>
          <Box sx={{ height: '3vh', width: 'auto', display: 'flex', direction: 'row', justifyContent:'right'}}>
                <IconButton onClick={actionFn} sx={{marginLeft:'2vw'}}> <CancelPresentationOutlined/></IconButton>
          </Box>
           <Box sx={{ height: '10vh', width: 'auto', textAlign: 'center', fontSize: '1.5em', display: 'flex',
            flexDirection: 'row', alignContent: 'center', justifyContent: 'center'}} >
                <Box marginRight={3}>
                    <img src={contact.avatar} alt="avatar" width="50" height="50"></img>
                </Box>
                <Box marginTop={1} fontSize={'0.8em'}>
                    {`All message history of: ${contact.nickname.toUpperCase()}`}
                </Box>
           </Box>
           
      <DataGrid columns={columnsCommon} rows = {initialMessages} />
  </Box>
    }
    export default AdminMessages;