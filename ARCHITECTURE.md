# Technical Architecture: Manifestation Lab

## 1. System Overview
Manifestation Lab is a client-side heavy React application that orchestrates multiple Google Gemini models to perform code synthesis, audio transcription, and image generation.

## 2. Core Modules

### 2.1. Synthesis Services (`services/`)
- **GeminiService**: Handles the primary `generateArtifact` and `refineArtifact` calls. Uses `gemini-3-pro-preview` with a significant `thinkingBudget` for structural logic.
- **LiveDesignService**: Manages WebRTC-like audio streaming to `gemini-2.5-flash-native-audio-preview-09-2025` for voice-to-text refinement commands.
- **DocsService**: Utilizes `gemini-3-flash-preview` to analyze code and generate structured JSON documentation.

### 2.2. The Iframe Architect (`hooks/useIframeContent.ts`)
The application uses a unique "Iframe Injection" strategy:
1. **Sanitization**: Strips incoming AI-generated styles to enforce the application's design system.
2. **Injections**:
    - **Foundation**: Tailwind CSS via CDN.
    - **Theming**: Dynamic HSL CSS variables synced with the UI's "Theme Lab".
    - **Interactivity**: Custom ES6 scripts for element dragging and accessibility auditing.
3. **Communication**: Uses `postMessage` to sync custom CSS and theme state between the React host and the iframe guest.

### 2.3. Transmutation Engine (`utils/reactConverter.ts`)
Converts flat HTML into a React component:
- **Semantic Inference**: Identifies structural landmarks (nav, header, footer) to create functional sub-components.
- **State Discovery**: Automatically maps `input`, `select`, and `textarea` elements to a centralized `uiState` object.
- **Prop Mapping**: Translates standard HTML attributes (class, for) into React JSX props (className, htmlFor).

## 3. Data Flow
1. **Input**: User drops an image.
2. **Base64 Encoding**: `fileHelpers.ts` converts file to base64.
3. **Synthesis**: `GeminiService` sends image + prompt to `gemini-3-pro-preview`.
4. **Manifestation**: React receives HTML, saves to history, and renders the `LivePreview`.
5. **Sync**: `LivePreview` triggers the Iframe Architect to build the preview document.
6. **Iteration**: User provides chat/voice feedback; the loop repeats.

## 4. State Management
- **Local History**: Persisted in `localStorage` with a custom persistence engine (`useHistory.ts`) that prunes large assets when quota limits are reached.
- **UI State**: Managed via standard React hooks (`useState`, `useMemo`, `useCallback`).
