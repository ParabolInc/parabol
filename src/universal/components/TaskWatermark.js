import {css} from 'aphrodite-local-styles/no-important';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {GITHUB} from 'universal/utils/constants';
import PropTypes from 'prop-types';

const iconLookup = {
  [GITHUB]: 'github'
};

const TaskWatermark = (props) => {
  const {service, styles} = props;
  const iconName = iconLookup[service];
  if (!iconName) return null;
  return (
    <div className={css(styles.watermarkBlock)}>
      <FontAwesome name={iconName} className={css(styles.watermark)} />
    </div>
  );
};

TaskWatermark.propTypes = {
  service: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  watermarkBlock: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    textAlign: 'center',
    top: 0,
    verticalAlign: 'middle',
    zIndex: ui.ziMenu - 2
  },

  watermark: {
    bottom: 0,
    color: ui.palette.dark,
    fontSize: '7rem !important',
    lineHeight: '8rem !important',
    height: '8rem',
    margin: 'auto -1.5rem -1.5rem auto',
    opacity: 0.20,
    position: 'absolute',
    right: 0,
    width: '8rem'
  }
});

export default withStyles(styleThunk)(TaskWatermark);
