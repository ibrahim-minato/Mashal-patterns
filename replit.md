# Mashal Patterns

## Overview

Mashal Patterns is a web-based smart sewing pattern generator designed for fashion design students and tailoring apprentices. The application provides two core capabilities:

1. **Manual Pattern Drafting** - A vector-based workspace with professional drawing tools for creating sewing patterns from scratch
2. **AI-Assisted Pattern Generation** - Uses Google's Gemini AI to analyze garment images and generate pattern guidance with measurements

The platform includes user authentication, role-based access control (Free/Premium/Admin tiers), and PDF export functionality with watermarking for free users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript
- **Routing**: React Router DOM (HashRouter for client-side routing)
- **Styling**: Tailwind CSS via CDN with custom fonts (Inter, Playfair Display)
- **Build Tool**: Vite 6 with React plugin
- **Icons**: Lucide React icon library

The application follows a component-based architecture with these main views:
- `LandingPage` - Marketing/intro page for unauthenticated users
- `AuthPage` - Login/signup (currently mock authentication with localStorage)
- `Dashboard` - User's project overview and quick actions
- `Workspace` - Main pattern drafting canvas with tools and AI integration
- `AdminPanel` - User management for admin role

### State Management
- Local component state with React hooks (useState, useEffect)
- User session persisted to localStorage (mock auth implementation)
- No external state management library - state is lifted to App component

### Authentication & Authorization
- **Current Implementation**: Mock authentication using localStorage
- **Role System**: Three-tier enum (FREE, PREMIUM, ADMIN)
- Route protection via conditional rendering and Navigate redirects
- Premium features gated by role check (AI generation, watermark-free exports)

### Canvas/Drawing System
The Workspace component implements a vector graphics editor with:
- Custom viewport management (pan, zoom)
- Multiple tool types (select, bezier, pencil, shapes, etc.)
- Path nodes with handles for bezier curves
- Symmetry modes for mirrored drafting
- Grid snapping and shape assist features

### Type System
Centralized TypeScript types in `types.ts` including:
- User and UserRole definitions
- Vector element structures (PathNode, VectorElement)
- Measurement interfaces for pattern calculations
- Tool and symmetry type enums

## External Dependencies

### AI Integration
- **Google Gemini AI** (`@google/genai`): Used for analyzing garment images and generating pattern guidance
- Model: `gemini-3-flash-preview`
- Requires `GEMINI_API_KEY` environment variable set in `.env.local`
- Accepts image data (base64) and measurement inputs, returns structured JSON with pattern pieces and instructions

### PDF Generation
- **jsPDF**: Client-side PDF generation for pattern exports
- Includes watermarking logic for free-tier users
- Embeds canvas snapshots and instruction text

### Environment Configuration
- API keys loaded via Vite's `loadEnv` and exposed as `process.env.GEMINI_API_KEY`
- Development server configured for port 5000 with open host access

### CDN Dependencies (via importmap in index.html)
- React and React DOM from esm.sh
- React Router DOM from esm.sh
- Lucide React icons from esm.sh
- jsPDF from esm.sh
- Google GenAI SDK from esm.sh