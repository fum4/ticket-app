import {useRef, useEffect, useState} from "react";
import {
  Stack,
  Button,
  Box,
  TextField,
  outlinedInputClasses,
  textFieldClasses,
  formControlClasses,
  Typography, IconButton,
} from '@mui/material';
import PrintIcon from "@mui/icons-material/Print";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { supabase } from './supabase.js';
import ReportDialog from './ReportDialog.jsx';
import TicketDialog from './TicketDialog.jsx';
import TicketCard from "./TicketCard.jsx";
import dayjs from "./dayjs";
import {useReactToPrint} from "react-to-print";

const utcOffset = 10800000;

const intervals = [
  {
    name: '1 oră / 3 lei',
    value: 3600000,
    cost: '3,00 lei',
  },
  {
    name: '2 ore / 6 lei',
    value: 7200000,
    cost: '6,00 lei',
  },
  {
    name: '3 ore / 9 lei',
    value: 10800000,
    cost: '9,00 lei',
  },
  {
    name: '4 ore / 12 lei',
    value: 14400000,
    cost: '12,00 lei',
  },
  {
    name: '5 ore / 15 lei',
    value: 18000000,
    cost: '15,00 lei',
  },
  {
    name: '8 ore / 20 lei',
    value: 28800000,
    cost: '20,00 lei',
  },
  {
    name: '12 ore / 30 lei',
    value: 43200000,
    cost: '30,00 lei',
  },
  {
    name: '24 ore / 40 lei',
    value: 86400000,
    cost: '40,00 lei',
  },
  {
    name: '4 zile / 100 lei',
    value: 345600000,
    cost: '100,00 lei',
  },
  {
    name: '7 zile / 150 lei',
    value: 604800000,
    cost: '150,00 lei',
  },
  {
    name: '1 lună / 350 lei',
    value: 2419200000,
    cost: '350,00 lei',
  },
];

const dateFormat = 'DD.MM.YYYY - HH:mm';

export default function Dashboard() {
  const reportsRef = useRef();
  const [ isAddDialogOpen, setAddDialogOpen ] = useState(false);
  const [ isReportDialogOpen, setReportDialogOpen ] = useState(false);
  const [ tickets, setTickets ] = useState([]);
  const [ reports, setReports ] = useState([]);
  const [ reportsInterval, setReportsInterval ] = useState({});
  const [ searchKeyword, setSearchKeyword ] = useState('');
  const [ filteredActiveTickets, setFilteredActiveTickets ] = useState(tickets);
  const [ showReports, setShowReports ] = useState(false);

  const handlePrintReport = useReactToPrint({
    content: () => reportsRef?.current
  });

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

    setReports(data);
    setReportsInterval({ startDate, endDate });
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
        height='72px'
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
                Raport
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
        width={1}
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
              Tichete active
            </Typography>
          )}
        </Box>
        {showReports ? (
          <>
            <Box
              display='flex'
              alignItems='center'
              pt={3.5}
              pb={3.5}
              sx={{ color: 'black' }}
              gap={8}
            >
              <Box
                display='flex'
                gap={1}
              >
                <Typography>
                  Interval:
                </Typography>
                <Typography>
                  <b>{dayjs(reportsInterval.startDate).format('DD.MM.YYYY')}</b>
                  <span> - </span>
                  <b>{dayjs(reportsInterval.endDate).format('DD.MM.YYYY')}</b>
                </Typography>
              </Box>
              <Box
                display='flex'
                gap={1}
              >
                <Typography>
                  Total încasări:
                </Typography>
                <Typography>
                  <b>
                    {reports.reduce((acc, { interval }) => {
                      const { cost } = intervals.find(({value }) => value === +interval);

                      return acc + (+cost.slice(0, cost.indexOf(',')));
                    }, 0)} lei
                  </b>
                </Typography>
              </Box>
              <IconButton
                color='primary'
                onClick={handlePrintReport}
                sx={{ height: 48, width: 48 }}
              >
                <PrintIcon />
              </IconButton>
            </Box>
            <Box
              width={900}
              pb={10}
              sx={{ overflow: 'scroll' }}
            >
              <TableContainer ref={reportsRef} component={Paper}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left"><b>Nr.</b></TableCell>
                      <TableCell align="left"><b>Nr. înmatriculare</b></TableCell>
                      <TableCell align="left"><b>Data și ora intrării</b></TableCell>
                      <TableCell align="left"><b>Data și ora ieșirii</b></TableCell>
                      <TableCell align="right"><b>Tarif</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow
                        key={report.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row" align="left" sx={{ width: 70 }}>{report.id}</TableCell>
                        <TableCell align="left">{report.license_no}</TableCell>
                        <TableCell align="left">{dayjs(new Date(report.created_at)).format(dateFormat)}</TableCell>
                        <TableCell align="left">{dayjs(new Date(new Date(report.created_at).valueOf() + report.interval)).format(dateFormat)}</TableCell>
                        <TableCell align="right" sx={{ width: 105 }}>{intervals.find(({ value }) => value === report.interval)?.cost}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </>
        ) : (
          <Stack
            spacing={5}
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              overflow: 'scroll',
              whiteSpace: 'nowrap',
              pt: showReports ? 0 : 10,
              pb: 10,
              width: '100vw'
            }}
          >
            {filteredActiveTickets.map((ticket) => (
              <TicketCard
                intervals={intervals}
                key={ticket.id}
                ticket={ticket}
                onUpdate={handleTicketUpdate}
                onSessionEnd={handleSessionEnd}
              />
            ))}
          </Stack>
        )}
      </Box>
      {isAddDialogOpen && (
        <TicketDialog
          onClose={() => setAddDialogOpen(false)}
          onSuccess={handleTicketAdd}
          intervals={intervals}
          type='add'
        />
      )}
    </div>
  )
}
