# eagles-chatbot

This is a chatbot built for Twitch to be used by streamers utilizing the mod BeatSaber+. It's purpose is to extend visibility and some functionality of the chat request queue functions of BS+. 

Frontend utilizing ReactJS w/ NextJS, Material-UI and Joy-UI from MUI and Prisma to connect to PostgreSQL.
Backend utilizing NodeJS, PostgreSQL, BullMQ and Redis.

The backend watches the streamers Twitch chat for specific commands used by users and moderators for BS+ actions. It also monitors for response messages by the user account utilized by the BS+ Twitch plugin. Based on these chats it develops a database of what the map request queue is built up to in its entirety. When each map is added to the active queue, it reaches out to BeatSaver's API to aquire map info to augment data in the database and provide additional functionality.

Initially developed by d4rkeagle6591 for Twitch streamer XORoseGold.

## Main Features
- **Frontend**
    - Web Frontend Allowing Users to View Full Queue In Order with ReactJS
    - Responsive interface allowing for desktop, tablet and mobile access.
- **Backend**
    - **Monitor Map Request Queue**
        - When Maps Are Added/Removed
        - When the Streamer Selects a Song to Play
        - When Maps Are Added/Moved to the Top of the Queue
        - When the Queue is Opened/Closed
        - Self-Repairs Inconsistances when !queue Command is Ran (Top 10 Songs Only)
        - Added capability to !queue command for removing songs that have been at the top for a while and not played.
        - Flags Maps For Users that Left Chat
    - **Twitch User Tracking**
        - Last Active Timestamps
        - Lurk Status if !lurk Command is Utilized
        - When User Joined the Streamers Chat
        - What Role the User Has in Twitch (Viewer,Subscriber,VIP,Moderator,Broadcaster)

## Planned Features
- Extension of Web Frontend for Twitch Moderators to Preform Some Actions
- Queue Auto-Close if Queue Length Reaches Set Time
- Map Auto-Removal on User Inactivity for Set Amount of Time (With Tracking for Quick Re-Add If Nessesary)
- Map Auto-Removal on User Inactivity When Requested Map Gets to Set Spot in Queue
- Command for Users to See How Long Until Their Map Is Played
- Command For Users to See Which Maps They Added to the Queue
- Automatic !mtt When User Directly Subscribes or Gifts Another User a Twitch Subscription
- !cbmu Command for Displaying Missing Users with Songs in Queue
- Historical database for viewing with option to add a song back to the queue
- !songmsg Parse and note update
