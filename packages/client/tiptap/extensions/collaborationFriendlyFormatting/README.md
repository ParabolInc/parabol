# CollaborationFriendlyFormatting Extension

## Problem

When using TipTap with Y.js Collaboration, keyboard shortcuts (Cmd/Ctrl+B, I, U) for bold, italic, and underline don't work properly. The formatting appears to toggle but doesn't persist when you start typing.

## Root Cause

This is a fundamental incompatibility between ProseMirror's `storedMarks` mechanism and Y.js collaboration:

1. When you press Cmd+B with an empty selection, TipTap sets `storedMarks: [bold]` in the editor state
2. Y.js detects this state change and performs document synchronization
3. During sync, Y.js applies multiple `ReplaceStep` transactions to maintain consistency
4. Each Y.js transaction clears `storedMarks` to `null` (to prevent mark leakage during sync)
5. By the time you type, the stored marks are gone, so text appears unformatted

This creates an unbreakable cycle where any attempt to restore marks triggers more Y.js sync, which clears marks again.

## Solution

This extension uses a "pending marks" state to defer mark application until actual content is typed:

1. **When you press a formatting shortcut** (e.g., Cmd+B):
   - The extension stores a "pending mark" in plugin state (not in the document)
   - Records whether to add or remove the mark based on current cursor position
   - No changes are made to the document yet, so nothing syncs to other clients

2. **When you type your first character**:
   - The extension detects the text insertion
   - Applies all pending marks to the newly inserted text
   - Clears the pending marks state

## Usage

```typescript
import { CollaborationFriendlyFormatting } from '~/tiptap/extensions/collaborationFriendlyFormatting'

const editor = useEditor({
  extensions: [
    // ... other extensions
    CollaborationFriendlyFormatting,
    Collaboration.configure({ document: ydoc }),
    // ...
  ]
})
