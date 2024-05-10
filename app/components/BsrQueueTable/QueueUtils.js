import Chip from "@mui/joy/Chip"
import Box from "@mui/joy/Box"
import Link from "@mui/joy/Link"
import Tooltip from "@mui/joy/Tooltip"
import Typography from "@mui/joy/Typography"

export const CalcLength = ({ bsr_length }) => {
    if (!bsr_length) {
      bsr_length = 0
    }
    let date = new Date(0)
    date.setSeconds(bsr_length)
    let timeString = date.toISOString().substring(11, 19)
    return <Typography level="body-xs">{timeString}</Typography>
}
  
export const MapName = ({ bsr_note, bsr_name }) => {
    let bsrNote
    if (bsr_note) {
      bsrNote = (
        <Tooltip
          title={bsr_note}
          size="sm"
          variant="solid"
          arrow
          placement="bottom-start"
        >
          <Chip size="sm" variant="solid">
            Note
          </Chip>
        </Tooltip>
      )
    }
    return (
      <Box sx={{ display: "flex", flexBasis: "100%" }}>
        <Typography level="body-xs" noWrap sx={{ flexGrow: 2 }}>
          {bsr_name}
        </Typography>
        <Box sx={{ flexShrink: 0, pl: 1 }}>{bsrNote}</Box>
      </Box>
    )
}
  
export const MapCode = ({ bsr_code, sus_remap, mobile }) => {
    let remapChip
    let qHref = "https://beatsaver.com/maps/" + bsr_code
    if (sus_remap) {
      if (! mobile) {
        remapChip = (
          <Tooltip
            title="Remapped"
            size="sm"
            variant="solid"
            arrow
            placement="bottom-start"
          >
            <Chip size="sm" variant="solid">R</Chip>
          </Tooltip>
        )
      }
    }
    return (
      <Typography level="body-xs" endDecorator={remapChip}>
        <Link underline="always" href={qHref} target="_blank">
          {bsr_code}
        </Link>
      </Typography>
    )
}
  
export const MapRequester = ({ bsr_req_here, bsr_req }) => {
    let hereChip
    if (bsr_req_here === false) {
      hereChip = (
        <Tooltip
          title="Missing From Twitch Chat"
          size="sm"
          variant="solid"
          arrow
          placement="bottom-end"
        >
          <Chip size="sm" variant="solid">M</Chip>
        </Tooltip>
      );
    }
    return (
      <Typography level="body-xs" endDecorator={hereChip}>
        {bsr_req}
      </Typography>
    )
}