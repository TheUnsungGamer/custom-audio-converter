# 🎵 Custom Audio Converter

A desktop application for batch audio conversion, built with Electron, Node.js, and Python. Drag in your files, get clean audio out.

Built as a practical tool for my local AI projects — specifically to prep audio files for voice synthesis pipelines.

## Features

- Native desktop UI via Electron
- Batch file processing through a modular script engine
- JavaScript frontend + Python conversion backend
- Extensible — add new conversion formats by dropping scripts into `scripts/`

## Stack

| Layer | Tech |
|---|---|
| Desktop shell | Electron |
| Frontend | JavaScript / HTML / CSS |
| Conversion backend | Python |
| Build tooling | Vite / npm |

## Getting Started

```bash
# Clone the repo
git clone https://github.com/TheUnsungGamer/custom-audio-converter.git
cd custom-audio-converter

# Install dependencies
npm install

# Run in development mode
npm start

# Build for your OS
npm run build
```

## Project Structure

```
custom-audio-converter/
├── electron/       # Main process — window management, app lifecycle
├── src/            # Frontend UI
├── scripts/        # Conversion logic (Python + JS utilities)
├── public/         # Static assets
└── package.json
```

## Why I Built This

I needed a reliable way to batch-convert MP4 files to WAV for use in my [Project Ash Stack](https://github.com/TheUnsungGamer/Project-Ash-Stack) TTS pipeline. Existing tools were either too heavy or too limited, so I built my own.

---

Part of the [Project Ash](https://github.com/TheUnsungGamer/Project-Ash-Stack) ecosystem.
