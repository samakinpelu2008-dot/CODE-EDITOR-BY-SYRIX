# CODE EDITOR BY SYRIX

A visual website builder MVP built with React + Vite. It lets users add and style elements, see generated HTML/CSS/JS, preview the page, save work locally, and export a source ZIP.

## Run it

1. Install Node.js LTS from https://nodejs.org/
2. Extract this ZIP and open the `code-editor-by-syrix` folder in VS Code.
3. Open Terminal in VS Code and run:

   ```bash
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite (usually `http://localhost:5173`).

To make a production build, run `npm run build`. To test that build locally, run `npm run preview`.

## Change the branding and images

- **App logo:** `public/assets/app-logo.svg`
- **PWA app icon (192 px):** `public/assets/pwa-192.png`
- **PWA app icon (512 px):** `public/assets/pwa-512.png`
- **Maskable PWA icon:** `public/assets/pwa-maskable-512.png`
- **Canvas image placeholder:** the `Image` block is currently an editable placeholder, not a bundled photo. Use the Properties panel to enter an image URL. If you want a default photo, add it under `public/assets/` and set the image URL in the element's properties.

The app uses Lucide icons from the `lucide-react` package; there is no separate icon image folder to edit.

## Current MVP behavior

- Visual element library with click-to-add and drag/drop onto the canvas
- Editable headings, text, buttons, links, cards, containers, image blocks, inputs, dividers, and icons
- Property controls for text, image URL, background, text color, font size, radius, padding, and width
- HTML/CSS/JS code view generated from the same visual project model
- Preview, desktop/tablet/mobile canvas widths
- Undo/redo, duplicate, delete, save to browser storage, reset, and ZIP export
- PWA manifest and offline app-shell caching

## Notes

This is a working first version. The generated code panel is read-only so it cannot silently corrupt the visual project model; fully bidirectional arbitrary code editing, cloud projects/accounts, backend integrations, AI editing, and deployment are not included in this first version. Browser storage is local to the current browser/device. External image URLs require an internet connection.
