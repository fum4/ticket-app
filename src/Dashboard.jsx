import {useEffect, useState} from "react";
import {
  Stack,
  Button,
  Box,
  TextField,
  outlinedInputClasses,
  textFieldClasses,
  formControlClasses, Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { supabase } from './supabase.js';
import ReportDialog from './ReportDialog.jsx';
import TicketDialog from './TicketDialog.jsx';
import TicketCard from "./TicketCard.jsx";

const utcOffset = 10800000;

export default function Dashboard() {
  const [ isAddDialogOpen, setAddDialogOpen ] = useState(false);
  const [ isReportDialogOpen, setReportDialogOpen ] = useState(false);
  const [ tickets, setTickets ] = useState([]);
  const [ searchKeyword, setSearchKeyword ] = useState('');
  const [ filteredActiveTickets, setFilteredActiveTickets ] = useState(tickets);
  const [ showReports, setShowReports ] = useState(false);

  useEffect(() => {
    (async() => {
      if (!showReports) {
        const { data } = await supabase
          .from('tickets')
          .select('*')
          .is('leave_at', null)

        if (data) {
          setTickets(data);
        }
      }
    })();
  }, [ showReports ]);

  useEffect(() => {
    setFilteredActiveTickets(() => (
      tickets.filter(({ license_no }) => (
        license_no.toLowerCase().includes(searchKeyword.toLowerCase())
      ))
    ));
  }, [ tickets, searchKeyword ]);

  const handleTicketAdd = (data) => {
    setTickets((activeTickets) => ([ data, ...activeTickets ]));
  };

  const handleTicketUpdate = (data) => {
    setTickets((activeTickets) => ([ data, ...activeTickets.filter(({ id }) => id !== data.id) ]));
  }

  const handleReports = async(startDate, endDate) => {
    setShowReports(true);

    const { data } = await supabase
      .from('tickets')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    console.log(data);

    setTickets(data);
  };

  const handleSessionEnd = async(ticketId) => {
    const { data } = await supabase
      .from('tickets')
      .update({ leave_at: new Date(Date.now() + utcOffset).toISOString() })
      .eq('id', ticketId)
      .select('*')

    if (data) {
      setTickets((activeTickets) => activeTickets.filter(({ id }) => id !== ticketId));
    }
  }

  return (
    <div className='flex h-screen bg-slate-100 flex flex-col items-center'>
      <Box
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        width={1}
        gap={2}
        px={10}
        py={2}
        className='bg-black'
      >
        {showReports? (
          <Button
            onClick={() => setShowReports(false)}
            variant='contained'
            sx={{ pl: 1 }}
          >
            <ChevronLeftIcon />
            Înapoi
          </Button>
        ) : (
          <>
            <TextField
              value={searchKeyword}
              label='Filtrează'
              size='small'
              onChange={(ev) => setSearchKeyword(ev.target.value)}
              sx={{
                [`&.${formControlClasses.root}.${textFieldClasses.root}`]: {
                  mb: 0,
                },
                [`& .${outlinedInputClasses.root}`]: {
                  width: 272,
                  background: 'white'
                },
                mb: 1.5
              }}
            />
            <Box display='flex' gap={2}>
              <Button
                onClick={() => setReportDialogOpen(true)}
                variant='outlined'
              >
                Extrage raport
              </Button>
              <Button
                onClick={() => setAddDialogOpen(true)}
                variant='contained'
                sx={{ width: 'fit-content' }}
              >
                Adaugă
              </Button>
            </Box>
          </>
        )}
        {isReportDialogOpen && (
          <ReportDialog
            onClose={() => setReportDialogOpen(false)}
            onSubmit={handleReports}
          />
        )}
      </Box>
      <Box
        display='flex'
        alignItems='center'
        flexDirection='column'
        sx={{ overflow: 'hidden' }}
      >
        <Box
          py={3}
          width={1}
          display='flex'
          justifyContent='center'
          sx={{ color: 'black' }}
          className='bg-slate-200'
        >
          {showReports ? (
            <Typography variant='h4'>
              Raport
            </Typography>
          ) : (
            <Typography variant='h4'>
              Tichete curente
            </Typography>
          )}
        </Box>
        <Stack
          spacing={5}
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            overflow: 'scroll',
            whiteSpace: 'nowrap',
            py: 10,
            width: '100vw'
          }}
        >
          {filteredActiveTickets.map((ticket) => (
            <TicketCard
              ticket={ticket}
              onUpdate={handleTicketUpdate}
              onSessionEnd={handleSessionEnd}
            />
          ))}
        </Stack>
      </Box>
      {isAddDialogOpen && (
        // @ts-ignore
        <TicketDialog
          onClose={() => setAddDialogOpen(false)}
          onSuccess={handleTicketAdd}
          type='add'
        />
      )}
    </div>
  )
}
