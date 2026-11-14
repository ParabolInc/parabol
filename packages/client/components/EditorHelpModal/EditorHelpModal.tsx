import {cn} from '../../ui/cn'
import {modKey} from '../../utils/platform'
import IconButton from '../IconButton'
import IconLabel from '../IconLabel'

const typeShortcuts = [
  {
    label: 'Bold',
    icon: 'format_bold',
    keyboard: `${modKey} + b`,
    md: '**bold** or __bold__'
  },
  {
    label: 'Italic',
    icon: 'format_italic',
    keyboard: `${modKey} + i`,
    md: '*italic* or _italic_'
  },
  {
    label: 'Underline',
    icon: 'format_underline',
    keyboard: `${modKey} + u`,
    md: ''
  },
  {
    label: 'Strikethrough',
    icon: 'format_strikethrough',
    keyboard: `${modKey} + shift + x`,
    md: '~text~ or ~~text~~'
  }
]
const mentionShortcuts = [
  {
    label: 'Links',
    icon: 'link',
    keyboard: `${modKey} + k`,
    md: '[linked text](url)'
  },
  {
    label: 'Tags',
    icon: 'label',
    keyboard: 'press ‘#’',
    md: ''
  },
  {
    label: 'Emoji',
    icon: 'sentiment_satisfied',
    keyboard: 'press ‘:’',
    md: ''
  },
  {
    label: 'Mentions',
    icon: 'person_pin',
    keyboard: 'press ‘@’',
    md: ''
  }
]
const blockShortcuts = [
  {
    label: 'Inline code',
    icon: 'code',
    keyboard: '',
    md: '`code`'
  },
  {
    label: 'Code block',
    icon: 'web_asset',
    keyboard: '',
    md: (
      <span>
        {'```'}
        <br />
        {'code'}
        <br />
        {'```'}
      </span>
    )
  },
  {
    label: 'Quotes',
    icon: 'format_quote',
    keyboard: '',
    md: '>quote'
  }
]
const shortcutLists = [typeShortcuts, mentionShortcuts, blockShortcuts]

interface Props {
  handleCloseModal: () => void
}

const EditorHelpModal = (props: Props) => {
  const {handleCloseModal} = props
  return (
    <div className='flex h-[480px] w-[564px] flex-col rounded-lg bg-surface-card'>
      <div className='relative flex items-center justify-center pt-4 pb-1 text-fg-primary leading-normal'>
        <div>
          <IconLabel icon='keyboard' iconLarge />
        </div>
        <div className='ml-4 text-[20px]'>{'Formatting Text'}</div>
        <IconButton
          className='absolute top-1 right-1 h-6 w-6 p-0 leading-6 opacity-75'
          icon='close'
          iconLarge
          onClick={handleCloseModal}
          palette='midGray'
        />
      </div>
      <div className='flex w-full justify-end p-px'>
        <div className='w-48 pt-4 pr-2 pb-1 pl-2 text-left font-semibold text-[13px] text-fg-primary uppercase leading-[18px]'>
          {'Keyboard'}
        </div>
        <div className='w-48 pt-4 pr-2 pb-1 pl-2 text-left font-semibold text-[13px] text-fg-primary uppercase leading-[18px]'>
          {'Markdown'}
        </div>
      </div>
      {shortcutLists.map((shortcutList, listIndex) => {
        return (
          <div
            className={cn(
              'min-w-0 border border-hairline-strong text-left text-[13px] text-fg-primary leading-[18px]',
              listIndex === 0 ? 'mx-auto my-0' : 'mx-auto mt-4 mb-0'
            )}
            key={`shortcutList${listIndex + 1}`}
          >
            {shortcutList.map((shortcut, shortcutIndex) => {
              return (
                <div
                  className={cn(
                    'flex items-center py-1',
                    shortcutIndex % 2 ? 'bg-surface-card' : 'bg-surface-well'
                  )}
                  key={`${shortcut.label}`}
                >
                  <div className='w-11 pr-2 pl-4 text-center'>
                    <IconLabel icon={shortcut.icon} />
                  </div>
                  <div className='w-30 px-2'>
                    <b>{shortcut.label}</b>
                  </div>
                  <div className='w-48 px-2'>
                    <code>{shortcut.keyboard}</code>
                  </div>
                  <div className='w-48 px-2'>
                    <code>{shortcut.md}</code>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default EditorHelpModal
