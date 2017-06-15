import ui from 'universal/styles/ui';
const mentionBaseStyles = {
  row: {
    alignItems: 'center',
    color: ui.menuItemColor,
    cursor: 'pointer',
    display: 'flex',
    fontSize: ui.menuItemFontSize,
    height: ui.menuItemHeight,
    lineHeight: ui.menuItemHeight,
    padding: `0 ${ui.menuGutterHorizontal}`,

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
    paddingLeft: ui.menuGutterInner
  }
};
export default mentionBaseStyles;
