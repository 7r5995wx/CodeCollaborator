# CodeCollaborator 🚀

**CodeCollaborator** is a full-stack real-time collaborative code editor and multi-language compilation platform built with Next.js 14, Monaco Editor, WebRTC, and the Piston Code Execution API.

---

## ✨ Features

- 🔒 **Host Approval Waiting Room**: Hosts create sessions with a "Require Host Approval" toggle. Guests enter a real-time waiting room queue until the host approves entry.
- ⚡ **Multiplayer Real-Time Code Sync**: Edit code collaboratively with real-time cursor tracking and text diff synchronization.
- 🛠️ **40+ Programming Languages**: Run and compile JavaScript, TypeScript, Python 3, C++, Java, C#, Rust, Go, and live HTML/CSS/JS previews via the Piston API.
- 💻 **Monaco Editor Engine**: Features VS Code syntax highlighting, line numbers, font sizing, and multiple editor themes (VS Dark, One Dark Pro, Cyberpunk Neon, Night Owl, Monokai).
- 📁 **Multi-File Workspace**: Create, delete, and switch between workspace files (`main.js`, `utils.py`, `index.html`).
- 📺 **Live Terminal Drawer & Output Broadcasting**: View `stdout`, `stderr`, execution duration, exit codes, and broadcast execution output to all room participants.
- 💬 **In-Room Live Text Chat**: Integrated chat panel with system activity feed.
- 🌐 **Vercel Serverless Ready**: Designed to deploy seamlessly on Vercel without requiring external server setup.

---

## 🚀 Quick Start (Local Setup)

1. Open your terminal and navigate to the project directory:
   ```bash
   cd /Users/.../CodeCollaborator
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---


## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Glassmorphism UI
- **Code Editor**: `@monaco-editor/react` (Monaco Editor)
- **Real-Time Engine**: PeerJS & WebRTC P2P Mesh
- **Code Execution Engine**: Piston Execution Engine (`https://emkc.org/api/v2/piston`)
