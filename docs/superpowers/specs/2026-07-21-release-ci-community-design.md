# Release automation, versioning, and community templates

**Date:** 2026-07-21  
**Status:** Approved  
**Repo:** `formsreach-sdk` (pnpm monorepo)  
**Approach:** Changesets fixed monorepo (Approach A)

## Summary

Add deliberate versioning and npm publishing via Changesets (lockstep across packages), a GitHub Actions release workflow, and core GitHub community templates (bug report, feature request, PR template). Existing CI quality gates stay as-is.

## Goals

1. Lockstep semver for `@formsreach/js`, `@formsreach/react`, and `@formsreach/vue`
2. PR-based releases: contributors add changesets; maintainers merge a Version PR to bump, changelog, tag, and publish
3. CI publishes public packages to npm on successful release (unpkg follows npm for the CDN file)
4. Structured bug and feature issue forms plus a short PR checklist
5. Keep existing `ci.yml` checks (format, lint, build, test, typecheck); add a separate release workflow only

## Non-goals

- Independent per-package versioning
- Fully automatic bump/publish from Conventional Commits alone (commitlint stays for messages only)
- Canary / snapshot publishes
- Dependabot, Node version matrix, or CI hardening beyond today’s job
- CODE_OF_CONDUCT, SECURITY.md, or a full CONTRIBUTING.md (later)
- Dual-publish to GitHub Packages
- npm trusted publishing / OIDC (classic `NPM_TOKEN` first)
- Auto-merge of the Version Packages PR
- Single root `CHANGELOG.md` as the primary changelog (per-package changelogs via Changesets)

## Locked decisions

| Topic | Decision |
|---|---|
| Version strategy | Lockstep (fixed Changesets group) |
| Release style | PR-based Changesets |
| Publish | CI publishes to npm on Version PR merge |
| Changelogs | Per-package `CHANGELOG.md` (Changesets default) |
| Quality CI | Unchanged check list; release is a separate workflow |
| Community templates | Bug form, feature form, issue config, PR template |
| Blank issues | Allowed (`blank_issues_enabled: true`) |
| Auth for npm | Repo secret `NPM_TOKEN` |

## Architecture

```
packages/js|react|vue  (published, fixed versions)
        ▲
        │  version / changelog / publish
.changeset/config.json + .changeset/*.md
        ▲
        │  release.yml (push to main)
changesets/action
  → open/update "Version Packages" PR
  → or publish when no pending changesets after version commit

.github/workflows/ci.yml     # quality only (unchanged steps)
.github/ISSUE_TEMPLATE/*     # bug + feature + config
.github/pull_request_template.md
```

### File layout

| Path | Role |
|---|---|
| `.changeset/config.json` | Fixed package group, `baseBranch: main`, `access: public`, changelog |
| `.changeset/*.md` | Per-PR release intent (from `pnpm changeset`) |
| `packages/*/package.json` | Version source of truth (kept equal by fixed mode) |
| `packages/*/CHANGELOG.md` | Generated/updated by `changeset version` |
| Root `package.json` | `private: true`; scripts only; not published |
| `.github/workflows/ci.yml` | Existing format/lint/build/test/typecheck |
| `.github/workflows/release.yml` | Version PR + `changeset publish` |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | Bug issue form |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | Feature issue form |
| `.github/ISSUE_TEMPLATE/config.yml` | Chooser + optional product contact link |
| `.github/pull_request_template.md` | Short PR checklist |

### Changesets config (behavioral requirements)

- **Fixed group:** `@formsreach/js`, `@formsreach/react`, `@formsreach/vue` always share one version; highest bump in a release wins for the group.
- **`access`:** `public`
- **`baseBranch`:** `main`
- **`updateInternalDependencies`:** `patch` so react/vue pick up the published `@formsreach/js` version after release.
- **Commit / ignore:** Do not publish the private root workspace package; only `packages/*`.
- **Linked vs fixed:** Use **fixed** (not merely linked) so versions never diverge.

### Root scripts to add

```json
"changeset": "changeset",
"version-packages": "changeset version",
"release": "pnpm build && changeset publish"
```

- `changeset` — interactive (local)
- `version-packages` — mainly used by CI / maintainers
- `release` — build packages then publish; used by `release.yml` publish path

Dev dependency: `@changesets/cli` at the monorepo root.

## Versioning rules

1. All three packages always have the same `version` string after any Version PR.
2. Bumps are only from changeset files (`patch` / `minor` / `major`), not from commit message parsing.
3. Local deps stay `workspace:*` in source; publish rewrites to concrete versions.
4. Packages currently sit at `0.1.0` and are not yet on npm. The first public ship must go through a normal changeset + Version PR so changelogs and tags exist. Use a changeset summary such as "Initial public release" with an intentional bump (recommended: `minor` → `0.2.0`, or `patch` → `0.1.1`). Do not add a dummy changeset for tooling-only PRs; wait until something is meant to ship.
5. Git tags: accept Changesets’ default per-package tags (e.g. `@formsreach/js@0.1.1`) at matching versions. No monorepo-only `vX.Y.Z` tag in this pass.
6. Conventional Commits remain enforced by commitlint for history quality only.

## Release flow

### Contributor path

1. Implement the change.
2. If the change affects published package behavior or public API: run `pnpm changeset`, select bump level and summary, commit the new `.changeset/*.md` file.
3. Open PR. Template checklist includes “Changeset added if this affects published packages.”
4. `ci.yml` runs; no publish.

Tooling-only, docs-only, or internal-only PRs need no changeset unless a version bump is intentional.

### Maintainer / CI path

1. On each push to `main`, `release.yml` runs with concurrency limited to one release job.
2. If pending changesets exist: `changesets/action` creates or updates the **Version Packages** PR (bumps fixed packages together, updates per-package `CHANGELOG.md`, removes consumed changesets).
3. Maintainer reviews changelog wording on the Version PR and merges.
4. On the subsequent push to `main` (version commit, no pending changesets): action runs publish:
   - `pnpm install --frozen-lockfile`
   - `pnpm release` (build + `changeset publish`) with `NPM_TOKEN`
5. Tags and npm packages published; unpkg serves `@formsreach/js` CDN file from npm.

### `release.yml` requirements

| Item | Requirement |
|---|---|
| Trigger | `push` branches: `[main]` |
| Runner | `ubuntu-latest` |
| Toolchain | pnpm 9, Node 22, frozen lockfile (align with `ci.yml`) |
| Permissions | `contents: write`, `pull-requests: write` (for Version PR + tags) |
| Concurrency | Single group (e.g. `release`) so parallel main pushes do not race |
| Core | `changesets/action@v1` with publish command invoking root `pnpm release` |
| Secrets | `NPM_TOKEN` for npm; `GITHUB_TOKEN` (default) for PRs/tags |

### Failure / edge cases

| Case | Expected behavior |
|---|---|
| Version PR open; more changesets merge to main | Next release run updates the Version PR |
| No changesets on main | Workflow succeeds as no-op |
| Publish fails | Fix credentials/permissions and re-run; avoid hand-editing versions unless recovering from a partial publish |
| Feature PR red CI | No release impact; Version PR should also pass the same CI |

## Community templates

### Bug report (`bug_report.yml`)

Required or structured fields:

1. Description (required)
2. Package (dropdown: `@formsreach/js`, `@formsreach/react`, `@formsreach/vue`, unclear)
3. Version (required)
4. Environment (browser / Node / framework)
5. Steps to reproduce (required)
6. Expected vs actual
7. Minimal repro link (optional)

Apply label `bug` via the form when supported.

### Feature request (`feature_request.yml`)

1. Problem / use case (required)
2. Proposed solution (required)
3. Alternatives considered (optional)
4. Affected packages (multi-select same package list)

Apply label `enhancement` via the form when supported.

### Config (`config.yml`)

- `blank_issues_enabled: true`
- Contact link to https://formsreach.com labeled for product/account help (keeps non-SDK support out of the issue tracker)

### PR template (`pull_request_template.md`)

Short markdown:

- Summary section
- Checklist: tests if behavior changed; `pnpm check` / CI green; changeset if published packages affected; docs/README if public API or usage changed

## Documentation updates (light)

- Root `README.md`: brief “Contributing” / “Releasing” notes — issue templates, `pnpm changeset` for package changes, Version PR + npm publish overview; link to Changesets docs.
- Root `AGENTS.md`: one line that user-facing package changes need a changeset.

No full CONTRIBUTING.md in this pass.

## Maintainer ops (one-time and ongoing)

### One-time

1. Ensure npm identity can publish under `@formsreach` (org or user scope).
2. Create GitHub Actions secret `NPM_TOKEN` with publish rights.
3. Confirm readiness for first public `0.1.0` (or next) publish of all three packages.
4. After this work merges: only open a Version PR when a real changeset lands with a shippable change.

### Ongoing

1. Treat Version Packages PR as a normal review (edit changelog text if needed before merge).
2. After merge, confirm release job success and npm (and unpkg for js CDN).
3. Prefer re-running the workflow over manual version edits when publish fails.

## Implementation outline

1. Add `@changesets/cli`; init `.changeset/config.json` with fixed packages and public access.
2. Add root scripts: `changeset`, `version-packages`, `release`.
3. Add `.github/workflows/release.yml` with changesets/action and concurrency.
4. Leave `.github/workflows/ci.yml` check steps unchanged.
5. Add issue forms + config + PR template.
6. Update README and AGENTS.md lightly.
7. Document `NPM_TOKEN` requirement (README or release note in this spec’s ops section is enough).
8. Verify: dry-run mental path — `pnpm changeset` creates file; config validates; workflow YAML is valid. Full publish verification requires the secret and is a post-merge maintainer step.

## Success criteria

- [ ] `.changeset/config.json` fixes the three packages together; `access: public`; `baseBranch: main`
- [ ] `pnpm changeset` works from repo root
- [ ] `release.yml` opens/updates Version PR when changesets exist; publishes when appropriate after Version PR merge
- [ ] `ci.yml` still runs format:check, lint, build, test, typecheck only for quality
- [ ] Bug + feature issue forms, config.yml, and PR template exist
- [ ] README (and AGENTS one-liner) document changesets + release
- [ ] Root package remains private and is never published
- [ ] No Dependabot, canaries, or extra community policy files in this pass

## Risks

| Risk | Mitigation |
|---|---|
| Contributors forget changesets | PR template checklist; review habit; no bump until someone adds one |
| `NPM_TOKEN` missing/expired | Document secret; failed publish job is the signal |
| Partial multi-package publish | Prefer single `changeset publish`; recover carefully without inventing divergent versions |
| Fixed mode surprise (all packages bump) | Document lockstep in README; correct for tightly coupled SDKs |

## Alternatives considered

| Approach | Why not chosen |
|---|---|
| release-please | Less explicit per-PR release intent; user preferred Changesets |
| semantic-release / fully automatic | Hands-off notes; user wanted PR-based control |
| Independent package versions | Extra complexity; packages are coupled via `@formsreach/js` |
| Manual-only version scripts | Easy to drift in a monorepo |
| Root-only CHANGELOG | Diverges from Changesets defaults; per-package is clearer for npm consumers |
