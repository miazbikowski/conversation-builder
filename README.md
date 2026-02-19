# Conversation Editor

A web-based tool for editing conversations.json files for your Unity game.

## Setup

1. **Install Node.js** (if you haven't already)
   - Download from https://nodejs.org/ (get the LTS version)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - The terminal will show a URL like `http://localhost:5173`
   - Open that URL in your browser

## Usage

1. **Load JSON** - Click "Load JSON" and select your conversations.json file
2. **Edit** - Select a conversation from the sidebar and edit it
3. **Export** - Click "Export JSON" to download the edited file
4. **Create New** - Click "+ New Conversation" to add a new conversation

## Features (Coming Soon)

- [ ] Edit interactions (initial, reminder, conclusion)
- [ ] Add/edit/delete choices
- [ ] Visual choice tree editor
- [ ] Validation for required fields
- [ ] Undo/redo support

## Development

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
