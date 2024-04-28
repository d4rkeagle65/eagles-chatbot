These are just some of the Beat Saber + messages from that repo for refrence:

## Error Messages
```
SendChatMessage("@$UserName You have no power here!", p_Service, p_Message);
SendChatMessage("@$UserName Search is disabled", p_Service, p_Message);
SendChatMessage("@$UserName command failed!", p_Service, p_Message);
SendChatMessage("@$UserName invalid command, syntax is !songmsg #BSRKEY|#REQUESTERNAME #MESSAGE", p_Service, p_Message);
SendChatMessage($"@$UserName No song in queue found with the key or username \"{l_Key}\"!", p_Service, p_Message);
SendChatMessage("@$UserName Invalid key!", p_Service, p_Message);
p_Reply = $"@{p_SenderName} BeatSage maps are not allowed!";
p_Reply = $"@{p_SenderName} Ranked maps are not allowed!";
p_Reply = $"@{p_SenderName} this song has no difficulty with a NPS of {l_NPSMin} minimum!";
p_Reply = $"@{p_SenderName} this song has no difficulty with a NPS of {l_NPSMax} maximum!";
p_Reply = $"@{p_SenderName} this song has no difficulty with a NPS between {l_NPSMin} and {l_NPSMax}!";
p_Reply = $"@{p_SenderName} this song has no difficulty with a NJS of {l_NJSMin} minimum!";
p_Reply = $"@{p_SenderName} this song has no difficulty with a NJS of {l_NJSMax} maximum!";
p_Reply = $"@{p_SenderName} this song has no difficulty with a NJS between {l_NJSMin} and {l_NJSMax}!";
p_Reply = $"@{p_SenderName} this song is too short ({CRConfig.Instance.Filters.DurationMaxV} minute(s) minimum)!";
p_Reply = $"@{p_SenderName} this song is too long ({CRConfig.Instance.Filters.DurationMaxV} minute(s) maximum)!";
p_Reply = $"@{p_SenderName} this song rating is too low ({(float)Math.Round((double)CRConfig.Instance.Filters.VoteMinV * 100f, 0)}% minimum)!";
p_Reply = $"@{p_SenderName} this song is too old ({CP_SDK.Misc.Time.MonthNames[l_MinUploadDate.Month - 1]} {l_MinUploadDate.Year} minimum)!";
p_Reply = $"@{p_SenderName} this song is too recent ({CP_SDK.Misc.Time.MonthNames[l_MinUploadDate.Month - 1]} {l_MinUploadDate.Year} maximum)!";
```

## Active Queue Removal
```
SendChatMessage("@$UserName (bsr $BSRKey) $SongName / $LevelAuthorName is removed from queue!", p_Service, p_Message, l_SongEntry.BeatSaver_Map);
SendChatMessage($"@$UserName (bsr $BSRKey) $SongName / $LevelAuthorName request by @{l_SongEntry.RequesterName} is removed from queue!", p_Service, p_Message, l_SongEntry.BeatSaver_Map);
SendChatMessage($"$SongName / $LevelAuthorName $Vote% (bsr $BSRKey) requested by @{p_Entry.RequesterName} is next!", null, null, p_Entry.BeatSaver_Map);
```

## Move Song to Different Position
```
SendChatMessage($"@$UserName (bsr $BSRKey) $SongName / $LevelAuthorName requested by @{l_SongEntry.RequesterName} is now on top of queue!", p_Service, p_Message, l_SongEntry.BeatSaver_Map);
```

## Success Message Set
```
SendChatMessage("@$UserName message set!", p_Service, p_Message);
```

## Tracking Sabotage On/Off
```
SendChatMessage("The !bomb command is now " + (l_Parameter == "on" ? "enabled!" : "disabled!"), p_Service, p_Message);
```

## Tracking Queue Open/Close
```
SendChatMessage("Queue is now closed!", null, null);
SendChatMessage("Queue is now open!", null, null);
```

## Output from !queue with song names
```
! Song queue (5 songs 18m25s), next : (bsr 1a6e5) Turbo - Homura (Eurobeat Remix), (bsr 2836b) Lord Aethelstan - Boof Pack, (bsr 3bcfe) [Chroma] Greatest Love (feat. Elle Vee) - Culture Code & SZ, (bsr 3c094) TeMPoison(Ragnarok Online), (bsr 155a7) Friday - Riton x Nightcrawlers ft. Mufasa & Hypeman (Dopamine Re-Edit)
```
