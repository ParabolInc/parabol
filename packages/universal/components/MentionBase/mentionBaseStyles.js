import ui from '../../styles/ui'

const mentionBaseStyles = {
  row: {
    alignItems: 'center',
    color: ui.menuItemColor,
    cursor: 'pointer',
    display: 'flex',
    fontSize: ui.menuItemFontSize,
    height: ui.menuItemHeight,
    lineHeight: ui.menuItemHeight,
    padding: `0 16px`,

    ':hover': {
      backgroundColor: ui.menuItemBackgroundColorHover,
      color: ui.menuItemColorHoverActive
    }
  },

  active: {
    backgroundColor: ui.menuItemBackgroundColorActive,
    color: ui.menuItemColorHoverActive,

    ':hover': {
      backgroundColor: ui.menuItemBackgroundColorActive
    }
  },

  description: {
    fontSize: ui.menuItemFontSize,
    lineHeight: ui.menuItemHeight,
    paddingLeft: '.75rem'
  }
}
export default mentionBaseStyles
