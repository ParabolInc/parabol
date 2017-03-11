import React, {PropTypes} from 'react';
import FontAwesome from 'react-fontawesome';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import makeHoverFocus from 'universal/styles/helpers/makeHoverFocus';

const inlineBlock = {
  display: 'inline-block',
  height: ui.dashSectionHeaderLineHeight,
  lineHeight: ui.dashSectionHeaderLineHeight,
  verticalAlign: 'top'
};

const inlineBlockTop = {
  ...inlineBlock,
  cursor: 'pointer',
  userSelect: 'none',
  verticalAlign: 'top'
};

const DashFilterToggle = (props) => {
  const {label, styles, onClick} = props;
  return (
    <button
      className={css(styles.button)}
      onClick={onClick}
      title={`Filter by ${label}`}
    >
      <div style={{...inlineBlockTop, marginRight: '.25rem'}}>{label}</div>
      <FontAwesome name="chevron-circle-down" style={inlineBlockTop}/>
    </button>
  );
};

DashFilterToggle.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func,
  styles: PropTypes.object
};

const styleThunk = () => ({
  button: {
    ...inlineBlock,
    appearance: 'none',
    backgroundColor: 'transparent',
    border: 0,
    boxShadow: 'none',
    color: appTheme.palette.mid,
    fontFamily: appTheme.typography.sansSerif,
    fontSize: appTheme.typography.s3,
    margin: '0 0 0 .5rem',
    outline: 0,
    padding: 0,

    ...makeHoverFocus({
      color: appTheme.palette.dark,
    }),

    ':hover > div': {
      textDecoration: 'underline'
    },
    ':focus > div': {
      textDecoration: 'underline'
    }
  }
});

export default withStyles(styleThunk)(DashFilterToggle);
