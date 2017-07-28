import {css} from 'aphrodite-local-styles/no-important';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import withStyles from 'universal/styles/withStyles';
import ui from 'universal/styles/ui';

const ProjectWatermark = (props) => {
  const {service, styles} = props;
  if (!service) return null;
  return (
    <div className={css(styles.watermarkBlock)}>
      <FontAwesome name="github" className={css(styles.watermark)} />
    </div>
  );
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
    fontSize: '7rem',
    height: '8rem',
    lineHeight: '8rem',
    margin: 'auto -1.5rem -1.5rem auto',
    opacity: 0.12,
    position: 'absolute',
    right: 0,
    width: '8rem'
  }
});

export default withStyles(styleThunk)(ProjectWatermark);
