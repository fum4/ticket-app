import {
  Box,
  Button,
  Dialog,
  dialogClasses,
  FormControl,
  InputLabel,
  MenuItem,
  outlinedInputClasses,
  Select,
  TextField,
  Typography
} from "@mui/material";
import {useEffect, useRef, useState} from "react";
import {supabase} from "./supabase.js";

const intervals = [
  {
    name: '5 ore',
    value: 18000000,
  },
  {
    name: '8 ore',
    value: 28800000,
  },
  {
    name: '12 ore',
    value: 43200000,
  },
  {
    name: '24 ore',
    value: 86400000,
  },
  {
    name: '4 zile',
    value: 345600000,
  },
  {
    name: '7 zile',
    value: 604800000,
  },
  {
    name: '1 lună',
    value: 2419200000,
  },
];

const defaultTimeInterval = 7200000;

const TicketDialog = ({ onClose, onSuccess, ticket, type }) => {
  const licenseNoRef = useRef(null);
  const [ timeInterval, setTimeInterval ] = useState(ticket?.interval || defaultTimeInterval);
  const [ licenseNo, setLicenseNo ] = useState(ticket?.license_no || '');

  const handleSubmit = async() => {
    if (timeInterval && licenseNo) {
      const payload = { interval: timeInterval, license_no: licenseNo };

      let data;

      if (type === 'add') {
        data = (
          await supabase
            .from('tickets')
            .insert(payload)
            .select()
        ).data;
      } else {
        data = (
          await supabase
            .from('tickets')
            .update(payload)
            .eq('id', ticket.id)
            .select()
        ).data;
      }

      if (data) {
        const [ ticket ] = data;

        if (ticket) {
          onSuccess(ticket);
        }
      }

      setLicenseNo('');
      setTimeInterval(defaultTimeInterval);
      onClose();
    }
  };

  useEffect(() => {
    setTimeout(() => {
      licenseNoRef.current?.focus();
    });
  }, [])

  return (
    <Dialog
      open
      onClose={onClose}
      sx={{
        [`& .${dialogClasses.paper}`]: {
          width: 350,
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        },
      }}
    >
      <Box width={250} display='flex' flexDirection='column' justifyContent='center'>
        <Typography variant='h5' sx={{ mb: 4 }}>
          {type === 'add' ? 'Adaugă tichet' : 'Modifică tichet'}
        </Typography>
        <FormControl className='flex gap-5'>
          <InputLabel id='select'>
            Interval
          </InputLabel>
          <Select
            value={timeInterval}
            onChange={(ev) => setTimeInterval(+ev.target.value)}
            label='Interval'
            labelId='select'
            variant='outlined'
            sx={{ width: '100%' }}
          >
            {intervals.map(({ name, value }) => (
              <MenuItem
                key={value}
                value={value}
              >
                {name}
              </MenuItem>
            ))}
          </Select>
          <TextField
            inputRef={licenseNoRef}
            value={licenseNo}
            onChange={(ev) => setLicenseNo(ev.target.value)}
            variant='outlined'
            label='Nr. înmatriculare'
            sx={{ [`& .${outlinedInputClasses.root}`]: { background: 'white' } }}
          />
          <Button
            onClick={handleSubmit}
            variant='contained'
            sx={{ mt: 2 }}
          >
            Confirmă
          </Button>
          <Button
            onClick={onClose}
            variant='text'
            color='error'
          >
            Anulează
          </Button>
        </FormControl>
      </Box>
    </Dialog>
  );
}

export default TicketDialog;
