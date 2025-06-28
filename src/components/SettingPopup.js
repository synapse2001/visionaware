import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { styled } from '@mui/system';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { useTheme } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { getAIResponse, onboarding, updateEmbedding } from '../services/azure_visionary';

const SettingPopup = ({
  open,
  handleClose,
  settings,
  handleSettingUpdate,
  selectedCamera,
  cameraList,
  handleCameraChange,
  selectedPrompt,
  handlePromptChange,
}) => {
  const {
    temperature,
    selectedModel,
    silenceThresholdSeconds,
    voice,
    rate,
    usetextTospeech,
    userecurringSession,
    imageLimitValue,
    username,
    usernameLock
  } = settings;

  const synth = window.speechSynthesis;
  const [voiceList, setVoiceList] = React.useState([]);
  const theme = useTheme();
  const [tempUsername, setTempUsername] = useState(username);


  useEffect(() => {
    // const updateVoices = () => {
    const temp = synth.getVoices();
    setVoiceList(temp);
    // handleSettingUpdate({ voice: temp[2]}) // You might want to set the default voice based on your requirements
    // };
    // updateVoices();

    // synth.onvoiceschanged = updateVoices;
  }, [open]);

  const handleResetToDefault = () => {
    // Define your default settings or retrieve them from a source
    const defaultSettings = {
      temperature: 0.1,
      selectedModel: 'gemini-pro-vision',
      silenceThresholdSeconds: 2.5,
      rate: 1.0,
      usetextTospeech: true,
      userecurringSession: true,
      imageLimitValue: 5,
      // username: '',
    };

    handleSettingUpdate(defaultSettings);
  };

  const usernameLockHandler = async () => {
    if (username.length < 5) {
      setSnackbarOpen(true);
      setSnackbarSeverity('error');
      setSnackbarMessage('Username must be at least 5 characters long to lock it');
    } else {
      if (!usernameLock) {
        const user_query = await onboarding(username);
        console.log('User', user_query);
        if (user_query.status === 'onboarded') {
          if (username === tempUsername) {
            handleSettingUpdate({ usernameLock: !usernameLock });
            setSnackbarOpen(true);
            setSnackbarSeverity('warning');
            setSnackbarMessage('No Changes made to username');
            return;
          }
          setSnackbarOpen(true);
          setSnackbarSeverity('error');
          setSnackbarMessage(user_query.message);
        } else if (user_query.status === 'pending') {
          handleSettingUpdate({ usernameLock: !usernameLock });
          setSnackbarOpen(true);
          setSnackbarSeverity('info');
          setSnackbarMessage(user_query.message);
        } else {
          setSnackbarOpen(true);
          setSnackbarSeverity('error');
          setSnackbarMessage(user_query.message);
        }
      } else {
        handleSettingUpdate({ usernameLock: !usernameLock });
      }
    }
  };
  const Android12Switch = styled(Switch)(({ theme }) => ({
    padding: 8,
    '& .MuiSwitch-track': {
      borderRadius: 22 / 2,
      '&::before, &::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 16,
        height: 16,
      },
      '&::before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
          theme.palette.getContrastText(theme.palette.primary.main),
        )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
        left: 12,
      },
      '&::after': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
          theme.palette.getContrastText(theme.palette.primary.main),
        )}" d="M19,13H5V11H19V13Z" /></svg>')`,
        right: 12,
      },
    },
    '& .MuiSwitch-thumb': {
      boxShadow: 'none',
      width: 16,
      height: 16,
      margin: 2,
    },
  }));
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSettingPopupClose = () => {
    if (username === '' || usernameLock === false) {
      setSnackbarOpen(true);
      setSnackbarSeverity('error');
      setSnackbarMessage('Please enter a cool username to continue and remember you make it yours by locking it');
      return;
    }
    handleClose();
  };

  useEffect(() => {
    let openSnackbar = false;
    let newSeverity = 'info';
    let newMessage = '';

    if (imageLimitValue > 5) {
      openSnackbar = true;
      newSeverity = 'warning';
      newMessage = 'Choose a lower limit for faster responses';
    } else if (temperature > 0.1) {
      openSnackbar = true;
      newMessage = 'Increasing temperature may result in more creative responses and less coherent responses';
    } else if (silenceThresholdSeconds > 2.5) {
      openSnackbar = true;
      newMessage = 'This is seconds the assistant waits for you before it starts processing your response, Increase this if you have a slow internet connection or when you tend to speak slowly.';

      // } else if (usetextTospeech && !userecurringSession) {
      //   openSnackbar = true;
      //   newMessage = 'The assistant will speak out the response';
      // } else if (userecurringSession) {
      //   openSnackbar = true;
      //   newMessage = 'The Session will restart automatically after each speaking out assistant response';
    } else if (username === '' || usernameLock === false) {
      openSnackbar = true;
      newMessage = 'Please enter a cool username to continue and remember you make it yours by locking it';
      newSeverity = 'error';
    }

    setSnackbarOpen(openSnackbar);
    setSnackbarSeverity(newSeverity);
    setSnackbarMessage(newMessage);
  }, [imageLimitValue, temperature, silenceThresholdSeconds, usetextTospeech, userecurringSession]);

  return (
    <Dialog open={open} onClose={handleClose} className='settingpopup' maxWidth="md">
      <div style={{ backgroundColor: theme.palette.accent.main }}>
        <DialogActions>
          <IconButton onClick={handleSettingPopupClose} color="primary">
            <CloseIcon />
          </IconButton>
          <IconButton onClick={handleResetToDefault} color="primary">
            <SettingsBackupRestoreIcon />
          </IconButton>
        </DialogActions>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <div >
            <Box m={2}>
              <Typography gutterBottom>Camera</Typography>
              <Select value={selectedCamera} onChange={handleCameraChange}>
                {cameraList.map((camera) => (
                  <MenuItem key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${cameraList.indexOf(camera) + 1}`}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Box m={2}>
              <Typography gutterBottom>Username</Typography>
            </Box>
            <Box m={2} display="flex" alignItems="center" justifyContent="space-between">
              <input
                type="text"
                value={username}
                onChange={(e) => handleSettingUpdate({ username: e.target.value })}
                style={{
                  width: '80%',
                  padding: '15px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.primary.main}`,
                  backgroundColor: theme.palette.background.default,
                  outline: theme.palette.primary.main,
                  opacity: usernameLock ? 0.4 : 1,
                  color: theme.palette.primary.main,
                }}
                disabled={usernameLock}
              />
              <IconButton
                size="small"
                style={{ marginLeft: '10px' }}
                onClick={() => usernameLockHandler()}
                aria-label={usernameLock ? 'Unlock username' : 'Lock username'}
              >
                {usernameLock ? (
                  <LockIcon sx={{ color: theme.palette.primary.main }} />
                ) : (
                  <LockOpenIcon sx={{ color: theme.palette.primary.main }} />
                )}
              </IconButton>
            </Box>
            <Box m={2}>
              <Typography gutterBottom>Prompt</Typography>
              <Select value={selectedPrompt} onChange={handlePromptChange} disabled>
                <MenuItem value="default">Default Prompt</MenuItem>
                <MenuItem value="custom">Custom Prompt</MenuItem>
                <MenuItem value="assistant">Assistant</MenuItem>
              </Select>
            </Box>
            <Box m={2}>
              <Typography gutterBottom>Model</Typography>
              <Select value={selectedModel} onChange={(e) => handleSettingUpdate({ selectedModel: e.target.value })}>
                <MenuItem value="gemini-pro-vision">Gemini Vision Pro</MenuItem>
              </Select>
            </Box>
            <Box m={2}>
              <Typography gutterBottom >Model Temperature: {temperature}</Typography>
              <Slider
                value={temperature}
                min={0}
                max={1}
                step={0.01}
                onChange={(e, newValue) => handleSettingUpdate({ temperature: newValue })}
              />
            </Box>
            <Box m={2}>
              <Typography gutterBottom>Image Limit: {imageLimitValue}</Typography>
              <Slider
                value={imageLimitValue}
                min={1}
                max={16}
                step={1}
                disabled={selectedPrompt !== "assistant"}
                onChange={(e, newValue) => handleSettingUpdate({ imageLimitValue: newValue })}
              />
            </Box>
            <Box m={2}>
              <Typography gutterBottom>Silence Threshold (seconds):  {silenceThresholdSeconds}</Typography>
              <Slider
                value={silenceThresholdSeconds}
                min={1}
                max={10}
                step={1}
                disabled={selectedPrompt !== "assistant"}
                onChange={(e, newValue) => handleSettingUpdate({ silenceThresholdSeconds: newValue })}
              />
            </Box>
          </div>
          <div className='speechsettings'>

            <Box m={2}>
              <Typography gutterBottom>Text-to-Speech</Typography>
              <Android12Switch
                checked={usetextTospeech}
                onChange={() => handleSettingUpdate({
                  usetextTospeech: !usetextTospeech,
                  userecurringSession: userecurringSession ? false : userecurringSession
                })}
              // disabled
              />
            </Box>
            <Box m={2}>
              <Typography gutterBottom>Recurring Session</Typography>
              <Android12Switch
                checked={userecurringSession}
                // disabled={selectedPrompt !== "assistant"}
                // disabled
                onChange={() => handleSettingUpdate({ userecurringSession: !userecurringSession, usetextTospeech: usetextTospeech ? usetextTospeech : true })}
              />
            </Box>
            <Box m={2}>
              <Typography gutterBottom>Speech Rate: {rate}</Typography>
              <Slider
                value={rate}
                min={0.5}
                max={2}
                step={0.1}
                disabled={!usetextTospeech}
                onChange={(e, newValue) => handleSettingUpdate({ rate: newValue })}
              />
            </Box>
            <Box m={2}>
              <Typography gutterBottom>Voice</Typography>
              <Select value={voice ? voice.name : ''} onChange={(e) => handleSettingUpdate({ voice: voiceList.find(v => v.name === e.target.value) })}
                style={{
                  width: 250,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
                disabled={!usetextTospeech}
              >
                {voiceList.map((v) => (
                  <MenuItem key={v.name} value={v.name}>
                    {v.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            {snackbarOpen && (
              <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              >
                <MuiAlert
                  elevation={6}
                  variant="filled"
                  severity={snackbarSeverity}
                  onClose={() => setSnackbarOpen(false)}
                >
                  {snackbarMessage}
                </MuiAlert>
              </Snackbar>)}
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default SettingPopup;
