# Developer Guidelines

## Breaking Change Annotation

When a change could break the production build, cause runtime errors, or affect deployed functionality, add `[BREAKING CHANGE]` to the front of the task description.

## Client/Server Boundary

Next.js builds will fail if server-only imports (`fs`, `path`, etc.) are pulled into client components. All type-safe values (`Priority`, `PRIORITY_CONFIG`, `PRIORITY_ORDER`, `Task` interface) must live in a module that does not import Node.js builtins. File system modules should only be imported from server route handlers and server components.

## Test Before Pushing

Always run `next build` locally before pushing code. If it fails, fix it before creating the PR.

## Layout Changes

Changes to sidebar, Navbar, Footer, or ClientRoot must be verified to not cut off or overlap website content, especially on mobile viewports (<768px). Remove full-screen overlay elements that sit behind content.

## Known Precedent

- **PR #106** (priority field): Put Priority types in `db.ts` which imports `fs` breaking the production build with `Module not found: Can't resolve fs`. Fixed in **PR #109**.
- **Sidebar**: Mobile overlay at `z-30` with `bg-black/50` caused the website to appear dark/cut off on the portion of the viewport not covered by the sidebar. Fixed in PR #108.
