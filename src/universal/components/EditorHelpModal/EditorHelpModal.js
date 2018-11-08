import PropTypes from 'prop-types'
import React from 'react'
import portal from 'react-portal-hoc'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import DashModal from 'universal/components/Dashboard/DashModal'
import IconButton from 'universal/components/IconButton'
import IconLabel from 'universal/components/IconLabel'
import styled from 'react-emotion'
import UserAgent from 'fbjs/lib/UserAgent'

const isOSX = UserAgent.isPlatform('Mac OS X')
const modKey = isOSX ? '⌘' : 'ctrl'

const ModalHeader = styled('div')({
  alignItems: 'center',
  color: ui.palette.mid,
  display: 'flex',
  justifyContent: 'center',
  lineHeight: 1.5,
  padding: '0 0 .25rem',
  position: 'relative'
})

const ModalHeaderIcon = styled('div')({
  // Define
})

const ModalHeaderTitle = styled('div')({
  fontSize: appTheme.typography.s5,
  marginLeft: '1rem'
})

const CloseButton = styled(IconButton)({
  height: ui.iconSize2x,
  lineHeight: ui.iconSize2x,
  opacity: 0.75,
  padding: 0,
  position: 'absolute',
  right: '.125rem',
  top: 0,
  width: ui.iconSize2x
})

const HelpList = styled('div')(({listIndex}) => ({
  border: `.0625rem solid ${appTheme.palette.mid30l}`,
  color: appTheme.palette.dark50d,
  fontSize: appTheme.typography.s2,
  lineHeight: appTheme.typography.s4,
  margin: listIndex === 0 ? '0 auto' : '1rem auto 0',
  minWidth: 0,
  textAlign: 'left'
}))

const HelpRow = styled('div')(({shortcutIndex}) => ({
  alignItems: 'center',
  backgroundColor: shortcutIndex % 2 ? ui.palette.white : appTheme.palette.mid10l,
  display: 'flex',
  padding: '.25rem 0'
}))

const Icon = styled('div')({
  padding: '0 .5rem 0 1rem',
  textAlign: 'center',
  width: '2.75rem'
})

const Label = styled('div')({
  padding: '0 .5rem',
  width: '7.5rem'
})

const Keyboard = styled('div')({
  padding: '0 .5rem',
  width: '12rem'
})

const Markdown = styled('div')({
  padding: '0 .5rem',
  width: '12rem'
})

const HeaderLabelBlock = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '.0625rem',
  width: '100%'
})

const HeaderLabel = styled('div')({
  color: ui.palette.dark,
  fontSize: appTheme.typography.s2,
  fontWeight: 600,
  lineHeight: appTheme.typography.s4,
  padding: '1rem .5rem .25rem',
  textAlign: 'left',
  textTransform: 'uppercase',
  width: '12rem'
})

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
const EditorHelpModal = (props) => {
  const {closeAfter, handleCloseModal, isClosing} = props
  return (
    <DashModal
      closeAfter={closeAfter}
      isClosing={isClosing}
      modalLayout='viewport'
      onBackdropClick={handleCloseModal}
      position='absolute'
      width='36.875rem'
    >
      <ModalHeader>
        <ModalHeaderIcon>
          <IconLabel icon='keyboard' iconLarge />
        </ModalHeaderIcon>
        <ModalHeaderTitle>{'Task Card Formatting'}</ModalHeaderTitle>
        <CloseButton icon='close' iconLarge onClick={handleCloseModal} palette='midGray' />
      </ModalHeader>
      <HeaderLabelBlock>
        <HeaderLabel>{'Keyboard'}</HeaderLabel>
        <HeaderLabel>{'Markdown'}</HeaderLabel>
      </HeaderLabelBlock>
      {shortcutLists.map((shortcutList, listIndex) => {
        return (
          <HelpList listIndex={listIndex} key={`shortcutList${listIndex + 1}`}>
            {shortcutList.map((shortcut, shortcutIndex) => {
              return (
                <HelpRow shortcutIndex={shortcutIndex} key={`${shortcutList}${shortcutIndex + 1}`}>
                  <Icon>
                    <IconLabel icon={shortcut.icon} />
                  </Icon>
                  <Label>
                    <b>{shortcut.label}</b>
                  </Label>
                  <Keyboard>
                    <code>{shortcut.keyboard}</code>
                  </Keyboard>
                  <Markdown>
                    <code>{shortcut.md}</code>
                  </Markdown>
                </HelpRow>
              )
            })}
          </HelpList>
        )
      })}
    </DashModal>
  )
}

EditorHelpModal.propTypes = {
  closeAfter: PropTypes.number,
  handleCloseModal: PropTypes.func,
  isClosing: PropTypes.bool,
  isOpen: PropTypes.bool,
  openPortal: PropTypes.func
}

export default portal({closeAfter: 100})(EditorHelpModal)
