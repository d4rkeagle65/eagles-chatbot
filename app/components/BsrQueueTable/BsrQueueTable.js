"use client"
import { useState, useEffect } from "react"

import QueueStatus from '@/components/QueueStatus/QueueStatus';
import QueueSyncState from '@/components/QueueSyncState/QueueSyncState';

import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import Table from "@mui/joy/Table";
import Divider from '@mui/joy/Divider';
import Typography from "@mui/joy/Typography"
import { CalcLength, MapName, MapCode, MapRequester } from "./QueueUtils"

export const dynamic = 'force-dynamic'

const LargeQueueRow = ({ aQueueRow, index }) => {
  const qIndex = Number(index) + 1
  return (
    <tr key={aQueueRow.bsr_code}>
      <th scope="row" style={{ textAlign: "right" }}>
        <Typography level="body-xs">{qIndex}</Typography>
      </th>
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
    </tr>
  )
}

const LargeQueueTable = ({ queue }) => {
  return (
    <Table
      size="sm"
      stripe="odd"
      hoverRow
      noWrap
      sx={{
        captionSide: "top",
        '& tbody': { bgcolor: 'background.surface' },
      }}
    >
      <caption>
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            px: 2,
          }}
        >
          <Box>
            <Typography level="title-md">
              {process.env.NEXT_PUBLIC_TWITCH_CHANNEL}'s BS+ Queue
            </Typography>
          </Box>
          <Box>
            <QueueStatus />
            <QueueSyncState />
          </Box>
        </Box>
      </caption>
      <thead>
        <tr>
          <th style={{ width: '2em' }}></th>
          <th style={{ width: "100%" }}><Typography level="title-xs">Map Name</Typography></th>
          <th style={{ width: "7em" }}><Typography level="title-xs">Code</Typography></th>
          <th style={{ width: "30%" }}><Typography level="title-xs">Requester</Typography></th>
          <th style={{ width: "6em" }}><Typography level="title-xs">Length</Typography></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {Object.values(queue).map((row, index) => (
          <LargeQueueRow aQueueRow={row} index={index} />
        ))}
      </tbody>
    </Table>
  );
}

const SmallQueueRow = ({ aQueueRow, index }) => {
  const qIndex = Number(index) + 1
  return (
    <>
      <tr key={(aQueueRow.bsr_code + "_1")} className="mapRow">
        <th scope="row" rowSpan={2}>
          <Typography level="body-sm">{qIndex}</Typography>
        </th>
        <td colSpan={5}>
          <MapName 
            bsr_name={aQueueRow.bsr_name} 
            bsr_note={aQueueRow.bsr_note} 
          />
        </td>
      </tr>
      <tr key={(aQueueRow.bsr_code + "_2")} className="detailRow">
        <td colSpan={3}>
          <MapRequester
            bsr_req={aQueueRow.bsr_req}
            bsr_req_here={aQueueRow.bsr_req_here}
          />
        </td>
        <td>
          <MapCode
            bsr_code={aQueueRow.bsr_code}
            sus_remap={aQueueRow.sus_remap}
            mobile={true}
          />
        </td>
        <td>
          <CalcLength bsr_length={aQueueRow.bsr_length} />
        </td>
      </tr>
    </>
  );
}

const SmallQueueTable = ({ queue }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Table
        size="sm"
        stripe="odd"
        noWrap
        borderAxis="none"
        sx={{
          captionSide: "top",
          '& tbody': { bgcolor: 'background.surface' },
          '& td': { px: 1 },
          '& tr.mapRow th': { width: '2.5em', textAlign: 'right', pr: '0.5em' },
          '& tr.detailRow > td:nth-child(2)': { width: '10em', textAlign: 'right' },
          '& tr.detailRow > td:nth-child(3)': { textAlign: 'right' },
        }}
      >
        <caption>
          <Typography level="title-md">{process.env.NEXT_PUBLIC_TWITCH_CHANNEL}'s BS+ Queue</Typography>
        </caption>
        <thead style={{ display: 'none' }}></thead>
        <tbody>
          {Object.values(queue).map((row, index) => (
            <SmallQueueRow aQueueRow={row} index={index} />
          ))}
        </tbody>
      </Table>
      <Box sx={{ display: 'flex', justifyContent: 'right', p: 0.5 }}>
        <QueueStatus />
        <QueueSyncState />
      </Box>
    </Box>
  )
}

export default function BsrQueueTable() {
  const [activeQueue, setAQueue] = useState(true)

  useEffect(() => {
    async function getQueue() {
      const queueData = await fetch(
        process.env.NEXT_PUBLIC_BASE_URL + "/api/db/getqueue",
        { next: { cache: 'no-store' } }
      )
      const qData = await queueData.json()
      setAQueue(qData)
    }

    getQueue()
  }, [])

  return (
    <>
      <Sheet
        variant='soft'
        sx={{ 
          pt: 1, 
          borderRadius: "sm" ,
          display: { xs: 'none', md: 'flex' },
        }}
      >
        <LargeQueueTable queue={activeQueue} />
      </Sheet>
      <Sheet
        variant='soft'
        sx={{ 
          pt: 1, 
          borderRadius: "sm" ,
          display: { xs: 'flex', md: 'none' },
        }}
      >
        <SmallQueueTable queue={activeQueue} />
      </Sheet>
    </>
  )
}

