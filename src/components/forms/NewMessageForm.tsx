import { Box, Button, Card, CardActions, CardContent, Grid, IconButton, TextField, Typography } from "@mui/material"
import { useSelectorAuth } from "../../redux/store";
import { getISODateStr } from "../../util/date-functions";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Contact from "../../model/Contact";
import { useState } from "react";
import { AddBoxOutlined, CancelPresentationOutlined } from "@mui/icons-material";




type Props = {
    contact: Contact;
    submitFn: (text: string) => void;
    actionFn: () => void;
    showMessagesFn: () => void;
}

const NewMessageForm: React.FC<Props> = ({ contact, submitFn, actionFn, showMessagesFn }) => {

    const [text, setText] = useState("");
    const [errorMessage, setErrorMessage] = useState('');

    function handlerText(event: any) {
        setErrorMessage('');
        const textValue = event.target.value;
        setText(textValue);
    }

    function onSubmitFn(event: any) {
        event.preventDefault();
        if (text.length == 0) {
            setErrorMessage("Message is empty")
        }
        submitFn(text);
        setText("");
    }

    function onResetFn(event: any) {
        setText("");
    }
    return <Box sx={{ height: '80vh', width: '80vw' }}>
        <Box sx={{ height: '3vh', width: 'auto', display: 'flex', direction: 'row', justifyContent:'right'}}>
               <IconButton onClick={showMessagesFn} > <AddBoxOutlined/><div style={{fontSize:'0.8em', marginLeft:'1vw'}}>show messages</div></IconButton>
               <IconButton onClick={actionFn} sx={{marginLeft:'2vw'}}> <CancelPresentationOutlined/></IconButton>
          </Box>
        <Box sx={{ height: '10vh', width: 'auto', textAlign: 'center', fontSize: '1.5em' }} >
            {`New message to ${contact.nickname}`}
        </Box>
        <form onSubmit={onSubmitFn} onReset={onResetFn}>
            <Grid item xs={8} sm={5} >
                <TextField type="text" required fullWidth label="Message"
                    helperText="enter text" onChange={handlerText}
                    value={text} />
            </Grid>
            <Box sx={{ marginTop: { xs: "10vh", sm: "5vh" }, textAlign: "center" }}>
                <Button type="submit" >Submit</Button>
                <Button type="reset">Reset</Button>
            </Box>
        </form>
    </Box>
}
export default NewMessageForm;