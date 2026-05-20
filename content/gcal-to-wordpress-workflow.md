# GCal → WordPress Archive: What This Does

**For the non-technical reader.**

## The Old Way (Manual)

1. A radio show airs (e.g. "Morning Show" on Monday 7-10am)
2. The recording file lands on the Slyce server automatically
3. Someone has to manually go into WordPress, create a new post, type the show name, date, description, and publish it
4. They do this for every single show, every day

This is slow, error-prone, and nobody wants to do it.

```mermaid
flowchart LR
    A["Show airs"] --> B["Recording saved"]
    B --> C["Person opens WordPress"]
    C --> D["Types title, date, description"]
    D --> E["Uploads audio"]
    E --> F["Publishes post"]
    F --> G["Repeat tomorrow..."]

    style C fill:#c0392b,color:#fff
    style D fill:#c0392b,color:#fff
    style E fill:#c0392b,color:#fff
    style G fill:#c0392b,color:#fff
```

## The New Way (Automated)

```mermaid
flowchart TD
    GCAL[("Google Calendar<br/>show schedule")]
    REC["Recording lands on server"]
    MATCH["Slyce matches recording<br/>to calendar event"]
    CREATE["Creates show record + audio asset"]
    PROCESS["Processes audio<br/>MP3, streaming, etc."]
    WP["Ready for WordPress archive"]

    GCAL --> MATCH
    REC --> MATCH
    MATCH --> CREATE
    CREATE --> PROCESS
    PROCESS --> WP

    style GCAL fill:#c0392b,color:#fff
    style REC fill:#c0392b,color:#fff
    style MATCH fill:#3498db,color:#fff
    style CREATE fill:#e67e22,color:#fff
    style PROCESS fill:#2d6a4f,color:#fff
    style WP fill:#27ae60,color:#fff
```

### Step 1: Google Calendar is the source of truth

Your broadcast schedule lives in Google Calendar. Each show is a calendar event with a name, time, and description. Slyce reads this calendar automatically.

```mermaid
graph LR
    subgraph "Your schedule"
        E1["Morning Show<br/>Mon 7–10am"]
        E2["Afternoon Mix<br/>Mon 2–4pm"]
        E3["Evening Session<br/>Mon 8–10pm"]
    end
    subgraph "Slyce"
        SYNC["Reads events automatically"]
    end
    E1 --> SYNC
    E2 --> SYNC
    E3 --> SYNC

    style SYNC fill:#3498db,color:#fff
```

### Step 2: Recording arrives → Slyce checks the calendar

When a recording file lands on disk, Slyce looks at what was on the calendar at that time. It finds the matching event — for example, if a recording arrived at 7:02am and "Morning Show" ran 7-10am, Slyce says "this recording is the Morning Show."

```mermaid
flowchart TD
    REC["Recording arrives<br/>7:02am"]
    WIN["Look at calendar<br/>±10 minutes around that time"]
    EVT["Morning Show<br/>7:00am – 10:00am"]
    YES["Match: this recording<br/>is the Morning Show"]
    NO["No match: flag for<br/>manual review in Studio"]

    REC --> WIN
    WIN --> EVT
    EVT --> YES
    WIN --> NO

    style REC fill:#c0392b,color:#fff
    style YES fill:#27ae60,color:#fff
    style NO fill:#e67e22,color:#fff
```

### Step 3: Slyce creates the show record and asset

At this point Slyce automatically creates two things:

- **A show record** (`slyce.event`) — thinks of it like a WordPress post draft. It has the show name, date, description pulled straight from the calendar event. It even saves the Google Calendar event ID so it never creates a duplicate if the same event runs again.
- **An audio asset** (`slyce.asset`) — thinks of it like the audio file that will be processed and published. It's linked to the show record.

```mermaid
graph TB
    GCAL_EVT["Calendar event<br/>Morning Show"]
    EVENT["Show record slyce.event<br/>like a WordPress draft"]
    ASSET["Audio asset slyce.asset<br/>linked to the show"]

    GCAL_EVT -->|"name, date, description"| EVENT
    EVENT --> ASSET
    REC2["Recording file"] --> ASSET

    style GCAL_EVT fill:#c0392b,color:#fff
    style EVENT fill:#3498db,color:#fff
    style ASSET fill:#e67e22,color:#fff
```

### Step 4: Processing happens automatically

Slyce automatically starts processing the audio (converting formats, creating MP3 and streaming versions) and prepares it for publishing. No one needs to click anything.

```mermaid
flowchart LR
    RAW["Original recording"]
    MP3["MP3 download"]
    HLS["Streaming version"]
    READY["Ready to publish"]

    RAW --> MP3
    RAW --> HLS
    MP3 --> READY
    HLS --> READY

    style RAW fill:#c0392b,color:#fff
    style MP3 fill:#2d6a4f,color:#fff
    style HLS fill:#2d6a4f,color:#fff
    style READY fill:#27ae60,color:#fff
```

### Step 5: Ready for WordPress

The show record has a `content` field designed to hold whatever format your WordPress archive needs (HTML, shortcodes, etc.). The data is structured and ready for a downstream step to push into WordPress.

```mermaid
flowchart LR
    SLYCE["Slyce show record<br/>structured metadata + audio"]
    PUSH["Archive push step<br/>configure when ready"]
    WP["WordPress post<br/>live on your site"]

    SLYCE --> PUSH
    PUSH --> WP

    style SLYCE fill:#3498db,color:#fff
    style PUSH fill:#e67e22,color:#fff
    style WP fill:#27ae60,color:#fff
```

## What This Replaces

| Old Way | New Way |
|---------|---------|
| Someone notes when a show aired | GCal already knows the schedule |
| Someone manually creates a WordPress post | Slyce creates the event + asset automatically |
| Someone types the show name, date, description | Pulled directly from the calendar event |
| Someone uploads the audio file | Slyce processes it automatically |
| Risk of forgetting or duplicating posts | Deterministic dedup — same GCal event never creates duplicates |

## What You See

In the Slyce admin, you can:

- Browse your calendar events on the **Google Calendar** page
- Click **Sync GCal** to scan existing recordings and match them against calendar events
- Find the auto-created show records and assets in the Studio

```mermaid
flowchart LR
    ADMIN["Slyce Studio"]
    GCAL_PAGE["Google Calendar page"]
    SYNC["Sync GCal button"]
    STUDIO["Show records + assets"]

    ADMIN --> GCAL_PAGE
    ADMIN --> SYNC
    SYNC --> STUDIO

    style ADMIN fill:#4a6fa5,color:#fff
    style SYNC fill:#3498db,color:#fff
    style STUDIO fill:#27ae60,color:#fff
```

## Key Detail: No Duplicates

Because each Google Calendar event has a unique ID, Slyce can guarantee it never creates two show records for the same event. Even if you run the sync 10 times, same result — one show record per calendar entry.

```mermaid
flowchart TD
    RUN1["Run sync #1"] --> CHECK{"Already have a show record<br/>for this calendar event ID?"}
    RUN2["Run sync #2"] --> CHECK
    RUN10["Run sync #10"] --> CHECK
    CHECK -->|No| CREATE["Create one show record"]
    CHECK -->|Yes| SKIP["Skip — already exists"]

    style CREATE fill:#27ae60,color:#fff
    style SKIP fill:#3498db,color:#fff
```

## Current Status

The pipeline from "recording arrives" → "event + asset created" → "audio processing starts" is built and tested. The final step (pushing to WordPress with the right formatting) is ready for configuration once the archive format is decided.

```mermaid
flowchart LR
    DONE1["Recording → match → create"]
    DONE2["Audio processing"]
    NEXT["WordPress push<br/>next: configure format"]

    DONE1 --> DONE2
    DONE2 --> NEXT

    style DONE1 fill:#27ae60,color:#fff
    style DONE2 fill:#27ae60,color:#fff
    style NEXT fill:#e67e22,color:#fff
```
