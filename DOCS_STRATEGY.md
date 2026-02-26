# Documentation Stratification Strategy

This document outlines the organization of documentation across the `devcntr-app` repositories. The goal is to maintain documentation close to the code while presenting a unified portal to the user via Antora.

## 1. Top-Level Organization

The documentation ecosystem is divided into **Portal**, **Core Application**, **Tools**, and **Shared Resources**.

### 1.1 The Portal (`docs` Repository)

- **Repository**: `devcntr-app/docs` (This repository)
- **Antora Component**: `home`
- **Role**: The aggregation hub and entry point.
- **Content**:
  - **Landing Page**: `modules/ROOT/pages/index.adoc` - The "front door" of the documentation site.
  - **Ecosystem Overview**: Introduction to the Dev Center suite.
  - **Publishing Guide**: How to build, deploy, and contribute to this documentation system (`modules/publishing` - _to be created/consolidated_).
  - **Playbook**: `antora-playbook.yml` - The build configuration.

### 1.2 Core Application (`dev-center` Repository)

- **Repository**: `devcntr-app/dev-center`
- **Antora Component**: `dev-center`
- **Role**: Documentation for the main Dev Center desktop application.
- **Content**:
  - `modules/ROOT`: **User Manual** (Installation, Interface, Configuration).
  - `modules/knowledge-base`: **Knowledge Base** - Curated guides, best practices (e.g., Git workflows, SSH setup) surfaced by the app.
  - `modules/developer`: **Contributor Guide** - Architecture and development instructions for the app itself.

### 1.3 Constituent Tools & Upstream Forks

Tools that are forks or upstream clones are located in the `.forks` directory to keep the main workspace clean.

- **Policy**: We do **not** inject `docs/` folders or `antora.yml` files directly into upstream repositories.
- **Strategy**: Documentation for these tools is housed in the **Portal** (`docs` repo) or **Dev Center** (`dev-center` repo) unless we fully own the fork and intend to maintain a divergence.

| Repository      | Location         | Documentation Strategy                |
| :-------------- | :--------------- | :------------------------------------ |
| `code-d`        | `.forks/code-d`  | Defined in Portal (Reference)         |
| `msi-generator` | `msi-generator`  | Component in repo (`docs/antora.yml`) |
| `dprint`        | `.forks/dprint`  | Defined in Portal (Reference)         |
| `dlangui`       | `.forks/dlangui` | Defined in Portal (Reference)         |

### 1.4 Shared Resources

- **Repositories**: `antora-dark-theme`, `templates`, `antora-extensions-registry`
- **Role**: Documentation for internal tools and assets.
- **Content**: Usage instructions for themes, templates, and extensions.

## 2. Inventory & Status

| Repository      | Component       | Status       | Action Item                          |
| :-------------- | :-------------- | :----------- | :----------------------------------- |
| `docs`          | `home`          | **Active**   | Consolidate deployment docs here.    |
| `dev-center`    | `dev-center`    | **Active**   | `antora.yml` created; KB structured. |
| `code-d`        | N/A             | **External** | Document in `docs/modules/tools`.    |
| `msi-generator` | `msi-generator` | **Active**   | Verified in playbook.                |
| `dlang.org`     | TBD             | **External** | Link to official docs.               |
| `antora-*`      | Various         | **Active**   | Verified in playbook.                |

## 3. Implementation Plan

### Phase 1: Standardization

1. Ensure every _owned_ repository has a `docs/` folder.
2. Ensure every `docs/` folder has a valid `antora.yml`.
3. Update `docs/antora-playbook.yml` to include all active _owned_ repositories.

### Phase 2: Navigation

1. Update `home` component `nav.adoc` to link to all components.
2. Ensure consistent cross-linking (e.g., `dev-center` linking to `code-d` setup).

### Phase 3: Deployment

1. Formalize the "Publishing" documentation in `docs/modules/publishing`.
2. Automate playbook updates (optional).

## 4. Best Practices

- **Co-location**: Documentation lives in the same repo as the code (for owned repos).
- **Versioning**: Use Antora's versioning to match software releases (future goal).
- **Images**: Store images in `modules/<module>/assets/images`.
- **Examples**: Store code examples in `modules/<module>/examples` (or pull from source).

