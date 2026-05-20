# dublab.com Today vs Slyce

**Prepared for:** dublab  
**Repos:** [dublab-site](https://github.com/futurerootsinc/dublab-site) · [dublab-wp](https://github.com/futurerootsinc/dublab-wp)

**Start here.** This page covers the **current dublab.com stack** (WordPress + Google Calendar via Netlify Functions) and the **proposed Slyce workflow**, including what happens at publish time. For service-level detail (Sanity ids, worker ops, import wizard), see the [platform approach](dublab-approach-outline.html).

---

## In plain language

**Today:** A show airs → the recording is saved → someone opens WordPress, types the title and date, uploads audio, and publishes. The calendar already knows the schedule (GCal powers the live schedule on the site), but **archive posts are still manual**.

**With Slyce:** The recording lands → Slyce checks the calendar for what was on air at that time → it creates a show record and audio asset → FFmpeg produces MP3 and streaming versions → the result is ready to publish. Same calendar event never creates duplicates.

```mermaid
flowchart TD
    GCAL[("Google Calendar")]
    REC["Recording lands"]
    MATCH["Slyce matches to calendar event"]
    CREATE["Show record + audio asset"]
    PROCESS["MP3, HLS, etc."]
    PUBLISH["Publish — see options below"]

    GCAL --> MATCH
    REC --> MATCH
    MATCH --> CREATE --> PROCESS --> PUBLISH

    style GCAL fill:#c0392b,color:#fff
    style MATCH fill:#3498db,color:#fff
    style PROCESS fill:#2d6a4f,color:#fff
    style PUBLISH fill:#e67e22,color:#fff
```

| Today (manual) | With Slyce |
|----------------|------------|
| Someone notes when a show aired | Calendar already has the schedule |
| Manual WordPress archive post | Event + asset created automatically |
| Typed title, date, description | Pulled from the calendar event |
| Manual audio upload | FFmpeg → R2 automatically |
| Risk of duplicates or missed posts | One show record per GCal event id |

**Built and tested:** recording → match → create → audio processing. **Not yet configured:** pushing to dublab.com (WordPress or direct API — below).

---

## Current: dublab.com stack

dublab.com is three layers that only partially talk to each other.

```mermaid
flowchart TB
    subgraph NETLIFY["dublab-site — Netlify"]
        VUE["Vue SPA<br/>dublab.com"]
        FN_SCHED["Netlify Function<br/>schedule"]
        FN_ONE["Netlify Function<br/>schedule_single_event"]
    end

    GCAL["Google Calendar<br/>broadcast schedule"]
    subgraph WPENGINE["dublab-wp — WPEngine"]
        API["api-1.dublab.com<br/>LazyState JSON API"]
        EME["Events Manager<br/>broadcasts in WP DB"]
        ARCHIVE["Archive posts<br/>ACF: audio, date, show link"]
        S3["S3 media library<br/>S3-Uploads plugin"]
    end

    USER["Visitor / editor"]

    USER --> VUE
    VUE -->|"fetch /archive/..., /shows/..."| API
    VUE -->|"live schedule + now playing"| FN_SCHED
    VUE -->|"schedule detail by GCal id"| FN_ONE
    FN_SCHED --> GCAL
    FN_ONE --> GCAL
    API --> ARCHIVE
    API --> EME
    ARCHIVE --> S3

    style NETLIFY fill:#4a6fa5,color:#fff
    style GCAL fill:#c0392b,color:#fff
    style WPENGINE fill:#e67e22,color:#fff
```

### Layer 1 — Frontend (`dublab-site`)

| Piece | Role |
|-------|------|
| **Vue SPA** | Public site at dublab.com. Built with Vue CLI, deployed to Netlify (`dist/`). |
| **LazyState client** | Most pages load JSON from WordPress by URL path — e.g. `GET api-1.dublab.com/archive/my-show` returns structured page data. |
| **Netlify redirects** | Short links, stream URLs, legacy paths; SPA fallback to `index.html`. |

WordPress is a **headless JSON API** behind the SPA — not traditional WP templates.

### Layer 2 — GCal via Netlify Functions

The **live broadcast schedule** (schedule list, now playing, `/schedule/:id/...` detail) comes from **Google Calendar**, not WordPress.

| Function | What it does |
|----------|----------------|
| `schedule` | Google Calendar API for ~7 days of events. OAuth in Netlify env. In-memory cache ~1 hour. |
| `schedule_single_event` | One calendar event by GCal id. |

The Vue audio store calls `/.netlify/functions/schedule` on load. This path is **read-only** — it does not create archive posts or attach recordings.

### Layer 3 — WordPress backend (`dublab-wp`)

Hosted on **WPEngine** (`api-1.dublab.com`). The **dublab** theme exposes **LazyState** — URL patterns map to PHP models that return JSON.

| Route | Content |
|-------|---------|
| `/archive/...` | Past show archive posts — audio URL, broadcast date, genres, show/DJ links |
| `/schedule/...` | Events Manager rows (legacy schedule surface) |
| `/events/...` | Public events |
| `/shows/...` | Recurring show pages |

Archive posts use **ACF** (`audio`, `broadcast_date`, etc.). Media on **S3** via S3-Uploads.

### Current gap

```mermaid
flowchart LR
    GCAL2["Google Calendar"]
    NETLIFY2["Netlify Functions"]
    REC["Recording"]
    HUMAN["Manual WP archive post"]
    WP2["WordPress archive"]
    WEB["dublab.com"]

    GCAL2 --> NETLIFY2 --> WEB
    REC --> HUMAN --> WP2 --> WEB

    style HUMAN fill:#c0392b,color:#fff
    style NETLIFY2 fill:#4a6fa5,color:#fff
    style WP2 fill:#e67e22,color:#fff
```

- **Schedule** = GCal → Netlify → Vue (automated).
- **Archive** = recording → manual WordPress (not linked to GCal id for dedup).

---

## Proposed: Slyce backend

Slyce replaces **recording → metadata → processed audio**. Matching runs on **dubstream** (not Netlify); assets live in **Sanity + R2**.

```mermaid
flowchart TB
    subgraph BOX["dubstream box"]
        REC_S["Recording lands on disk"]
        WORKER["Slyce worker<br/>auto-import, GCal match, FFmpeg"]
    end

    GCAL_S["Google Calendar"]
    subgraph SLYCE_CLOUD["Slyce cloud"]
        SANITY["Sanity CMS"]
        R2["Cloudflare R2"]
        CLOUD["cloud API"]
        STAT["stat — media serving"]
    end

    STUDIO["dublab.slyce.studio"]

    REC_S --> WORKER
    GCAL_S --> WORKER
    WORKER --> SANITY
    WORKER --> R2
    CLOUD --> SANITY
    STUDIO --> CLOUD
    STAT --> R2

    style BOX fill:#2d6a4f,color:#fff
    style SLYCE_CLOUD fill:#4a6fa5,color:#fff
    style GCAL_S fill:#c0392b,color:#fff
```

Pipeline summary: auto-import → GCal match (±10 min) → `slyce.event` + `slyce.asset` → FFmpeg → R2. Details: [platform approach §4–6](dublab-approach-outline.html).

---

## Publish boundary: WordPress vs Slyce API

Built through FFmpeg → R2. **Still to decide:** how listeners get finalized shows on dublab.com.

```mermaid
flowchart TB
    subgraph BUILT["Built / in progress — Slyce"]
        REC3["Recording"] --> MATCH3["GCal match"] --> ASSET3["Sanity event + asset"] --> RENDER3["FFmpeg → R2"]
    end

    subgraph FUTURE["Future — publish path TBD"]
        OPT_A["Option A: Push to WordPress"]
        OPT_B["Option B: Slyce API on dublab.com"]
        WP_SITE["dublab.com archive"]
        LISTENER["Listener"]

        OPT_A --> WP_SITE --> LISTENER
        OPT_B --> LISTENER
    end

    RENDER3 -.-> OPT_A
    RENDER3 -.-> OPT_B

    style BUILT fill:#2d6a4f,color:#fff
    style FUTURE fill:#1a1d26,color:#e8eaef
    style OPT_A fill:#e67e22,color:#fff
    style OPT_B fill:#3498db,color:#fff
```

| | Option A — Push to WP | Option B — Slyce as source |
|---|----------------------|---------------------------|
| **Idea** | Slyce is the factory; WordPress stays the storefront | dublab.com reads published assets from Slyce |
| **Pros** | Same archive URLs, SEO, existing UX | Single source of truth; end-to-end GCal dedup |
| **Cons** | Two systems; field mapping + sync job | Frontend migration; WP may remain for events/shows |

---

## Side-by-side

| Concern | Today | Proposed (Slyce) |
|---------|-------|------------------|
| Live schedule | GCal → Netlify → Vue | GCal → worker; site wiring TBD |
| Archive / past shows | Manual WP + S3 | Auto from recording match |
| Dedup by calendar event | Not on archive | Deterministic GCal event id |
| Processed audio | Manual S3 upload | FFmpeg → R2 |
| Public API | `api-1.dublab.com` | WP sync (A) or Slyce cloud/stat (B) |

---

## Next steps

1. **Run Slyce import** — `/admin/box/dubstream/sync/` ([details](dublab-approach-outline.html)).
2. **Decide publish boundary** — Option A, B, or hybrid.
3. **Define archive fields** — player, show links, Mixcloud, etc.
4. **Plan Netlify function retirement** — schedule can eventually come from Slyce.
