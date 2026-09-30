# Export to Antigravity Integration & Tooling

This plan introduces an **Export to Antigravity** capability into ShopiRank. It enables merchants and developers to export current product SEO copy, keywords, and bulk instructions into structured task payloads optimized for the **Gemini Antigravity Agent**, as well as providing instructions and tools to export the codebase to an Antigravity development environment.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The clarifying questions were skipped. We are implementing the recommended dual approach:
> 1. **In-App "Export to Antigravity" Feature**: An action in the header and the SEO action bar that packages the product data, SEO requirements, and copywriting guidelines into an Antigravity Agent task prompt and structured JSON (`antigravity-task.json` / `task.md`) for autonomous catalog generation and auditing.
> 2. **Project Codebase Export Guide & Modal**: A dedicated exporter in the header/settings providing 1-click download of the complete app bundle, Git export instructions, and direct integration setup for running inside Google's Antigravity environment.

---

## 1. Overview & Core Concept

- **What It Does**:
  - Adds an **"Export to Antigravity"** button with a distinct agent icon in the top action bar and preview panel.
  - Generates specialized execution tasks ready for the **Gemini Antigravity Agent** (`agent: 'antigravity'`), allowing merchants to automate bulk SEO updates, run iterative competitor search audits, and trigger automated Shopify API syncs.
  - Provides a comprehensive **Antigravity Export Modal** with:
    - **Agent Task Payload**: Formatted markdown prompt and JSON schema configured for Antigravity execution.
    - **1-Click Download**: Download `antigravity-task.json` or `.md`.
    - **Codebase Export Guide**: Instructions for cloning and running this full-stack Vite/Express applet inside an Antigravity workspace.
- **Key Value**: Bridges the gap between single-product copywriting and autonomous agentic catalog management.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Triggering Export**:
   - In the right-hand preview panel, next to "Copy All SEO" and "Export to CSV", a new high-intent button: **"Export to Antigravity"**.
   - In the top header nav/action bar: Quick access dropdown or button to launch the Antigravity integration modal.
2. **Antigravity Modal Experience**:
   - **Tab 1: Agent Task (Copy & SEO)**: Displays the structured prompt ready for Antigravity with role instructions, product specifications, SEO rules, and target SERP metrics.
   - **Tab 2: JSON-LD & Tool Payload**: Machine-readable JSON specifying tool calls (`shopify_update_product`, `serp_audit`).
   - **Tab 3: Workspace & Code Export**: Steps to pull this project into an Antigravity container, run `npm install`, configure `GEMINI_API_KEY`, and launch the dev server.
3. **Interactive Actions**:
   - **Copy Prompt**: Copy the ready-to-run prompt to clipboard.
   - **Download Task Bundle**: Saves a `.zip` or `.json` file.
   - **Simulate Antigravity Run**: Live interactive execution preview showing how the Antigravity agent would process this task with tools.

### Visual Styling
- Styled consistently with ShopiRank's design tokens:
  - Emerald primary (`#006c49` / `#10b981`), cool slate canvas (`#f8f9ff`), crisp 1px borders, and JetBrains Mono monospace code preview.
  - Dedicated agentic status chips: `Agent: Antigravity` with glowing status dot.

---

## 3. Technical Architecture & Implementation Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                   ShopiRank User Interface                  │
│  [Single Writer]   [Preview Panel]   [SEO Metadata & SERP]  │
│                                              │              │
│                                   [Export to Antigravity]   │
└──────────────────────────────────────────────┬──────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Antigravity Export Modal                   │
│  ├── Tab 1: Agent Prompt (Instructions for Antigravity)     │
│  ├── Tab 2: Structured Task JSON (Schema & Product Data)    │
│  ├── Tab 3: Full Applet Source Export Guide                 │
│  └── Actions: [Copy Task]  [Download JSON]  [Run Simulation]│
└──────────────────────────────────────────────┬──────────────┘
                                               │
                                (Optional API) │
                                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Express Backend (/api/antigravity)          │
│  - Formats Antigravity Agent prompts and system instructions│
│  - Supports Gemini Interactions API agent execution schema  │
└─────────────────────────────────────────────────────────────┘
```

### Components to Create / Update:
1. `src/components/AntigravityExportModal.tsx`:
   - Interactive modal with tabs for Agent Task Prompt, Structured JSON, and Project Setup.
   - 1-click clipboard copy and file download (`antigravity_task.json`).
   - Interactive agent simulation with step-by-step reasoning logs.
2. `src/components/Header.tsx`:
   - Add "Export to Antigravity" quick action button in the top action cluster.
3. `src/App.tsx`:
   - Add "Export to Antigravity" button in the SEO Metadata action bar.
   - Wire state for modal visibility and active product payload.
4. `server.ts`:
   - Add `/api/antigravity/task` endpoint that compiles the current product state into an Antigravity agent instruction set.
