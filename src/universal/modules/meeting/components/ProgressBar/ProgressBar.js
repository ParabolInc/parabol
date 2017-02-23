import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme.js';
import {srOnly} from 'universal/styles/helpers';

const barHeight = 8;
const pointHeight = barHeight;
const pointWidth = 8;
const avatarWidth = 44; // 'small' Avatar size
const avatarGutter = 24; // see AvatarGroup
const outerPadding = (avatarWidth - pointWidth) / 2;
const blockWidth = avatarWidth + avatarGutter;
const ProgressBar = (props) => {
  const {
    gotoItem,
    membersCount,
    hoverState: {onMouseEnter},
    facilitatorPhaseItem,
    localPhaseItem,
    meetingPhaseItem,
    isComplete,
    styles
  } = props;
  const renderPoint = (idx) => {
    const marginRight = {
      marginRight: idx === membersCount ? 0 : `${blockWidth - pointWidth}px`
    };
    const pointStyles = css(
      styles.point,
      (idx <= meetingPhaseItem || isComplete) && styles.pointCompleted,
      idx === localPhaseItem && styles.pointLocal,
      idx === facilitatorPhaseItem && styles.pointFacilitator,
      onMouseEnter && styles.pointWithAreaHover
    );
    return (
      <div className={pointStyles} onClick={() => gotoItem(idx)} style={marginRight} key={`pbPoint${idx}`}>
        <div className={css(styles.srOnly)}>{idx}</div>
      </div>
    );
  };
  const renderPoints = () => {
    const points = [];
    for (let i = 1; i <= membersCount; i++) {
      points.push(renderPoint(i));
    }
    return points;
  };

  const barWidth = ((meetingPhaseItem) * blockWidth) - (blockWidth - pointWidth - outerPadding);
  const barStyle = isComplete ? {width: '100%'} : {width: `${barWidth}px`};
  return (
    <div className={css(styles.progressBar)}>
      <div className={css(styles.barBlock)}>
        <div className={css(styles.points)}>
          {renderPoints()}
        </div>
        <div className={css(styles.bar)} style={barStyle}></div>
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  gotoItem: PropTypes.func.isRequired,
  hoverState: PropTypes.object,
  isComplete: PropTypes.bool,
  facilitatorPhaseItem: PropTypes.number,
  localPhaseItem: PropTypes.number,
  meetingPhaseItem: PropTypes.number,
  membersCount: PropTypes.number,
  styles: PropTypes.object
};

const pointHoverBase = {
  borderColor: '#fff',
  borderRadius: '100%'
};

const styleThunk = () => ({
  progressBar: {
    // NOTE: Padding creates larger area for hover states
    padding: '1rem 8rem'
  },

  barBlock: {
    backgroundColor: appTheme.palette.dark10l,
    borderRadius: `${barHeight}px`,
    display: 'inline-block',
    fontSize: 0,
    height: `${barHeight}px`,
    position: 'relative',
    width: 'auto'
  },

  bar: {
    backgroundColor: appTheme.palette.cool50l,
    borderRadius: `${barHeight}px`,
    height: `${barHeight}px`,
    left: 0,
    position: 'absolute',
    top: 0,
    transition: 'width .2s ease-in',
    zIndex: 200
  },

  points: {
    height: `${barHeight}px`,
    padding: `0 ${outerPadding}px`,
    position: 'relative',
    zIndex: 400
  },

  point: {
    backgroundColor: appTheme.palette.dark40l,
    border: '1px solid transparent',
    cursor: 'pointer',
    display: 'inline-block',
    height: `${pointHeight}px`,
    transition: 'scale .2s ease-in',
    width: `${pointWidth}px`,

    ':hover': {
      ...pointHoverBase,
      transform: 'scale(3)'
    }
  },

  pointWithAreaHover: {
    ...pointHoverBase,
    transform: 'scale(2)'
  },

  pointLocal: {
    backgroundColor: appTheme.palette.dark10d
  },

  pointCompleted: {
    backgroundColor: appTheme.palette.cool
  },

  pointFacilitator: {
    backgroundColor: appTheme.palette.warm
  },

  srOnly: {
    ...srOnly
  }
});

export default withStyles(styleThunk)(ProgressBar);
