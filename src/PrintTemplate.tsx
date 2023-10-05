import {Box, Typography} from "@mui/material";

const series = 'DZ13ASD23335';

const PrintTemplate = ({ ticket }) => {
  return (
    <Box color='black' p={5}>
      <Typography>
        Date firma etc etc
      </Typography>
      <Box display='flex' gap={2}>
        <Typography>Serie / număr:</Typography>
        <Typography>{`${series} / ${ticket.id}`}</Typography>
      </Box>
      <Box
        display='flex'
        gap={2}
        mt={2}
      >
        <Typography>Număr înmatriculare:</Typography>
        <Typography>
          <b>{ticket.license_no.toUpperCase()}</b>
        </Typography>
      </Box>
      <Box display='flex' gap={2}>
        <Typography>Timp alocat (ore):</Typography>
        <Typography><b>{+ticket.interval / (1000 * 60 * 60)}</b></Typography>
      </Box>
    </Box>
  );
};

export default PrintTemplate;
