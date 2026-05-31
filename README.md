# Copy-Paste Lab

Copy-Paste Lab is a real-time clipboard synchronization application that allows you to easily share text and images across different devices seamlessly. Simply create a session, share your 8-digit session ID, and any text or images copied to your clipboard can be instantly pasted and viewed by anyone in the session.

## Features

- **Real-Time Sync**: Instant synchronization of your clipboard content across devices using WebSockets.
- **Support for Text & Images**: Paste both plain text and images directly from your clipboard.
- **Session-Based Privacy**: Secure and private rooms using unique 8-digit session IDs.
- **Modern UI**: A beautiful, responsive, and glassmorphism-inspired interface.

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, TypeScript
- **Backend**: Node.js, Express, Socket.io, TypeScript

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aayushrambo8/copy-paste-lab.git
   cd copy-paste-lab
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

### Running the App Locally

To start both the frontend and backend development servers concurrently, simply run:

```bash
npm run dev
```

- The **frontend** will be available at `http://localhost:3000`
- The **backend** will be running on `http://localhost:4000`

### Usage

1. Open the application in your browser.
2. Join an existing session by entering a Session ID or create a new one.
3. Once in a session, simply use your keyboard shortcut (`Ctrl+V` or `Cmd+V`) to paste your clipboard contents into the app.
4. Your content will be instantly shared with anyone else connected to the same session ID!

## License

This project is licensed under the MIT License.
