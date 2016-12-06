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

const inlineBlockTop = {
  ...inlineBlock,
  verticalAlign: 'top'
};

const DashFilterToggle = (props) => {
  const {toggleLabel, styles} = props;
  return (
    <div className={css(styles.button)} title={`Filter by ${toggleLabel}`}>
      <span style={inlineBlockTop}>{toggleLabel}</span> <
      FontAwesome name="chevron-circle-down" style={inlineBlockTop}
      />
    </div>
  );
};

DashFilterToggle.propTypes = {
  toggleLabel: PropTypes.string,
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
  }
});

export default withStyles(styleThunk)(DashFilterToggle);
