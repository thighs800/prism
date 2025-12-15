# Prism Application Specification

## 1. Overview
**Prism** is a next-generation specification editor designed for **Spec-Driven Development (SDD)**. It acts as a bridge between human intent and AI implementation, generating documents that are both human-readable (Narrative, Visual) and AI-executable (Structured, Explicit).

## 2. Core Philosophy
-   **Spec as Code**: Specifications are the primary source of truth. Code is a transient artifact generated from the spec.
-   **Dual Readability**:
    -   **Human View**: Focuses on narrative, context (Why), and visual flows (Mermaid).
    -   **AI View**: Focuses on constraints, schemas, state machines, and logical completeness.
-   **Generative TDD**: The spec defines not just the app, but the tests that verify the app.

## 3. System Architecture

### 3.1 Tech Stack
-   **Framework**: Next.js (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS (Premium, dark-mode first aesthetic)
-   **AI Integration**: Vercel AI SDK (or direct OpenAI/Anthropic API)
-   **State Management**: XState (for managing the complex editor state and "Maieutic" interview flows) or Zustand.
-   **Diagrams**: Mermaid.js (live rendering)

### 3.2 Key Components

#### A. The Maieutic Engine (Chat Interface)
-   **Role**: The "Socratic" interviewer.
-   **Function**: actively asks clarifying questions to the user to reduce ambiguity.
-   **Behavior**:
    -   Input: User's vague idea (e.g., "I want a login page").
    -   Action: AI analyzes missing constraints (e.g., "Which provider? Google? Email?", "Rate limits?").
    -   Output: Updates the specification document based on answers.

#### B. The Hybrid Editor (Dual View)
-   **Narrative Pane**: A rich-text/markdown editor where the human writes the story and context.
-   **Visual Pane**: Real-time rendering of Mermaid diagrams defined in the spec.
-   **Spec/Constraint Pane (AI View)**: A collapsible or separate view showing the generated JSON schemas, API definitions, and strict rules.

#### C. The Red Team Agent (Critic)
-   **Role**: Adversarial Validator.
-   **Trigger**: On save or manual "Review" click.
-   **Action**: Scans the spec for security holes, logical gaps, or vague instructions.
-   **Output**: Annotations/Comments on the spec (e.g., "Warning: No error handling defined for 500 responses").

#### D. The Builder Bridge (Output)
-   **Format**: Exports `AGENTS.md` or `specification.md`.
-   **Content**:
    -   # Narrative
    -   ## Flows (Mermaid)
    -   ## Data Models (JSON Schema/TypeScript Interfaces)
    -   ## Test Scenarios (Gherkin/Playwright)

## 4. Feature Requirements

### 4.1 Phase 1: MVP (The "Translator")
-   [ ] **Project Setup**: Next.js + Tailwind + Vercel AI SDK.
-   [ ] **Editor Interface**: Split pane (Markdown Left, Preview/Diagram Right).
-   [ ] **AI Chat Sidebar**: Context-aware chat that can read/edit the Markdown.
-   [ ] **Mermaid Support**: Auto-detect `mermaid` code blocks and render them.
-   [ ] **Export**: Button to copy the "Optimized Prompt" (the full spec).

### 4.2 Phase 2: The "Guarantor" (Quality & TDD)
-   [ ] **Red Team Integration**: A second "Critic" persona in the chat.
-   [ ] **Test Generation**: Automatically append a `## Verification Plan` section with Playwright/Jest pseudo-code based on the features.
-   [ ] **State Modeling**: Integration of refined state-charts for describing logic.

### 4.3 Phase 3: The "Ecosystem" (Integration)
-   [ ] **Version Control**: Lightweight history tracking (Why a change was made).
-   [ ] **GitHub Integration**: Push spec to repo as `AGENTS.md`.

## 5. User Workflow (The SDD Loop)
1.  **Draft**: User types "I want a Todo app" in the chat.
2.  **Refine**: Maieutic Engine asks "Persistent storage? Multi-user?".
3.  **Visualize**: Engine generates a Mermaid sequence diagram of the user flow. User confirms.
4.  **Critique**: Red Team Agent warns "What if local storage is full?". User answers.
5.  **Finalize**: User clicks "Compile". Prism generates the complete `specification.md` (Version 1.0).
6.  **Implement**: User passes this file to Cursor/Windsurf/Cline to generate code.
7.  **Loop**: If a bug is found, User updates PRISM SPEC, not just the code.

## 6. Implementation Plan (Immediate Steps)
See `task.md` for the breakdown.
