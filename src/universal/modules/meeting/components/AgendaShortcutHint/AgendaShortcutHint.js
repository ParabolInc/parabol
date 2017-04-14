import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';

const inlineBlock = {
  display: 'inline-block',
  height: '1.75rem',
  lineHeight: '1.75rem',
  verticalAlign: 'top'
};

const AgendaShortcutHint = (props) => {
  const {styles} = props;
  return (
    <div className={css(styles.link)}>
      <span className={css(styles.icon)}>
        <FontAwesome
          name="lightbulb-o"
          style={inlineBlock}
        />
      </span>
      <span className={css(styles.linkText)}>Press “<b>+</b>” to add an agenda item to the left column.</span>
    </div>
  );
};

AgendaShortcutHint.propTypes = {
  styles: PropTypes.object
};

const styleThunk = () => ({
  link: {
    backgroundColor: appTheme.palette.light50l,
    borderRadius: '.375rem',
    color: appTheme.palette.dark,
    display: 'block',
    fontSize: 0,
    lineHeight: '1.75rem',
    margin: '0 auto',
    padding: '.625rem 1rem',
    textAlign: 'center',
    textDecoration: 'none !important',
  },

  linkText: {
    ...inlineBlock,
    ...textOverflow,
    fontSize: appTheme.typography.s6
  },

  icon: {
    ...inlineBlock,
    fontSize: ui.iconSize2x,
    marginRight: '.75rem'
  }
});

export default withStyles(styleThunk)(AgendaShortcutHint);
