import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import Ellipsis from 'universal/components/Ellipsis/Ellipsis';

const MeetingFacilitationHint = (props) => {
  const {
    children,
    showEllipsis,
    showParens,
    styles
  } = props;
  const ellipsis = showEllipsis && <Ellipsis />;
  return (
    <div className={css(styles.facilitationHint)}>
      {showParens && '('}
      {children}
      {ellipsis}
      {showParens && ')'}
    </div>
  );
};

MeetingFacilitationHint.propTypes = {
  children: PropTypes.any,
  showEllipsis: PropTypes.bool,
  showParens: PropTypes.bool,
  styles: PropTypes.object
};

MeetingFacilitationHint.defaultProps = {
  showEllipsis: true,
  showParens: true
};

const styleThunk = () => ({
  facilitationHint: {
    // backgroundColor: appTheme.palette.mid10l,
    // borderRadius: '.25rem',
    color: appTheme.palette.dark60a,
    display: 'inline-block',
    fontSize: appTheme.typography.s2,
    lineHeight: appTheme.typography.s5,
    textAlign: 'center'
  }
});

export default withStyles(styleThunk)(MeetingFacilitationHint);
