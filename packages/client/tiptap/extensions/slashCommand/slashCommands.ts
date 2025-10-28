import DetailsIcon from '@mui/icons-material/ArrowRight'
import ChecklistIcon from '@mui/icons-material/Checklist'
import CodeIcon from '@mui/icons-material/Code'
import FileOpenIcon from '@mui/icons-material/FileOpen'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import TableIcon from '@mui/icons-material/GridOn'
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule'
import ImageIcon from '@mui/icons-material/Image'
import InsightsIcon from '@mui/icons-material/Insights'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import TitleIcon from '@mui/icons-material/Title'
import type {OverridableComponent} from '@mui/material/OverridableComponent'
import type {Editor} from '@tiptap/core'

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
    icon: OverridableComponent<any>
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
            title: '<Untitled>',
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
        title: 'Image',
        description: 'Upload any image from your device',
        searchTerms: ['gif', 'giphy', 'image', 'media', 'photo', 'picture', 'tenor'],
        icon: ImageIcon,
        // shouldHide: () => true,
        action: (editor: Editor) => {
          const {to} = editor.state.selection
          const size = editor.state.doc.content.size
          let command = editor
            .chain()
            .focus()
            .setImageUpload()
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
