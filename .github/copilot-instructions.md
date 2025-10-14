## Purpose

This file gives focused, repository-specific steps that an automated coding agent (Copilot / AI assistant) should follow to become productive in this repository.

Note: a quick scan of the workspace returned no application files or existing AI guidance files (no `README.md`, `package.json`, `pyproject.toml`, `go.mod`, or `AGENT.md`). If this is surprising, run the discovery commands in the "First actions" section below or point me to the correct subdirectory.

## First actions (discovery)

1. List top-level files to confirm scope:

   - `ls -la`

2. Search for common manifests (run from repo root):

   - `find . -maxdepth 4 -type f \( -name "package.json" -o -name "pyproject.toml" -o -name "go.mod" -o -name "*.sln" -o -name "Pipfile" -o -name "Cargo.toml" \)`

3. Check for CI/workflows and Docker / infra:

   - `ls -la .github/workflows || true`
   - `ls -la | grep -E "Dockerfile|docker-compose.yaml|docker-compose.yml|k8s|charts" || true`

4. If you find a manifest, extract build/test commands immediately (examples):

   - Node: `jq -r '.scripts | keys[]' package.json` to list npm scripts
   - Python: inspect `pyproject.toml` or `setup.cfg` for test/tool config
   - Go: presence of `go.mod` -> `go test ./...`

If none of the above files exist, ask the repository owner where the project lives (subdirectory), or request a fresh push of the source tree.

## How to adapt edits here (rules for AI edits)

- Only modify or add files under the repo root or in the subdirectory that contains the actual project code. Do not create large scaffolding without confirmation.
- When adding or changing code, prefer changing a single small file and run the project's tests locally before proposing larger refactors.
- Preserve repository style: if you find formatting config (Prettier, black, gofmt), run it on modified files only.

## What to look for when code is present

- Service layout patterns to expect:
  - monorepo with `services/` or `cmd/` for executables
  - libraries under `pkg/` or `internal/`
  - web frontend under `web/`, `frontend/`, or `apps/`

- Integration points:
  - `Dockerfile`, `docker-compose.yml` — used for local dev and integration tests
  - `k8s/` or `charts/` — indicates Kubernetes deployment targets
  - `terraform/` or `infrastructure/` — infra-as-code and environment provisioning

- Tests and CI:
  - Inspect `.github/workflows/*` to find canonical test/build steps to reuse
  - Prefer the workflow commands when writing or running tests locally to match CI

## Examples and templates

- If you find `package.json` with scripts, prefer using those scripts instead of guessing `npm` commands. Example: use `npm run build` when `"build"` exists under `scripts`.
- If repo has `Makefile`, follow the variables and targets there (e.g., `make test`, `make lint`).

## When you can't infer intent

- Ask a short clarifying question to the repo owner. Example: "I ran a workspace scan and did not find language manifests or source files — should I scan a subdirectory, or push the project sources to the repo root?"

## Quick checklist for PR-ready changes

- Keep changes small and focused (single logical change per PR).
- Include a short description in the PR body explaining motivation and what was run locally (commands and results).
- Reference any CI workflow files or manifest files you relied on.

---

If you'd like, I can re-scan the repository root now, or you can point me to the directory that contains the source code. Which would you prefer?
