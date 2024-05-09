"use client"
import { useState, useEffect } from "react"

import Chip from "@mui/joy/Chip"
import Tooltip from "@mui/joy/Tooltip"

export const dynamic = 'force-dynamic'

export default function QueueStatus() {
  const [sLoading, setStatusLoading] = useState(true)
  const [queueStatus, setQueueStatus] = useState({ value: "" })

  useEffect(() => {
    async function getQueueStatus() {
      const statusData = await fetch(
        process.env.NEXT_PUBLIC_BASE_URL + "/api/db/getqueuestatus",
        { next: { revalidate: 60 } }
      )
      const sData = await statusData.json()
      setQueueStatus({ value: sData[0].setting_value })
      setStatusLoading(false)
    }

    getQueueStatus()
  }, [])

  if (sLoading) {
    return
  }

  let qStatus =
    queueStatus.value.charAt(0).toUpperCase() + queueStatus.value.substring(1)
  let cColor = "danger"
  if (qStatus === "open") {
    cColor = "neutral"
  }
  let ttTitle = "The Queue is " + qStatus + "!"

  return (
    <Tooltip
      title={ttTitle}
      size="sm"
      variant="solid"
      arrow
      placement="bottom-end"
    >
      <Chip
        size="md"
        variant="outlined"
        color={
          {
            Closed: "danger",
            Open: "neutral"
          }[qStatus]
        }
      >
        {qStatus}
      </Chip>
    </Tooltip>
  )
}

