import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LoginData from '../../model/LoginData';
import InputResult from '../../model/InputResult';
import { Alert, Divider, FormControl, FormHelperText, FormLabel, Modal, Radio, RadioGroup, Snackbar } from '@mui/material';
import { StatusType } from '../../model/StatusType';
import { NetworkType } from '../../service/auth/AuthService';
import { BorderAll, Height, HowToRegOutlined } from '@mui/icons-material';
import { ChangeEvent } from 'react';
import employeeConfig from '../../config/employee-config.json'

const {avatars} = employeeConfig;
function Copyright(props: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://tel-ran.com/">
                Tel-Ran
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();
type Props = {
    submitFn: (loginData: LoginData) => Promise<InputResult>
    networks?: NetworkType[]
}
const SignUpForm: React.FC<Props> = ({ submitFn, networks }) => {
    const message = React.useRef<string>('');
    const [open, setOpen] = React.useState(false);
    const severity = React.useRef<StatusType>('success');
    const [avatarPath, setavatarPath] = React.useState(avatars[0]);
    const [oldbuttonId, setOldbuttonId]  = React.useState("");


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const email: string = data.get('email')! as string;
        const password: string = data.get('password')! as string;
        const nickname: string = data.get('nickname')! as string;
        const avatar = avatarPath;
        const result = await submitFn({ email, password, nickname, avatar});
        message.current = result.message!;
        severity.current = result.status;
        message.current && setOpen(true);
    };
    const [newReg,setNewReg] = React.useState(false);

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: { xs: 8, sm: -4, md: 8 },

                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'lightgrey' }}>
                        <HowToRegOutlined />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign Up
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }} display={"flex"} flexDirection={"column"} justifyContent={'center'} alignContent={'center'}>
                        <Grid container  justifyContent={'center'}  alignContent={'center'}  spacing={3}>
                            <Grid item xs={12} sm={10} md={12} display={'flex'} flexDirection={'row'} justifyContent={'center'}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Username"
                                    name="email"
                                    autoComplete="email"
                                    autoFocus

                                />
                            </Grid>
                            <Grid item xs={12} sm={10} md={12} display={'flex'} flexDirection={'row'} justifyContent={'center'}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="nickname"
                                    label="Nickname"
                                    name="nickname"
                                    autoComplete="nickname"
                                    autoFocus

                                />
                            </Grid>
                            <Grid item xs={12} sm={10} md={12} display={'flex'} flexDirection={'row'} justifyContent={'center'}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"

                                />
                            </Grid>
                            <Grid item xs={4} sm={10} md={12} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                                <Box textAlign={"center"}>
                                    Select avatar
                                </Box>
                                <Box width={'30vw'} display={'flex'} flexDirection={'row'} justifyContent={'center'}>
                                {avatars.map((n, index) =>
                                    <Button key={n}
                                        onClick={() => {
                                            setavatarPath(n);
                                           if(oldbuttonId){
                                            let oldbutton = document.getElementById(oldbuttonId);
                                                if (oldbutton) {
                                                oldbutton.style.border = "";
                                                }
                                           }
                                           const buttonId = "avatar" + index
                                           let button = document.getElementById(buttonId);
                                           if (button) {
                                            setOldbuttonId(buttonId);
                                            button.style.border = "dotted";
                                           }
                                                   
                                        }
                                        }
                                        fullWidth
                                        id = {"avatar" + index}
                                        variant= {'text'} 
                                        sx={{ mt: 1, width: '7vw', height: '7vw' }}
>                                    
                                        <Avatar src={n} sx={{ width: { xs: '6vh', sm: '6vw', lg: '3vw' } }} />
                                    </Button>)}
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={10} md={12} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                                <Box width={'30vw'} display={'flex'} flexDirection={'row'} justifyContent={'center'}>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color='secondary'

                                >
                                   Sign Up
                                </Button>
                                </Box>
                            </Grid>
                            {networks && networks.length > 0 && <Grid item xs={6}  sm={6} md={6}>
                                <Divider sx={{ width: "100%", fontWeight: "bold" }}>or</Divider>
                            <Grid item xs={12} sm={6} md={12} display={'flex'} flexDirection={'row'} justifyContent={'center'}>
                            {networks.map(n => 
                            <Button key={n.providerName}
                                onClick={() =>
                                    submitFn({ email: n.providerName, password: '' })} fullWidth variant="outlined"
                                sx={{ mt: 1, width: '8vw', height: '8vw'}}
                            >
                                <Avatar src={n.providerIconUrl} sx={{ width: { xs: '6vh', sm: '6vw', lg: '3vw' } }} />
                            </Button>)}
                            </Grid>
                            </Grid>}
                        </Grid>
                    </Box>
                    <Snackbar open={open} autoHideDuration={10000}
                        onClose={() => setOpen(false)}>
                        <Alert onClose={() => setOpen(false)} severity={severity.current} sx={{ width: '100%' }}>
                            {message.current}
                        </Alert>
                    </Snackbar>
                    <Modal
                        open = {newReg}
                        onClose={() => setNewReg(false)}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={{ height: '50vh', width: '70vw', backgroundColor:'white' }}>
                            
                        </Box>    
                    </Modal>
                </Box>
                <Copyright sx={{ mt: 4, mb: 4 }} />

            </Container>
        </ThemeProvider>
    );
}
export default SignUpForm;