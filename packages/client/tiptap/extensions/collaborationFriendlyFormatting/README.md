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

Instead of relying on `storedMarks`, this extension inserts actual mark nodes into the document:

1. **When toggling ON a mark** (e.g., Cmd+B):
   - Inserts a zero-width space (`\u200B`) wrapped in the mark (e.g., `<strong>\u200B</strong>`)
   - Positions the cursor inside the marked region
   - User can now type, and text receives the mark naturally

2. **When toggling OFF a mark**:
   - Inserts a zero-width space after the current mark to move cursor outside
   - User can now type unformatted text

3. **Cleanup**:
   - A ProseMirror plugin removes lone zero-width spaces after user types real content
   - This prevents placeholder characters from accumulating in the document

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
```
