import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import appTheme from 'universal/styles/theme/appTheme.js';
import {srOnly} from 'universal/styles/helpers';

const ShortcutsMenu = (props) => {
  const {shortcutsList, onCloseClick, styles} = props;
  const renderMenuItem = (shortcut, index, array) => {
    const keystrokeStyle = css(
      styles.keystroke,
      index === 0 && styles.keystrokeIsFirst,
      index === array.length - 1 && styles.keystrokeIsLast
    );
    return (
      <li className={css(styles.shortcutsItem)} key={index}>
        <span className={keystrokeStyle}>{shortcut.keystroke}</span>
        <span className={css(styles.definition)}>{shortcut.definition}</span>
      </li>
    );
  };

  return (
    <div className={css(styles.menu)}>
      <div className={css(styles.label)}>
        Keyboard Shortcuts
      </div>
      <a className={css(styles.close)} href="#" onClick={onCloseClick} title="Close menu">
        <FontAwesome name="times-circle" />
        <span className={css(styles.srOnly)}>Close menu</span>
      </a>
      <ul className={css(styles.shortcutsList)}>
        {
          shortcutsList.map((shortcut, index, array) =>
            renderMenuItem(shortcut, index, array)
          )
        }
      </ul>
    </div>
  );
};

ShortcutsMenu.propTypes = {
  onCloseClick: PropTypes.func,
  shortcutsList: PropTypes.array,
  styles: PropTypes.object
};

// TODO: Allow for children with text formatting
//       in definitions using spans, className, etc. (TA)

ShortcutsMenu.defaultProps = {
  shortcutsList: [
    {
      keystroke: 'a',
      definition: 'Set project to Active'
    },
    {
      keystroke: 's',
      definition: 'Set project to Stuck'
    },
    {
      keystroke: 'd',
      definition: 'Set project to Done'
    },
    {
      keystroke: 'f',
      definition: 'Set project to Future'
    }
  ],
};

const keystrokeHeight = '1.5rem';
const styleThunk = () => ({
  menu: {
    backgroundColor: 'rgba(255, 255, 255, .85)',
    bottom: '2rem',
    color: appTheme.palette.dark,
    position: 'fixed',
    right: '2rem'
  },

  label: {
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    margin: '0 0 .75rem',
    paddingLeft: '2.5rem',
    paddingRight: '1.125rem',
    textTransform: 'uppercase'
  },

  close: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s3,
    position: 'absolute',
    right: 0,
    top: 0,

    // NOTE: ':hover' y ':focus' son igualitos
    ':hover': {
      color: appTheme.palette.dark,
      opacity: 0.5
    },
    ':focus': {
      color: appTheme.palette.dark,
      opacity: 0.5
    }
  },

  srOnly: {
    ...srOnly
  },

  shortcutsList: {
    listStyle: 'none',
    margin: 0,
    padding: 0
  },

  shortcutsItem: {
    display: 'block',
    fontSize: 0
  },

  keystroke: {
    backgroundColor: appTheme.palette.mid10l,
    borderColor: appTheme.palette.mid40l,
    borderStyle: 'solid',
    borderWidth: '1px 1px 0',
    color: appTheme.palette.warm,
    display: 'inline-block',
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    lineHeight: keystrokeHeight,
    marginRight: '1rem',
    minWidth: keystrokeHeight,
    textAlign: 'center',
    verticalAlign: 'middle'
  },

  keystrokeIsFirst: {
    borderRadius: '.25rem .25rem 0 0'
  },

  keystrokeIsLast: {
    borderRadius: '0 0 .25rem .25rem',
    borderWidth: '1px'
  },

  definition: {
    borderTop: '1px solid transparent',
    display: 'inline-block',
    fontSize: appTheme.typography.s3,
    lineHeight: keystrokeHeight,
    verticalAlign: 'middle'
  }
});

export default withStyles(styleThunk)(ShortcutsMenu);
