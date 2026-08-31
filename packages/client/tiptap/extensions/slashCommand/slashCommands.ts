import type {Editor} from '@tiptap/core'
import type {IconComponent} from '~/ui/icons'
import {
  AttachFile as AttachFileIcon,
  Checklist as ChecklistIcon,
  Code as CodeIcon,
  ArrowRight as DetailsIcon,
  FileOpen as FileOpenIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListNumbered as FormatListNumberedIcon,
  FormatQuote as FormatQuoteIcon,
  HorizontalRule as HorizontalRuleIcon,
  Image as ImageIcon,
  Insights as InsightsIcon,
  NoteAdd as NoteAddIcon,
  GridOn as TableIcon,
  TextFields as TextFieldsIcon,
  Title as TitleIcon,
  Toc as TocIcon,
  WebAsset as WebAssetIcon
} from '~/ui/icons'

declare module '@tiptap/core' {
  interface EditorEvents {
    pageLinkPicker: {willOpen: boolean}
  }
}
export type CommandTitle = (typeof slashCommands)[number]['commands'][number]['title']

export interface SlashCommandGroup {
  group: string
  commands: {
    title: string
    description: string
    searchTerms: string[]
    shouldHide?: (editor: Editor) => boolean
    icon: IconComponent
    action: (editor: Editor) => void
  }[]
}

export const slashCommands = [
  {
    group: 'Basic blocks',
    commands: [
      {
        title: 'Text',
        description: 'Just start typing with plain text.',
        searchTerms: ['p', 'paragraph'],
        icon: TextFieldsIcon,
        shouldHide: () => true,
        action: (editor: Editor) => {
          editor.chain().focus().toggleNode('paragraph', 'paragraph').run()
        }
      },
      {
        title: 'To-do list',
        description: 'Track tasks with a to-do list',
        searchTerms: ['todo', 'task', 'list', 'check', 'checkbox'],
        icon: ChecklistIcon,
        action: (editor: Editor) => {
          editor.chain().focus().toggleTaskList().run()
        }
      },
      {
        title: 'Heading 1',
        description: 'Big section heading',
        searchTerms: ['title', 'big', 'large', 'heading', 'h1'],
        icon: TitleIcon,
        action: (editor: Editor) => {
          editor.chain().focus().setNode('heading', {level: 1}).run()
        }
      },
      {
        title: 'Heading 2',
        description: 'Medium section heading',
        searchTerms: ['subtitle', 'medium', 'heading', 'h2'],
        icon: TitleIcon,
        action: (editor: Editor) => {
          editor.chain().focus().setNode('heading', {level: 2}).run()
        }
      },
      {
        title: 'Heading 3',
        description: 'Small section heading',
        searchTerms: ['subtitle', 'small', 'heading', 'h3'],
        icon: TitleIcon,
        action: (editor: Editor) => {
          editor.chain().focus().setNode('heading', {level: 3}).run()
        }
      },
      {
        title: 'Bullet list',
        description: 'Create a simple bullet list',
        searchTerms: ['unordered', 'point', 'list', 'bullet'],
        icon: FormatListBulletedIcon,
        action: (editor: Editor) => {
          editor.chain().focus().toggleBulletList().run()
        }
      },
      {
        title: 'Numbered list',
        description: 'Create a list with numbering',
        searchTerms: ['numbered', 'ordered', 'list'],
        icon: FormatListNumberedIcon,
        action: (editor: Editor) => {
          editor.chain().focus().toggleOrderedList().run()
        }
      },
      {
        title: 'Quote',
        description: 'Create block quote',
        searchTerms: ['blockquote', 'quotes'],
        icon: FormatQuoteIcon,
        action: (editor: Editor) => editor.chain().focus().toggleBlockquote().run()
      },
      {
        title: 'Code',
        description: 'Insert code snippet',
        searchTerms: ['codeblock'],
        icon: CodeIcon,
        action: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run()
      },
      {
        title: 'Table of contents',
        description: 'Navigate the headings on this page',
        searchTerms: ['toc', 'table of contents', 'contents', 'outline', 'navigation', 'headings'],
        icon: TocIcon,
        action: (editor: Editor) => editor.chain().focus().setTableOfContents().run()
      },
      {
        title: 'Details',
        description: 'Insert details',
        searchTerms: ['details', 'accordion', 'expandable', 'toggle'],
        icon: DetailsIcon,
        action: (editor: Editor) =>
          editor.chain().focus().setDetails().updateAttributes('details', {open: true}).run()
      },
      {
        title: 'Table',
        description: 'Insert a table',
        searchTerms: ['table', 'grid', 'spreadsheet', 'data'],
        icon: TableIcon,
        action: (editor: Editor) =>
          editor.chain().focus().insertTable({rows: 3, cols: 3, withHeaderRow: true}).run()
      },
      {
        title: 'Divider',
        description: 'Insert horizontal rule divider',
        searchTerms: ['horizontal rule', 'hr', 'divider', 'rule'],
        icon: HorizontalRuleIcon,
        action: (editor: Editor) => editor.chain().focus().setHorizontalRule().run()
      },
      {
        title: 'Link to page',
        description: 'Link to an existing page',
        searchTerms: ['link', 'hyperlink', 'url', 'anchor', 'href'],
        icon: FileOpenIcon,
        action: (editor: Editor) => {
          editor.emit('pageLinkPicker', {willOpen: true})
        }
      },
      {
        title: 'Create page',
        description: 'Create a page within the current one',
        searchTerms: ['page', 'subpage', 'sub-page', 'doc', 'subdoc', 'sub-doc', 'child'],
        icon: NoteAddIcon,
        action: (editor: Editor) => {
          const {state, schema} = editor
          const {selection} = state
          if (!selection) return
          const {from} = selection

          const pageLinkNode = schema.nodes.pageLinkBlock!.create({
            pageCode: -1,
            title: undefined,
            canonical: true
          })

          editor
            .chain()
            .focus()
            .insertContentAt(from, pageLinkNode)
            .setTextSelection(from + 1)
            .insertContent('<p></p>')
            .setTextSelection(from + 2)
            .run()
        }
      },
      {
        title: 'Database',
        description: 'Create a new database',
        searchTerms: ['database', 'import'],
        icon: TableIcon,
        action: (editor: Editor) => {
          const {state, schema} = editor
          const {selection} = state
          if (!selection) return
          const {from} = selection

          const databaseNode = schema.nodes.pageLinkBlock!.create({
            pageCode: -1,
            title: undefined,
            canonical: true,
            database: true
          })

          editor
            .chain()
            .focus()
            .insertContentAt(from, databaseNode)
            .setTextSelection(from + 1)
            .insertContent('<p></p>')
            .setTextSelection(from + 2)
            .run()
        }
      }
    ]
  },
  {
    group: 'AI',
    commands: [
      {
        title: 'Insights',
        description: 'Generate insights from past activities',
        searchTerms: ['insights', 'meetings', 'reports', 'summary', 'summaries'],
        icon: InsightsIcon,
        action: (editor: Editor) => {
          return editor.chain().focus().setInsights().run()
        }
      }
    ]
  },
  {
    group: 'Media',
    commands: [
      {
        title: 'Embed',
        description: 'Embed a video, doc, or link',
        searchTerms: [
          'embed',
          'video',
          'youtube',
          'loom',
          'vimeo',
          'google docs',
          'figma',
          'miro',
          'bookmark',
          'link',
          'url'
        ],
        icon: WebAssetIcon,
        action: (editor: Editor) => {
          const {to} = editor.state.selection
          const size = editor.state.doc.content.size
          // setTextSelection is load-bearing: embedBlock is an atom, so inserting it
          // leaves a NodeSelection on the node, and a chained insertContent would
          // replace it rather than append after it
          let command = editor
            .chain()
            .focus()
            .setEmbedBlock()
            .setTextSelection(to + 1)
          if (size - to <= 1) {
            command = command.insertContent('<p></p>').setTextSelection(to + 1)
          }
          return command.scrollIntoView().run()
        }
      },
      {
        title: 'Image',
        description: 'Upload any image from your device',
        searchTerms: ['gif', 'giphy', 'image', 'media', 'photo', 'picture', 'tenor', 'klipy'],
        icon: ImageIcon,
        // shouldHide: () => true,
        action: (editor: Editor) => {
          const {to} = editor.state.selection
          const size = editor.state.doc.content.size
          let command = editor
            .chain()
            .focus()
            .setFileUpload('image')
            .setTextSelection(to + 1)
          if (size - to <= 1) {
            // if we're at the end of the doc, add an extra paragraph to make it easier to click below
            command = command.insertContent('<p></p>').setTextSelection(to + 1)
          }
          return command.scrollIntoView().run()
        }
      },
      {
        title: 'File',
        description: 'Upload any file from your device',
        searchTerms: [
          'archive',
          'bin',
          'blob',
          'document',
          'file',
          'font',
          'pdf',
          'text',
          'upload',
          'zip'
        ],
        icon: AttachFileIcon,
        // shouldHide: () => true,
        action: (editor: Editor) => {
          const {to} = editor.state.selection
          const size = editor.state.doc.content.size
          let command = editor
            .chain()
            .focus()
            .setFileUpload('file')
            .setTextSelection(to + 1)
          if (size - to <= 1) {
            // if we're at the end of the doc, add an extra paragraph to make it easier to click below
            command = command.insertContent('<p></p>').setTextSelection(to + 1)
          }
          return command.scrollIntoView().run()
        }
      }
    ]
  }
] as const
