import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import t from 'universal/styles/theme';
import {srOnly} from 'universal/styles/helpers';

const cs = StyleSheet.combineStyles;
const keystrokeHeight = '1.5rem';

let s = {};

const ShortcutsMenu = (props) => {
  const renderMenuItem = (shortcut, index, array) => {
    let keystrokeStyle = null;

    if (index === 0) {
      keystrokeStyle = cs(s.keystroke, s.keystrokeIsFirst);
    } else if (index === array.length - 1) {
      keystrokeStyle = cs(s.keystroke, s.keystrokeIsLast);
    } else {
      keystrokeStyle = s.keystroke;
    }

    return (
      <li className={s.shortcutsItem} key={index}>
        <span className={keystrokeStyle}>{shortcut.keystroke}</span>
        <span className={s.definition}>{shortcut.definition}</span>
      </li>
    );
  };

  const {shortcutsList, onCloseClick} = props;

  const handleCloseClick = (e) => {
    e.preventDefault();
    onCloseClick();
  };

  return (
    <div className={s.menu}>
      <div className={s.label}>
        Keyboard Shortcuts
      </div>
      <a className={s.close} href="#" onClick={(e) => handleCloseClick(e)} title="Close menu">
        <FontAwesome name="times-circle" />
        <span className={s.closeLabel}>Close menu</span>
      </a>
      <ul className={s.shortcutsList}>
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
  shortcutsList: PropTypes.array,
  onCloseClick: PropTypes.func
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
  onCloseClick() {
    console.log('ShortcutsMenu onCloseClick()');
  }
};

s = StyleSheet.create({
  menu: {
    bottom: '2rem',
    color: t.palette.dark,
    position: 'fixed',
    right: '2rem'
  },

  label: {
    fontSize: t.typography.s2,
    fontWeight: 700,
    margin: '0 0 .75rem',
    paddingLeft: '2.5rem',
    paddingRight: '1.125rem',
    textTransform: 'uppercase'
  },

  close: {
    color: t.palette.dark,
    fontSize: t.typography.s3,
    position: 'absolute',
    right: 0,
    top: 0,

    // NOTE: ':hover' y ':focus' son igualitos
    ':hover': {
      color: t.palette.dark,
      opacity: 0.5
    },
    ':focus': {
      color: t.palette.dark,
      opacity: 0.5
    }
  },

  closeLabel: {
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
    backgroundColor: t.palette.mid10l,
    borderColor: t.palette.mid40l,
    borderStyle: 'solid',
    borderWidth: '1px 1px 0',
    color: t.palette.warm,
    display: 'inline-block',
    fontSize: t.typography.s3,
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
    fontSize: t.typography.s3,
    lineHeight: keystrokeHeight,
    verticalAlign: 'middle'
  }
});

export default look(ShortcutsMenu);
