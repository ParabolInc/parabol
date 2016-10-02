import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import t from 'universal/styles/theme';
import {srOnly} from 'universal/styles/helpers';
import {withRouter} from 'react-router';
import withHotkey from 'react-hotkey-hoc';

const ProgressBar = (props) => {
  const {bindHotkey, clickFactory, membersCount, facilitatorPhaseItem, localPhaseItem, meetingPhaseItem, isComplete, styles} = props;
  const renderPoint = (idx) => {
    const marginRight = {
      marginRight: idx === membersCount ? 0 : `${blockWidth - pointWidth}px`
    };
    const pointStyles = css(
      styles.point,
      idx === facilitatorPhaseItem && styles.pointFacilitator,
      idx === localPhaseItem && styles.pointLocal,
      // TODO fix this one!
      (idx <= meetingPhaseItem || isComplete) && styles.pointCompleted
    );

    const handleOnClick = clickFactory(idx);
    return (
      <div className={pointStyles} onClick={handleOnClick} style={marginRight} key={`pbPoint${idx}`}>
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

  // TODO move to parent component so it doesn't unmount between switches
  const gotoNextItem = clickFactory(localPhaseItem + 1);
  const gotoPrevItem = clickFactory(localPhaseItem - 1);
  bindHotkey(['enter', 'right'], gotoNextItem);
  bindHotkey('left', gotoPrevItem);
  const barWidth = ((meetingPhaseItem) * blockWidth) - (blockWidth - pointWidth - outerPadding);
  const barStyle = isComplete ? {width: '100%'} : {width: `${barWidth}px`};
  return (
    <div className={css(styles.root)}>
      <div className={css(styles.points)}>
        {renderPoints()}
      </div>
      <div className={css(styles.bar)} style={barStyle}></div>
    </div>
  );
};

ProgressBar.propTypes = {
  bindHotkey: PropTypes.func.isRequired,
  clickFactory: PropTypes.func,
  isComplete: PropTypes.bool,
  facilitatorPhaseItem: PropTypes.number, // index of 1
  localPhaseItem: PropTypes.number,       // index of 1
  meetingPhaseItem: PropTypes.number,     // index of 1
  membersCount: PropTypes.number          // members.length
};

const barHeight = 6;
const pointHeight = barHeight;
const pointWidth = 8;
const avatarWidth = 44; // 'small' Avatar size
const avatarGutter = 24; // see AvatarGroup
const outerPadding = (avatarWidth - pointWidth) / 2;
const blockWidth = avatarWidth + avatarGutter;

const styleThunk = () => ({
  root: {
    backgroundColor: t.palette.dark10l,
    borderRadius: `${barHeight}px`,
    display: 'inline-block',
    fontSize: 0,
    height: `${barHeight}px`,
    position: 'relative',
    width: 'auto'
  },

  bar: {
    backgroundColor: t.palette.cool50l,
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
    backgroundColor: t.palette.dark40l,
    cursor: 'pointer',
    display: 'inline-block',
    height: `${pointHeight}px`,
    transition: 'scale .2s ease-in',
    width: `${pointWidth}px`,

    ':hover': {
      transform: 'scale(2)'
    },
    ':focus': {
      transform: 'scale(2)'
    }
  },

  pointLocal: {
    backgroundColor: t.palette.dark10d
  },

  pointCompleted: {
    backgroundColor: t.palette.cool
  },

  pointFacilitator: {
    backgroundColor: t.palette.warm
  },

  srOnly: {
    ...srOnly
  }
});

export default withHotkey(
  withRouter(
    withStyles(styleThunk)(ProgressBar)
  )
);
