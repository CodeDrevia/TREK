# Drevia fork of TREK

This is CodeDrevia's fork of [liketrek/TREK](https://github.com/liketrek/TREK) (AGPL-3.0; see
`LICENSE`, `NOTICE.md`, `TRADEMARKS.md`). It runs at trek.bombatomica64.dev from the
`simple-server` chart `apps/trek`, built by `image-builder@trek` on lorenzo-dev into
`ghcr.io/codedrevia/trek:<sha>`.

## Branches

| Branch | What |
| --- | --- |
| `main` | Mirror of upstream `main`. Never commit here; fast-forward it from `upstream/main`. |
| `drevia` | **Deployed trunk.** An upstream release tag plus our patch set on top. PRs target it. |

Current base: **upstream tag `v5.1.2`** (`5cfc7a602`).

## Patch set

Keep every Drevia change a small, self-contained commit on top of the tag (one feature, one
commit, squash-merged), so a rebase replays them one by one. Prefix the subject with `drevia:`.

| Commit subject | Why |
| --- | --- |
| `drevia: DREVIA.md` | This file. |
| `drevia: planner map follows dark mode` | Desktop planner map used the light tile in dark mode. |
| `drevia: currency converter on the Costs page` | Converter only lived on the dashboard. |

## Rebasing onto a new upstream release

```bash
git fetch upstream --tags
git switch drevia && git pull --ff-only
git switch -c rebase/vX.Y.Z
git rebase --onto vX.Y.Z <old-tag> rebase/vX.Y.Z   # e.g. --onto v5.2.0 v5.1.2
# resolve conflicts commit by commit; drop a patch upstream has since shipped
```

Then, before opening the PR into `drevia` (as a force-push replacement, reviewed like any change):

1. Read the upstream release notes and `server/src/**/migrations` diff between the two tags:
   migrations run forward only on start, so production needs a `travel.db` backup first
   (`simple-server/apps/trek/README.md`, "Upgrading TREK").
2. Re-check the image `Cmd`/entrypoint against `simple-server/apps/trek/templates/statefulset.yaml`.
3. Run the checks (below), update "Current base" and the patch table here.
4. Merge by replacing `drevia` (`git push --force-with-lease origin rebase/vX.Y.Z:drevia`) only
   after review; image-builder then builds the new head.

Also fast-forward `main`: `git push origin upstream/main:main`.

## Checks (no CI here)

Upstream's GitHub workflows are not relied on. Run locally in a throwaway container on
lorenzo-dev, under the heavy lock:

```bash
flock /tmp/drevia-heavy.lock timeout 20m sudo docker run --rm --memory=6g \
  -v "$PWD":/src:ro node:24 bash -c 'cp -a /src /w && cd /w && npm ci && \
  npm run build --workspace=shared && cd client && npx tsc --noEmit && npm run lint && npx vitest run'
```
