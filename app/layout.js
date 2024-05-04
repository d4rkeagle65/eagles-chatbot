import * as React from "react"
import ThemeRegistry from "@/lib/theme/ThemeRegistry"

export const metadata = {
  title: "Eagles-Chatbot",
  description:
    "Twitch chabot for extending functionality with BeatSaberPlus by d4rkeagle."
}

export const viewport = {
  initialScale: 1,
  width: "device-width"
}

export default function RootLayout(props) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{props.children}</ThemeRegistry>
      </body>
    </html>
  )
}

