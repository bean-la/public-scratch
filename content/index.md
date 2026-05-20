# Slyce for dublab — Documentation

**Prepared for:** dublab · **May 2026**

This site has two main documents plus a meeting page. They overlap on purpose at different depths — read them in order unless you already know the current dublab.com stack.

---

## Which document to read

| | [Meeting page](dublab-meeting-2026-05-20.html) | [Today vs Slyce](dublab-current-vs-slyce.html) | [Platform approach](dublab-approach-outline.html) |
|---|:---:|:---:|:---:|
| **Best for** | Today's call | Stakeholders, producers, web team | Engineers, operators |
| **Answers** | Agenda, decisions, talking points | How dublab.com works *now* (WordPress + Netlify GCal) vs what Slyce changes; publish options (keep WP vs Slyce API) | Full Slyce architecture: services, pipelines, data model, ops, import steps |
| **Depth** | Call guide | Migration context + plain-language workflow | Technical reference (~9 sections) |
| **Read first?** | **For the meeting** | **For context** | Second — when you need implementation detail |

---

## The story in one paragraph

**Today:** dublab.com is a Vue app on Netlify. The **live schedule** comes from Google Calendar via Netlify Functions. **Archive pages** (past shows with audio) live in WordPress on WPEngine — someone creates each post by hand. Recordings and calendar metadata are not connected automatically.

**Proposed:** Slyce on **dubstream** matches each recording to the same Google Calendar, creates show + asset records, and processes audio to R2. What is still open: whether finalized assets **push back into WordPress** or **dublab.com reads Slyce directly**.

---

## Quick links

- **[Meeting page →](dublab-meeting-2026-05-20.html)** — agenda idea, decisions to make, and talking points for today's call
- **[Today vs Slyce →](dublab-current-vs-slyce.html)** — current stack, proposed workflow, Option A / B at publish time
- **[Platform approach →](dublab-approach-outline.html)** — Slyce services, recording pipeline, GCal automation, ops, import wizard

**Live:** [dublab.slyce.studio](https://dublab.slyce.studio) · **Repos:** [dublab-site](https://github.com/futurerootsinc/dublab-site) · [dublab-wp](https://github.com/futurerootsinc/dublab-wp) · [public-scratch](https://bean-la.github.io/public-scratch/) · [slyce-studio](https://github.com/bean-la/slyce-studio)
