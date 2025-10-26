import '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    collaborationFriendlyFormatting: {
      /**
       * Toggle bold formatting using mark insertion (Y.js compatible)
       */
      toggleBoldWithMarks: () => ReturnType
      /**
       * Toggle italic formatting using mark insertion (Y.js compatible)
       */
      toggleItalicWithMarks: () => ReturnType
      /**
       * Toggle underline formatting using mark insertion (Y.js compatible)
       */
      toggleUnderlineWithMarks: () => ReturnType
    }
  }
}
