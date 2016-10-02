import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import appTheme from 'universal/styles/theme/appTheme';

const ProgressDots = (props) => {
  const renderDot = (idx) => {
    // TODO mutative prop sinner!
    let {numCompleted, currentDot} = props;
    numCompleted--;
    currentDot--;

    const handleClick = (e) => {
      e.preventDefault();
      this.props.onClick(idx + 1);
    };

    const dotStyle = css(
      styles.progressDot,
      idx=== currentDot && styles.progressDotCurrent,
      idx <= numCompleted && styles.progressDotCompleted
    );

    return (
      <a
        className={dotStyle}
        href="#"
        key={idx}
        onClick={handleClick}
      >
        <span className={styles.progressDotLabel}>Step {idx + 1}</span>
      </a>
    );
  };
  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < props.numDots; i++) {
      dots[i] = renderDot(i);
    }
    return dots;
  };
  return (
    <div className={css(styles.progressDotGroup)}>
      {renderDots()}
    </div>
  );
};

ProgressDots.propTypes = {
  numDots: PropTypes.number.isRequired, // how many total dots shall we draw?
  numCompleted: PropTypes.number,       // how many of the dots are completed?
  currentDot: PropTypes.number,         // which dot (1=first dot) is the user on now?
  onClick: PropTypes.func
};

const styleThunk = () => ({
  progressDotGroup: {
    fontSize: 0,
    left: '0',
    position: 'absolute',
    textAlign: 'center',
    top: '-9px', // height/2 + borderHeight/2
    width: '100%'
  },

  progressDot: {
    backgroundColor: '#fff',
    border: `2px solid ${appTheme.palette.mid50l}`,
    borderRadius: '100%',
    cursor: 'default',
    display: 'inline-block',
    height: '1rem',
    margin: '0 .375rem',
    width: '1rem'
  },

  progressDotCompleted: {
    backgroundColor: appTheme.palette.mid50l,
    cursor: 'pointer'
  },

  progressDotCurrent: {
    backgroundColor: appTheme.palette.warm,
    borderColor: appTheme.palette.warm
  },

  progressDotLabel: {
    border: 0,
    clip: 'rect(0, 0, 0, 0)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    width: '1px'
  }
});

export default withStyles(styleThunk)(ProgressDots);
