"use client"
import * as React from "react"
import Image from "next/image"

import Accordion from "@mui/joy/Accordion"
import AccordionGroup from "@mui/joy/AccordionGroup"
import AccordionDetails from "@mui/joy/AccordionDetails"
import AccordionSummary from "@mui/joy/AccordionSummary"
import LinearProgress from "@mui/joy/LinearProgress"
import Table from "@mui/joy/Table"
import Chip from "@mui/joy/Chip"
import Box from "@mui/joy/Box"
import Tooltip from "@mui/joy/Tooltip"
import Typography from "@mui/joy/Typography"

const UserLurk = ({ user_lurk }) => {
  if (user_lurk) {
    return (
      <Tooltip
        title="User is !lurking"
        size="sm"
        variant="solid"
        arrow
        placement="bottom-end"
      >
        <Chip size="sm" variant="soft">
          L
        </Chip>
      </Tooltip>
    )
  } else {
    return
  }
}

const UserLastActivity = ({ user_lastactivets }) => {
  if (user_lastactivets) {
    let tStamp = new Date(user_lastactivets).toLocaleTimeString("en-US", {
      timeZone: "UTC"
    })
    return <>{tStamp}</>
  } else {
    return
  }
}

const UserType = props => {
  if (props.badge.badge_url === "none") {
    return
  } else {
    return (
      <Image
        src={props.badge.badge_url}
        alt={props.badge.badge_id}
        width={18}
        height={18}
      />
    )
  }
}

const UserRow = props => {
  let sBadge = props.badges
    .map(badge => {
      if (badge.badge_id === props.user.user_type) {
        return badge
      }
    })
    .filter(Boolean)

  let nBadge = {
    badge_url: "none",
    badge_id: "none"
  }

  if (sBadge && sBadge[0]) {
    nBadge = {
      badge_url: sBadge[0].badge_url,
      badge_id: sBadge[0].badge_id
    }
  }

  return (
    <React.Fragment>
      <tr key={props.user.user_username}>
        <td>
          <UserType badge={nBadge} />
        </td>
        <td>{props.user.user_username}</td>
        <td>
          <UserLurk user_lurk={props.user.user_lurk} />
        </td>
        <td>
          <UserLastActivity user_lastactivets={props.user.user_lastactivets} />
        </td>
      </tr>
    </React.Fragment>
  )
}

const UserTable = props => {
  return (
    <React.Fragment>
      <Table
        hoverRow
        noWrap
        size="sm"
        borderAxis="xBetween"
        variant="plain"
        sx={{
          m: 0,
          p: 0,
          "--TableCell-height": "23px",
          "--TableCell-paddingX": "0px",
          "--TableCell-paddingY": "0px",
          "& tbody td:nth-child(1)": {
            width: "10%",
            pt: "3px"
          },
          "& tbody td:nth-child(2)": {
            width: "55%"
          },
          "& tbody td:nth=child(3)": {
            textAligh: "right"
          },
          "& tbody td:nth-child(4)": {
            width: "25%"
          }
        }}
      >
        <tbody>
          {props.users.map(user => (
            <UserRow user={user} badges={props.badges} />
          ))}
        </tbody>
      </Table>
    </React.Fragment>
  )
}

const UserAccordion = props => {
  let userCount = Object.keys(props.users).length
  return (
    <Accordion expanded={props.summary.value === "Active"}>
      <AccordionSummary>
        <Typography>
          {props.summary.value} Users ({userCount})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <UserTable users={props.users} badges={props.badges} />
      </AccordionDetails>
    </Accordion>
  )
}

export default function TableUsers() {
  const [uAloading, setUALoading] = React.useState(true)
  const [uIloading, setUILoading] = React.useState(true)
  const [bloading, setBLoading] = React.useState(true)
  const [activeUsers, setAUsers] = React.useState(null)
  const [inactiveUsers, setIUsers] = React.useState(null)
  const [badges, setBadges] = React.useState(null)

  React.useEffect(() => {
    async function getAUsers() {
      const userList = await fetch(
        process.env.NEXT_PUBLIC_BASE_URL + "/api/db/getusers/active",
        { next: { revalidate: 60 } }
      )
      const uData = await userList.json()
      setAUsers(uData)
      setUALoading(false)
    }
    async function getIUsers() {
      const userList = await fetch(
        process.env.NEXT_PUBLIC_BASE_URL + "/api/db/getusers/inactive",
        { next: { revalidate: 60 } }
      )
      const uData = await userList.json()
      setIUsers(uData)
      setUILoading(false)
    }
    async function getBadges() {
      fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/twitch/getbadges", {
        next: { revalidate: 86400 }
      })
        .then(readableStreamData => readableStreamData.json())
        .then(json => {
          const tBadges = ["moderator", "vip", "broadcaster"]
          let sBadge = Object.values(json)
            .map(badge => {
              const bMatch = tBadges.filter(str => badge.set_id.includes(str))
              if (bMatch.length > 0) {
                let nBadge = {
                  badge_id: badge.set_id,
                  badge_url: badge.versions[0].image_url_1x
                }
                return nBadge
              }
            })
            .filter(Boolean)

          setBadges(sBadge)
          setBLoading(false)
        })
    }

    getBadges()
    getAUsers()
    getIUsers()
  }, [])

  if (uAloading || bloading || uIloading) {
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
      <AccordionGroup>
        <UserAccordion summary="Active" users={activeUsers} badges={badges} />
        <UserAccordion
          summary="Inactive"
          users={inactiveUsers}
          badges={badges}
        />
      </AccordionGroup>
    </>
  )
}

