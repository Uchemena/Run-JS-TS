# Run JS/TS

Run JavaScript, TypeScript, and TSX files directly inside VS Code with automatic restart on save.

This extension is for **executing code**, not previewing UI.

---

## What Problem This Solves

When working with small JavaScript or TypeScript files, the usual workflow is:

- open a terminal  
- run `node file.js` or `tsx file.ts`  
- edit the file  
- re-run the command  

This gets repetitive, especially for:
- learning
- prototyping
- small scripts
- simple servers

**Run JS/TS removes that friction** by letting you run a file directly from VS Code and automatically restarting it when you save.

No terminal focus. No npm scripts. No setup.

---

## What This Extension Does

- Runs `.js`, `.ts`, and `.tsx` files using Node
- Uses `tsx` to execute TypeScript and TSX without pre-compiling
- Restarts the process automatically when files change
- Shows all output in a dedicated VS Code output panel
- Integrates into the Explorer via right-click

You run a file once, then keep editing. The process restarts on save.

---

## Supported File Types

- `.js`
- `.ts`
- `.tsx`

---

## Requirements

- Node.js **18 or newer**
- VS Code **1.74 or newer**

No project-level configuration required.

---

## How to Use

### Run from the Explorer (recommended)

1. Open a folder in VS Code
2. Right-click a `.js`, `.ts`, or `.tsx` file in the Explorer
3. Click **Run JS/TS**

The file starts running immediately.

Output appears in the **JS/TS Live** output channel.

When you save changes, the process restarts automatically.

---

### Run from the Command Palette

1. Open the file you want to run
2. Open the Command Palette (`Cmd/Ctrl + Shift + P`)
3. Run **JS/TS Live: Start**

To stop execution, run **JS/TS Live: Stop**.

---

## Commands

**Run JS/TS**  
Runs the selected file. Available via right-click in the Explorer.

**JS/TS Live: Start**  
Starts live execution for the currently active file.

**JS/TS Live: Stop**  
Stops the running process.

---

## When This Is Useful

This extension is useful if you:

- are learning JavaScript or TypeScript
- want to run a single file quickly
- are writing small scripts or utilities
- are prototyping logic or backend behavior
- want automatic restart without setting up watch tools
- prefer staying inside VS Code instead of switching to the terminal

---

## When This Is *Not* the Right Tool

This extension is **not** intended for:

- previewing UI in a browser
- replacing `npm run dev`
- frontend frameworks (React, Vue, Svelte, Next.js, etc.)
- hot module reloading (HMR)
- bundling or production builds

If you need a browser-based UI preview, use:
- framework dev servers (Vite, Next, etc.)
- HTML Live Server
- VS Code Live Preview

---

## How Restart Works

- The file is executed as a Node process
- When any `.js`, `.ts`, or `.tsx` file in the workspace changes:
  - the process is stopped
  - the file is restarted

This is process-level restart, not browser refresh.

---

## Output

All logs and errors are shown in the **JS/TS Live** output channel.

Open it via:
- View → Output
- Select **JS/TS Live** from the dropdown

---

## License

MIT

---

### Final Note

This extension intentionally keeps its scope small.  
It focuses on **running code**, not serving or rendering UI.
