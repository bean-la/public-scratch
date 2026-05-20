# dublab + Slyce Meeting — May 20, 2026

**Purpose:** align on what Slyce should do first for dublab: automate archive creation from recordings and Google Calendar, then decide how those finished assets should appear on dublab.com.

---

## Agenda idea

### 1. Quick shared picture

Start with the current workflow:

- dublab.com already uses Google Calendar for the live schedule.
- Archive posts still require manual WordPress work after a show airs.
- Recordings, calendar metadata, archive pages, and Mixcloud links are not yet one connected flow.

Then frame Slyce as the bridge:

- Recording lands on the dubstream box.
- Slyce matches it to the Google Calendar event.
- Slyce creates event + asset records.
- FFmpeg renders listenable/downloadable versions.
- The team decides whether finished items push to WordPress or feed dublab.com directly.

### 2. What is ready to try

- Open the dubstream Sync page in Slyce Studio.
- Run a dry import first.
- Review which recordings match which calendar events.
- Run the real import once matches look right.
- Watch render jobs and verify playback.

### 3. Main decision: publish boundary

| Option | Meaning | Good for | Watch out for |
|---|---|---|---|
| Push to WordPress | Slyce prepares assets; WordPress remains the public archive source | Existing URLs, SEO, current dublab.com behavior | Field mapping and sync rules |
| Slyce API | dublab.com reads published archive data from Slyce | Cleaner long-term source of truth | Frontend integration work |
| Hybrid | Slyce powers new workflow, WordPress stays public for now | Fastest path with lower risk | Need clear ownership of duplicated fields |

Suggested first move: **hybrid**. Let Slyce become the archive factory, then push the final public fields back to WordPress while dublab.com stays stable.

### 4. Field mapping to confirm

For each archive item, confirm what dublab.com needs:

- title
- broadcast date and time
- show / DJ relationship
- description
- audio URL
- HLS or stream URL
- MP3 download URL
- image / artwork
- Mixcloud URL
- tags, genres, or series metadata

### 5. Calendar hygiene

Talk through what should happen when calendar titles contain prefixes or inconsistent naming.

Questions:

- Should names like `LIVE // Show Name` be stripped down automatically?
- Which Google Calendar should Slyce read?
- Are there multiple calendar sources for different kinds of programming?
- Who should approve unmatched or ambiguous recordings?

### 6. Related asks

Keep these visible, but separate from the core archive automation decision:

- Sadie's live chatbox idea: quick embed now, or part of a more intentional listener layer?
- May 31 Mad Radio / dublab collaboration: stream plan, documentation, co-branding, and post-event archive needs.
- Mixcloud backlog: confirm whether Slyce or an existing script should push Mixcloud URLs into WordPress.

---

## Proposed outcome by end of call

1. Decide whether the first public publishing path is WordPress sync, Slyce API, or hybrid.
2. Pick the first import scope: all recordings, recent recordings, or a small test batch.
3. Identify the required WordPress fields for an archive post.
4. Confirm who reviews unmatched recordings and calendar naming issues.
5. Agree on the next demo checkpoint after the first import + render pass.

## Short version to say out loud

The cleanest next step is not to redesign dublab.com first. It is to let Slyce automate the painful middle: match recordings to the schedule, render the files, and prepare archive-ready records. Then we choose the least disruptive way to get those records onto the public site.
