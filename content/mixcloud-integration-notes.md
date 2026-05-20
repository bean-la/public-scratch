# Mixcloud Publishing Integration

**Repo:** https://github.com/futurerootsinc/MixcloudAPIClient
**Related to:** Slyce Studio worker publish pipeline
**Date:** 2026-05-20

## Context

Slyce Studio currently publishes audio to **S3** and **YouTube** (video), with a **SoundCloud** publish pipeline that serves as the direct analogy for Mixcloud.

Both SoundCloud and Mixcloud are audio-only platforms for long-form content (shows, mixes, broadcasts). Adding Mixcloud as a publish target would follow the existing SoundCloud worker pattern.

## Existing Publish Architecture (SoundCloud Analog)

```
Source/Asset (Sanity)
  → ffmpeg-asset-render (worker) creates mp3 render
  → soundcloud-push (worker) uploads mp3 to SoundCloud API
  → Publish doc (sanity) tracks upload state + destination URL
```

Key files in the SoundCloud pipeline:

- `apps/worker/src/lib/soundcloud-push.ts` — worker push function, uploads to SoundCloud API
- `packages/common/src/studio/schemaTypes/documents/publish.soundcloud.tsx` — Sanity schema for publish docs
- `packages/common/src/studio/studio-types/generated.ts` — typegen includes publish.soundcloud fields
- `apps/worker/src/trpc/local/queue.ts` — queue job type registration

## Mixcloud Integration Points

### Scope (MixcloudAPIClient)

The `MixcloudAPIClient` repo likely provides:

- OAuth2 authentication flow (client ID + secret → access token)
- Cloudcast upload API (multipart upload with audio file + metadata)
- Cloudcast metadata API (tags, description, publish date)
- User/account API

### Integration into Slyce

A Mixcloud publish target would involve:

1. **Sanity schema** — `publish.mixcloud` document type (analogous to `publish.soundcloud`):
   - `mixcloudUrl` — URL of the published cloudcast
   - `mixcloudId` — Mixcloud cloudcast ID
   - `uploadState` — pending / uploading / uploaded / failed
   - `errorMessage` — last upload error

2. **Worker push function** — `mixcloud-push.ts` (analogous to `soundcloud-push.ts`):
   - Reads mp3 render from S3
   - Calls MixcloudAPIClient upload endpoint
   - Creates/updates publish.mixcloud doc on success/failure
   - Follows same `processFunction` pattern as soundcloud-push

3. **Credentials** — Stored in `SuperTenantSecrets` as `mixcloud_client_id`, `mixcloud_client_secret`, `mixcloud_access_token`

4. **Queue job type** — `mixcloud-push` registered in queue job type enum

5. **GROQ queries** — Asset queries would join `publish.mixcloud` docs (same pattern as `"publishS3": *[_type == "publish.s3" && sourceRef._ref == ^._id]`)

6. **Admin UI** — Publish tab on asset detail page shows Mixcloud publish status

## Relevant Existing Patterns

| Pattern | SoundCloud | Mixcloud (planned) |
|---------|-----------|-------------------|
| Queue job type | `soundcloud-push` | `mixcloud-push` |
| Sanity doc type | `publish.soundcloud` | `publish.mixcloud` |
| Credentials in secrets | `soundcloud_user_token` | `mixcloud_access_token` |
| Worker file | `soundcloud-push.ts` | `mixcloud-push.ts` |
| S3 source | Same (preset mp3 render) | Same (preset mp3 render) |

## References

- SoundCloud push worker implementation: `apps/worker/src/lib/soundcloud-push.ts`
- Publish doc schema examples: `packages/common/src/studio/schemaTypes/documents/publish.*`
- Queue job registration: `apps/worker/src/trpc/local/queue.ts`
