import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import t from 'universal/styles/theme';
import {srOnly} from 'universal/styles/helpers';
import {withRouter} from 'react-router';
import withHotkey from 'react-hotkey-hoc';

let s = {};
const combineStyles = StyleSheet.combineStyles;

const barHeight = 6;
const pointHeight = barHeight;
const pointWidth = 8;
const avatarWidth = 44; // 'small' Avatar size
const avatarGutter = 24; // see AvatarGroup
const outerPadding = (avatarWidth - pointWidth) / 2;
const blockWidth = avatarWidth + avatarGutter;

const ProgressBar = (props) => {
  const {
    bindHotkey,
    isComplete,
    facilitatorPhaseItem,
    localPhaseItem,
    meetingPhaseItem,
    clickFactory,
    membersCount
  } = props;
  // eslint-disable-next-line max-len
  const barWidth = ((meetingPhaseItem + 1) * blockWidth) - (blockWidth - pointWidth - outerPadding);
  const barStyle = isComplete ? {width: '100%'} : {width: `${barWidth}px`};

  const renderPoint = (idx) => {
    let pointStyles;
    const pointStyleVariant = [s.point];

    let marginRight = {
      marginRight: `${blockWidth - pointWidth}px`
    };

    if (idx === facilitatorPhaseItem) {
      pointStyleVariant.push(s.pointFacilitator);
    } else if (idx === localPhaseItem) {
      pointStyleVariant.push(s.pointLocal);
    } else if (idx <= meetingPhaseItem || isComplete) {
      pointStyleVariant.push(s.pointCompleted);
    }

    if (idx === membersCount - 1) {
      marginRight = {
        marginRight: 0
      };
    }

    pointStyles = combineStyles.apply(null, pointStyleVariant);

    const handleOnClick = clickFactory(idx);
    return (
      <div className={pointStyles} onClick={handleOnClick} style={marginRight} key={`pbPoint${idx}`}>
        <div className={s.srOnly}>{idx}</div>
      </div>
    );
  };

  const renderPoints = () => {
    const points = [];
    for (let i = 0; i < membersCount; i++) {
      points.push(renderPoint(i));
    }
    return points;
  };
  const gotoNextItem = clickFactory(localPhaseItem + 1);
  const gotoPrevItem = clickFactory(localPhaseItem - 1);
  bindHotkey(['enter', 'right'], gotoNextItem);
  bindHotkey('left', gotoPrevItem);
  return (
    <div className={s.root}>
      <div className={s.points}>
        {renderPoints()}
      </div>
      <div className={s.bar} style={barStyle}></div>
    </div>
  );
};

ProgressBar.propTypes = {
  clickFactory: PropTypes.func,
  isComplete: PropTypes.bool,
  facilitatorPhaseItem: PropTypes.number, // index of 0
  localPhaseItem: PropTypes.number,       // index of 0
  meetingPhaseItem: PropTypes.number,     // index of 0
  membersCount: PropTypes.number          // not 0 indexed
};

ProgressBar.defaultProps = {
  clickFactory() {
    return () =>
      console.log('ProgressBar');
  },
  isComplete: false, // state for 100% progress
  facilitatorPhaseItem: 4,
  localPhaseItem: 2,
  meetingPhaseItem: 0,
  membersCount: 5
};

s = StyleSheet.create({
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

export default withHotkey(withRouter(look(ProgressBar)));
