# Conversation Editor

Creates a json file of dialogue for an RPG game.

This is for the dialogue for my cRPG project, so it's based on mine and my colleague's design:
- There are conditions (can be boolean or integers)
- There are goals
- Based on these two, we assess which dialog to show you

The structure is such that:
- At the root level is a Conversation, which is typically an NPC, or if you're just narrating, could be an item you interact with. (Honestly, instead of "Conversation" I could've named it "Interactable", but I'm not bike-shedding this whole thing yet)
- Each Conversation has various "Interactions", these are entry points into a dialog which depend on the state of the game: for example, if you've never spoken to this NPC before, if you're speaking to them again to get a reminder, or if you've concluded a quest with them. The conditions should be such that only 1 interaction passes the checks, at a time.
- Each "Interaction" has a text and choices to respond. And those choices each have a response, and possibly more choices (for some back and forth dialogue).

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
2. **Edit** - Select a conversation from the sidebar and edit it, or add a new one.
3. **Export** - Click "Export JSON" to download the edited file
4. **Create New** - Click "+ New Conversation" to add a new conversation

## Features (Coming Soon)
- [ ] Validation for required fields (WIP)
- [ ] Undo/redo support

## Development

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
