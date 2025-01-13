import ChecklistIcon from '@mui/icons-material/Checklist'
import CodeIcon from '@mui/icons-material/Code'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule'
import ImageIcon from '@mui/icons-material/Image'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import TitleIcon from '@mui/icons-material/Title'
import type {OverridableComponent} from '@mui/material/OverridableComponent'
import type {Editor} from '@tiptap/core'

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

export const slashCommands: SlashCommandGroup[] = [
  {
    group: 'Basic blocks',
    commands: [
      {
        title: 'Text',
        description: 'Just start typing with plain text.',
        searchTerms: ['p', 'paragraph'],
        icon: TextFieldsIcon,
        action: (editor: Editor) => {
          editor.chain().focus().toggleNode('paragraph', 'paragraph').run()
        }
      },
      {
        title: 'To-do list',
        description: 'Track tasks with a to-do list.',
        searchTerms: ['todo', 'task', 'list', 'check', 'checkbox'],
        icon: ChecklistIcon,
        action: (editor: Editor) => {
          editor.chain().focus().toggleTaskList().run()
        }
      },
      {
        title: 'Heading 1',
        description: 'Big section heading.',
        searchTerms: ['title', 'big', 'large'],
        icon: TitleIcon,
        action: (editor: Editor) => {
          editor.chain().focus().setNode('heading', {level: 1}).run()
        }
      },
      {
        title: 'Heading 2',
        description: 'Medium section heading.',
        searchTerms: ['subtitle', 'medium'],
        icon: TitleIcon,
        action: (editor: Editor) => {
          editor.chain().focus().setNode('heading', {level: 2}).run()
        }
      },
      {
        title: 'Heading 3',
        description: 'Small section heading.',
        searchTerms: ['subtitle', 'small'],
        icon: TitleIcon,
        action: (editor: Editor) => {
          editor.chain().focus().setNode('heading', {level: 3}).run()
        }
      },
      {
        title: 'Bullet list',
        description: 'Create a simple bullet list.',
        searchTerms: ['unordered', 'point', 'list'],
        icon: FormatListBulletedIcon,
        action: (editor: Editor) => {
          editor.chain().focus().toggleBulletList().run()
        }
      },
      {
        title: 'Numbered list',
        description: 'Create a list with numbering.',
        searchTerms: ['numbered', 'ordered', 'list'],
        icon: FormatListNumberedIcon,
        action: (editor: Editor) => {
          editor.chain().focus().toggleOrderedList().run()
        }
      },
      {
        title: 'Quote',
        description: 'Create block quote.',
        searchTerms: ['blockquote', 'quotes'],
        icon: FormatQuoteIcon,
        action: (editor: Editor) => editor.chain().focus().toggleBlockquote().run()
      },
      {
        title: 'Code',
        description: 'Insert code snippet.',
        searchTerms: ['codeblock'],
        icon: CodeIcon,
        action: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run()
      },
      {
        title: 'Divider',
        description: 'Insert horizontal rule divider',
        searchTerms: ['horizontal rule', 'hr'],
        icon: HorizontalRuleIcon,
        action: (editor: Editor) => editor.chain().focus().setHorizontalRule().run()
      }
    ]
  },
  {
    group: 'Media',
    commands: [
      {
        title: 'Image',
        description: 'Upload any image from your device.',
        searchTerms: ['photo', 'picture', 'media', 'gif', 'giphy', 'tenor'],
        icon: ImageIcon,
        action: (editor: Editor) => {
          editor.chain().focus().run()

          const pageId = editor.storage?.pageId
          if (!pageId) return

          // upload image
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'image/*'
          input.multiple = true
          input.onchange = async () => {
            if (input.files?.length) {
              for (const file of input.files) {
                const pos = editor.view.state.selection.from
                console.log({file, pos})
                // uploadImageAction(file, editor.view, pos, pageId)
              }
            }
          }
          input.click()
        }
      }
    ]
  }
]
