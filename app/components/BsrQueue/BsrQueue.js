"use client"
import * as React from "react"

import LinearProgress from "@mui/joy/LinearProgress"
import Table from "@mui/joy/Table"
import Chip from "@mui/joy/Chip"
import Box from "@mui/joy/Box"
import Link from "@mui/joy/Link"
import Typography from "@mui/joy/Typography"
import Tooltip from "@mui/joy/Tooltip"

const CalcLength = ({ bsr_length }) => {
  if (!bsr_length) {
    bsr_length = 0
  }
  let date = new Date(0)
  date.setSeconds(bsr_length)
  let timeString = date.toISOString().substring(11, 19)
  return <Typography level="body-xs">{timeString}</Typography>
}

const MapName = ({ bsr_note, bsr_name }) => {
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
      <Typography level="body-xs" sx={{ flexGrow: 2 }}>
        {bsr_name}
      </Typography>
      <Box sx={{ flexShrink: 0 }}>{bsrNote}</Box>
    </Box>
  )
}

const MapCode = ({ bsr_code, sus_remap }) => {
  let remapChip
  let qHref = "https://beatsaver.com/maps/" + bsr_code
  if (sus_remap) {
    remapChip = (
      <Tooltip
        title="Remapped"
        size="sm"
        variant="solid"
        arrow
        placement="bottom-start"
      >
        <Chip size="sm" variant="soft">
          R
        </Chip>
      </Tooltip>
    )
  }
  return (
    <Typography level="body-xs" endDecorator={remapChip}>
      <Link underline="always" variant="plain" href={qHref} target="_blank">
        {bsr_code}
      </Link>
    </Typography>
  )
}

const MapRequesterPresence = ({ bsr_req_here }) => {
  if (bsr_req_here === false) {
    return (
      <Tooltip
        title="User missing from Twitch chat."
        size="sm"
        variant="solid"
        arrow
        placement="bottom-end"
      >
        <Chip size="sm" variant="soft" color="danger">
          M
        </Chip>
      </Tooltip>
    )
  } else {
    return
  }
}

const MapRequester = ({ bsr_req_here, bsr_req }) => {
  let hereChip
  if (bsr_req_here === false) {
    hereChip = <Chip size="sm">M</Chip>
  }
  return (
    <Typography level="body-xs" endDecorator={hereChip}>
      {" "}
      {bsr_req}{" "}
    </Typography>
  )
}

const QueueRow = ({ aQueueRow, index }) => {
  const qIndex = Number(index) + 1
  return (
    <tr key={aQueueRow.bsr_code}>
      <td style={{ textAlign: "right" }}>
        <Typography level="body-xs">{qIndex}</Typography>
      </td>
      <td>
        <MapName bsr_name={aQueueRow.bsr_name} bsr_note={aQueueRow.bsr_note} />
      </td>
      <td>
        <MapCode
          bsr_code={aQueueRow.bsr_code}
          sus_remap={aQueueRow.sus_remap}
        />
      </td>
      <td>
        <MapRequester
          bsr_req={aQueueRow.bsr_req}
          bsr_req_here={aQueueRow.bsr_req_here}
        />
      </td>
      <td>
        <CalcLength bsr_length={aQueueRow.bsr_length} />
      </td>
      <td></td>
    </tr>
  )
}

export default function BsrQueueTable() {
  const [qLoading, setQLoading] = React.useState(true)
  const [activeQueue, setAQueue] = React.useState(true)

  React.useEffect(() => {
    async function getQueue() {
      const queueData = await fetch(
        process.env.NEXT_PUBLIC_BASE_URL + "/api/db/getqueue",
        { next: { revalidate: 60 } }
      )
      const qData = await queueData.json()
      setAQueue(qData)
      setQLoading(false)
    }

    getQueue()
  }, [])

  if (qLoading) {
    return (
      <Box
        alignItems="center"
        justifyContent="center"
        display="flex"
        sx={{
          width: "100%",
          mx: "auto",
          px: "auto",
          align: "center"
        }}
      >
        <LinearProgress thickness={1} />
      </Box>
    )
  }

  return (
    <>
      <Table
        size="sm"
        stripe="odd"
        hoverRow
        sx={{
          captionSide: "top",
          "& tbody": { bgcolor: "background.surface" }
        }}
      >
        <thead>
          <tr>
            <th style={{ width: "3em" }}></th>
            <th style={{ width: "100%" }}>Map Name</th>
            <th style={{ width: "7em" }}>Code</th>
            <th style={{ width: "25%" }}>Requester</th>
            <th style={{ width: "6em" }}>Length</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {Object.values(activeQueue).map((row, index) => (
            <QueueRow aQueueRow={row} index={index} />
          ))}
        </tbody>
      </Table>
    </>
  )
}

