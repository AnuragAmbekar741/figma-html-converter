# Figma to HTML Converter

A full-stack application that converts Figma designs to pixel-perfect HTML/CSS using AI-powered conversion. The project integrates with Figma's OAuth API to fetch design files and uses LangChain (OpenAI/Gemini) to generate semantic HTML with separated CSS.

## Features

- **Figma OAuth Integration** - Secure authentication with Figma API
- **File Management** - Fetch and manage Figma files and nodes and store json and minified json to avoid extra call on figma server.
- **AI-Powered Conversion** - Convert Figma JSON to HTML using LLM (OpenAI or Gemini)
- **Pixel-Perfect Output** - Maintains exact design specifications (colors, typography, spacing, gradients)
- **Data Extraction** - Optimized JSON extraction to minimize token usage
- **File Storage** - Automatic saving of generated HTML and JSON files
- **Modern Stack** - React + TypeScript frontend, Express + TypeScript backend

## Tech Stack

### Frontend (Client)

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **TanStack Query** - Data fetching
- **Axios** - HTTP client

### Backend (Service)

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **LangChain** - LLM integration
- **OpenAI/Gemini** - AI models for conversion
- **Figma API** - Design file access
