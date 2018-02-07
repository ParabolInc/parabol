import PropTypes from 'prop-types';
import React from 'react';
import portal from 'react-portal-hoc';
import FontAwesome from 'react-fontawesome';
import {DashModal} from 'universal/components/Dashboard';
import {css} from 'aphrodite-local-styles/no-important';
import withStyles from 'universal/styles/withStyles';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const iconStyle = {
  display: 'block',
  lineHeight: ui.iconSize
};
const makeIcon = (name, large = false) => {
  const style = {
    ...iconStyle,
    fontSize: large ? ui.iconSize2x : ui.iconSize
  };
  return <FontAwesome name={name} style={style} />;
};

const typeShortcuts = [
  {
    label: 'Bold',
    icon: 'bold',
    keyboard: 'command + b',
    md: '**bold** or __bold__'
  },
  {
    label: 'Italic',
    icon: 'italic',
    keyboard: 'command + i',
    md: '*italic* or _italic_'
  },
  {
    label: 'Underline',
    icon: 'underline',
    keyboard: 'command + u',
    md: ''
  },
  {
    label: 'Strikethrough',
    icon: 'strikethrough',
    keyboard: 'shift + command + x',
    md: '~text~ or ~~text~~'
  }
];
const mentionShortcuts = [
  {
    label: 'Links',
    icon: 'link',
    keyboard: 'command + k',
    md: '[linked text](url)'
  },
  {
    label: 'Tags',
    icon: 'hashtag',
    keyboard: 'press ‘#’',
    md: ''
  },
  {
    label: 'Emoji',
    icon: 'smile-o',
    keyboard: 'press ‘:’',
    md: ''
  },
  {
    label: 'Mentions',
    icon: 'at',
    keyboard: 'press ‘@’',
    md: ''
  }
];
const blockShortcuts = [
  {
    label: 'Inline code',
    icon: 'code',
    keyboard: '',
    md: '`code`'
  },
  {
    label: 'Code block',
    icon: 'window-maximize',
    keyboard: '',
    md: <span>{'```'}<br />{'code'}<br />{'```'}</span>
  },
  {
    label: 'Quotes',
    icon: 'quote-left',
    keyboard: '',
    md: '>quote'
  }
];
const shortcutLists = [
  typeShortcuts,
  mentionShortcuts,
  blockShortcuts
];
const EditorHelpModal = (props) => {
  const {
    closeAfter,
    handleCloseModal,
    isClosing,
    styles
  } = props;
  return (
    <DashModal
      closeAfter={closeAfter}
      isClosing={isClosing}
      modalLayout="viewport"
      onBackdropClick={handleCloseModal}
      position="absolute"
      width="36.875rem"
    >
      <div className={css(styles.modalHeader)}>
        <div className={css(styles.modalHeaderIcon)}>
          {makeIcon('keyboard-o', true)}
        </div>
        <div className={css(styles.modalHeaderTitle)}>
          {'Task Card Formatting'}
        </div>
        <button className={css(styles.closeButton)} onClick={handleCloseModal}>
          {makeIcon('times-circle', true)}
        </button>
      </div>
      <div className={css(styles.headerLabelBlock)}>
        <div className={css(styles.headerLabel)}>
          {'Keyboard'}
        </div>
        <div className={css(styles.headerLabel)}>
          {'Markdown'}
        </div>
      </div>
      {shortcutLists.map((shortcutList, listIndex) => {
        const shortcutListStyles = css(
          styles.helpList,
          listIndex === 0 && styles.helpListFirst
        );
        return (
          <div
            className={shortcutListStyles}
            key={`shortcutList${listIndex + 1}`}
          >
            {shortcutList.map((shortcut, shortcutIndex) => {
              const rowStyles = css(
                styles.helpRow,
                (shortcutIndex % 2) && styles.helpRowAlt
              );
              return (
                <div className={rowStyles} key={`${shortcutList}${shortcutIndex + 1}`}>
                  <div className={css(styles.icon)}>
                    {makeIcon(shortcut.icon)}
                  </div>
                  <div className={css(styles.label)}>
                    <b>{shortcut.label}</b>
                  </div>
                  <div className={css(styles.keyboard)}>
                    <code>{shortcut.keyboard}</code>
                  </div>
                  <div className={css(styles.md)}>
                    <code>{shortcut.md}</code>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </DashModal>
  );
};

const styleThunk = () => ({
  modalHeader: {
    alignItems: 'center',
    color: ui.palette.mid,
    display: 'flex',
    justifyContent: 'center',
    lineHeight: 1.5,
    padding: '0 0 .25rem',
    position: 'relative'
  },

  modalHeaderIcon: {
    // Define
  },

  modalHeaderTitle: {
    fontSize: appTheme.typography.s5,
    marginLeft: '1rem'
  },

  closeButton: {
    appearance: 'none',
    backgroundColor: 'transparent',
    boxShadow: 'none',
    border: 0,
    color: appTheme.palette.mid50l,
    cursor: 'pointer',
    display: 'block',
    height: ui.iconSize2x,
    lineHeight: ui.iconSize2x,
    outline: 'none',
    userSelect: 'none',
    position: 'absolute',
    right: '.125rem',
    textAlign: 'center',
    top: 0,
    width: ui.iconSize2x,

    ':hover': {
      opacity: 0.5
    },
    ':focus': {
      opacity: 0.5
    }
  },

  helpList: {
    border: `.0625rem solid ${appTheme.palette.mid30l}`,
    color: appTheme.palette.dark50d,
    fontSize: appTheme.typography.s2,
    lineHeight: appTheme.typography.s4,
    margin: '1rem auto 0',
    minWidth: 0,
    textAlign: 'left'
  },

  helpListFirst: {
    margin: '0 auto'
  },

  helpRow: {
    alignItems: 'center',
    backgroundColor: appTheme.palette.mid10l,
    display: 'flex',
    padding: '.25rem 0'
  },

  helpRowAlt: {
    backgroundColor: '#fff'
  },

  icon: {
    padding: '0 .5rem 0 1rem',
    textAlign: 'center',
    width: '2.75rem'
  },

  label: {
    padding: '0 .5rem',
    width: '7.5rem'
  },

  keyboard: {
    padding: '0 .5rem',
    width: '12rem'
  },

  md: {
    padding: '0 .5rem',
    width: '12rem'
  },

  headerLabelBlock: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '.0625rem',
    width: '100%'
  },

  headerLabel: {
    color: ui.palette.dark,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4,
    padding: '1rem .5rem .25rem',
    textAlign: 'left',
    textTransform: 'uppercase',
    width: '12rem'
  }
});

EditorHelpModal.propTypes = {
  closeAfter: PropTypes.number,
  handleCloseModal: PropTypes.func,
  isClosing: PropTypes.bool,
  isOpen: PropTypes.bool,
  openPortal: PropTypes.func,
  styles: PropTypes.object
};

export default portal({closeAfter: 100})(withStyles(styleThunk)(EditorHelpModal));
