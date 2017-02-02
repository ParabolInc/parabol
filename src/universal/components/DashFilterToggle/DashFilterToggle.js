import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import FontAwesome from 'react-fontawesome';

const inlineBlock = {
  display: 'inline-block',
  height: ui.dashSectionHeaderLineHeight,
  lineHeight: ui.dashSectionHeaderLineHeight,
  verticalAlign: 'middle'
};

const DashFilterToggle = (props) => {
  const {label, styles, onClick} = props;
  return (
    <div
      className={css(styles.button)}
      onClick={onClick}
      title={`Filter by ${label}`}
    >
      <span className={css(styles.inlineBlockTop)}>{label}</span>
      <FontAwesome name="chevron-circle-down" className={css(styles.inlineBlockTop)}/>
    </div>
  );
};

DashFilterToggle.propTypes = {
  label: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  button: {
    ...inlineBlock,
    color: appTheme.palette.mid,

    ':hover': {
      color: appTheme.palette.dark
    },
    ':focus': {
      color: appTheme.palette.dark
    }
  },
  inlineBlockTop: {
    ...inlineBlock,
    cursor: 'pointer',
    userSelect: 'none',
    verticalAlign: 'top'
  }
});

export default withStyles(styleThunk)(DashFilterToggle);
