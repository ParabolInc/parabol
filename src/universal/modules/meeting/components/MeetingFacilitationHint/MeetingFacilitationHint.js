import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import Ellipsis from 'universal/components/Ellipsis/Ellipsis';
import Type from 'universal/components/Type/Type';

const MeetingFacilitationHint = (props) => {
  const {
    children,
    styles
  } = props;
  return (
    <div className={css(styles.facilitationHint)}>
      <Type align="center" scale="s4" colorPalette="mid">
        {children}<Ellipsis />
      </Type>
    </div>
  );
};

MeetingFacilitationHint.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object
};

const styleThunk = () => ({
  facilitationHint: {
    backgroundColor: appTheme.palette.mid10l,
    borderRadius: '.25rem',
    display: 'inline-block',
    padding: '.3125rem 1rem .375rem'
  }
});

export default withStyles(styleThunk)(MeetingFacilitationHint);
