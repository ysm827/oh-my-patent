# Patent Disclosure Workflow Core Constitution

> **Provenance**: This is the repository-level edition of the project constitution. It is
> derived from the upstream Spec Kit constitution (v1.0.0, ratified 2026-03-17) and was
> adapted and adopted for this repository on 2026-09-15. An upstream workspace-level
> edition also exists and governs cross-project concerns (`projects/`, `.sisyphus/`). Each
> edition is authoritative for its own scope; this file is the authoritative edition
> **for this repository**. Template-sync bookkeeping from the original file is omitted,
> because this repository does not vendor Spec Kit templates.
>
> **Versioning**: The version recorded at the bottom of this file tracks the constitution
> itself. It is independent of the npm package version in `package.json` and follows its
> own semantic-versioning schedule.

## Scope of this edition

This repository is the workflow **runtime and plugin generator**; it is not a workspace
that drafts patent disclosures. Two different kinds of rule therefore live in this file,
and every principle and constraint below carries the scope it binds:

| Label     | Binds                                                                                                        | Takes effect for                                        |
| --------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `repo`    | **this repository** — its layout, build, adapters, published package                                           | contributors working in this repository                 |
| `product` | **the workspaces this repository generates** — the runtime contract written into `plugins/**/AGENTS.md`          | end users drafting a disclosure with a generated integration |
| `both`    | both                                                                                                          | —                                                       |

**Measured facts about this repository** (2026-09-15): orchestration assets live in
`src/agents/`, `src/commands/`, `src/adapters/`, `src/tui/`, `src/core/` and
`plugin.jsonc`. The repository root holds the generated `plugins/` tree, the build
configuration, and the governance documents. **Neither `projects/` nor `references/` exists
at the repository root** — those are `product` concepts, created by end users in their own
workspaces. Any statement below that names them is a `product` rule; reading it as a
description of this repository would be wrong.

## Core Principles

### I. Workflow-First Repository Boundaries  `repo` + `product`

**In this repository** (`repo`): orchestration assets MUST stay in the repository itself —
agent prompts under `src/agents/`, command handlers under `src/commands/`, adapter logic
under `src/adapters/`, the terminal UI under `src/tui/`, and the portable definition in
`plugin.jsonc`. Generated integration trees (`plugins/`) are **outputs**: they MUST be
produced by the adapters, never edited by hand, and the inputs they are generated from MUST
be committed so that a clean clone can reproduce them.

**In generated workspaces** (`product`): per-topic outputs MUST stay under
`projects/{NN}-{topic_slug}/` as independent project repositories, and core workflow changes
MUST NOT mix with the deliverables of a single patent project in the same commit scope.

Rationale: clear boundaries prevent cross-project contamination and keep orchestration logic
maintainable.

### II. Evidence-Backed Deliverables  `product` + `repo`

**In generated workspaces** (`product`): every generated claim in drafts or review artifacts
MUST be traceable to explicit source materials under that project's `references/` directory.
Agent synthesis MUST record source files when aggregating prior-art and debate outputs.

**In this repository** (`repo`): the same standard binds our own claims. Numbers published in
`README*`, findings in audit reports, and criteria in specifications MUST be reproducible from
a stated command, and figures that cannot be verified MUST be removed rather than
approximated.

Rationale: traceability is required for defensible novelty arguments and repeatable review.

### III. Human-Gated Quality Control  `both`

Any transition that changes patent direction or release readiness MUST include explicit human
decision points. Workflow definitions MUST preserve decision loops for innovation selection,
reviewer escalation, and final acceptance. In this repository the same gate applies to
governance and specification changes: they are adopted by human decision, not by automation.

Rationale: patent quality and risk cannot be delegated to automation alone.

### IV. Security and Compliance by Default  `both`

Repositories MUST NOT store secrets, credentials, or local server tokens. **Machine-specific
absolute paths MUST NOT be committed** — a committed path discloses the author's directory
layout and deployment topology, and makes a generated artifact unreproducible on any other
machine. Generated artifacts MUST NOT embed the path of the machine that produced them.
Security and compliance review tasks MUST be present in each major workflow phase where
architecture or claims are introduced.

Rationale: sensitive IP and regulated claims demand proactive risk control rather than
post-hoc cleanup, and a repository that publishes generated output cannot afford to publish
its author's filesystem with it.

### V. Deterministic Naming and Reproducibility  `both`

**In generated workspaces** (`product`): project directories MUST follow the
`{NN}-{topic_slug}` convention, and generated artifact paths MUST be deterministic and
script-friendly.

**In this repository** (`repo`): everything the build or the adapters generate — adapter
output, MCP configuration, manifests, the published package contents — MUST be reproducible
from committed inputs on a clean clone. Workflow modifications MUST keep output locations
stable across reruns unless a migration note is documented.

Rationale: stable paths and naming enable automation, auditing, and low-friction
collaboration.

## Operational Constraints

- `both` Workflow definition files MUST use explicit step IDs and predictable transitions.
- `repo` Any executable script added to the core repository MUST document a minimal
  smoke-check command, and that command MUST be runnable on a clean clone.
- `both` Documentation updates MUST preserve concise, evidence-backed wording for patent
  artifacts. This includes the hard rule that no document may claim a gate that does not
  exist: anything asserted as enforced MUST first exist in `.github/workflows/`.
- `repo` Specifications MUST live in the repository-root `specs/` directory, one directory per
  feature named `{NNN}-{slug}` (the Spec Kit convention), each holding the requirements, the
  technical plan, and the verification ledger for that change. No other directory is a valid
  home for a new specification. `docs/specs/` is a frozen v0.1.0 snapshot retained for
  reference only; new specifications MUST NOT be added there. Verdicts recorded in a
  specification's ledger MUST be reproducible from a stated command (see Principle II, `repo`).
- `both` When adding new agents or phases, maintain compatibility with existing project
  directory contracts (`product`) and with the portable definition in `plugin.jsonc`
  (`repo`) unless a documented migration plan is included.

## Delivery and Review Workflow  `product`

The five steps below describe the runtime contract this repository **generates** for end
users. This repository does not execute this workflow on itself: it has no `projects/`
directory, does not select topics, and does not generate patent drafts.

1. Initialize each topic in `projects/{NN}-{topic_slug}/` with references scaffolding.
2. Run evidence collection before innovation convergence and draft generation.
3. Keep reviewer and responder loops until no new blocking issue appears.
4. Require explicit human confirmation before final output packaging.
5. Validate output paths and required files before marking workflow complete.

## Governance  `repo`

This constitution supersedes ad hoc workflow practices for this repository. Amendments MUST
include:

- a written rationale,
- impacted template and workflow file list,
- compatibility impact note for existing project directories.

Versioning policy follows semantic versioning:

- MAJOR: backward-incompatible governance changes or principle removals/redefinitions.
- MINOR: new principle/section or materially expanded governance requirements.
- PATCH: clarifications, wording improvements, and non-semantic refinements.

Compliance review expectations:

- Pull requests touching workflow logic or orchestration definitions SHOULD verify alignment
  with this constitution and summarize the impact explicitly.
- Changes to adapter output or `plugin.jsonc` MUST preserve the invariants this constitution
  protects — deterministic artifact paths and zero stored secrets.
- New skills, commands, or workflow phases MUST NOT weaken the human decision gates required
  by Principle III.
- Compliance is a **contributor self-check**. No automated gate enforces this document today;
  do not assume CI verifies it. Anything claimed as enforced MUST first exist in
  `.github/workflows/`.

### Amendment record

**2026-09-15 — v1.0.0 → v1.1.0 (MINOR), first repository-level adoption.**

- **Rationale**: the text was ported from the upstream workspace edition with only six
  adaptations and inherited its assumptions. It described `projects/` and `references/` as
  if they were this repository's own layout, while this repository is the runtime those
  directories are generated *for*; it carried upstream dates (`Ratified 2026-03-17`) for a
  port performed on 2026-09-15; and `AGENTS.md` cited Principle IV as "the governing rule on
  secrets and local paths" while Principle IV never mentioned paths. This amendment makes
  the document describe the repository it actually governs.
- **Impacted files**: `CONSTITUTION.md`; references updated in
  `specs/001-review-remediation/spec.md`. Four referring documents
  (`AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `docs/README.md`) were checked and needed no
  change — none pinned a version, and the only factual claim among them
  (`AGENTS.md`: Principle IV governs secrets and local paths) became true by this amendment.
- **Compatibility impact**: none for existing project directories. No principle was removed
  or redefined in a way that invalidates prior output; the `product` rules keep exactly the
  meaning they had, only labelled. The single new normative requirement (`repo`: machine-
  specific absolute paths MUST NOT be committed) binds this repository and is already the
  subject of a remediation requirement.
- **Why MINOR and not PATCH**: adding local paths to the governed set of Principle IV is a
  materially expanded governance requirement, which this document classifies as MINOR.
  Scope labels and the Principle I rewrite are PATCH-level clarifications and would not, by
  themselves, have moved the version.

**2026-09-20 — v1.1.0 → v1.2.0 (MINOR), specification location.**

- **Rationale**: this document governs how work is done here but said nothing about where the
  specification of that work lives. The repository consequently had two candidate homes and
  used neither consistently: `docs/specs/` held v0.1.0 product specs written after the fact,
  and the first specification actually driven to completion
  (`specs/001-review-remediation/`) had been created at the repository root instead. A
  constitution silent on the location of its own repository's evidence base invites the next
  specification to land somewhere else again. This amendment fixes one canonical location and
  labels the other as history.
- **Impacted files**: `CONSTITUTION.md` (Operational Constraints); `CONTRIBUTING.md`
  (project-structure tree and a new "Spec-First Changes" section), `docs/README.md`
  (specification index). Each file under `docs/specs/` gained a snapshot banner; no content of
  the snapshot itself was rewritten.
- **Compatibility impact**: nothing moves. `specs/001-review-remediation/` already sits in the
  canonical location, and `docs/specs/**` is retained in place, only labelled. No existing
  project directory, adapter output, or generated artifact is affected — this is a `repo`-scoped
  rule about this repository's own working documents.
- **Why MINOR and not PATCH**: the amendment adds a normative requirement that did not exist
  before — where a specification MUST live, and that its recorded verdicts MUST be reproducible
  from a stated command. This document classifies a materially expanded governance requirement
  as MINOR.

**Version**: 1.2.0 | **Upstream base**: v1.0.0, ratified 2026-03-17 | **Adopted in this repository**: 2026-09-15 | **Last Amended**: 2026-09-20
