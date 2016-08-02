import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import t from 'universal/styles/theme';
import {srOnly} from 'universal/styles/helpers';

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
    isComplete,
    locations,
    onClick,
    teamCount
  } = props;

  const {facilitator, local, meeting} = locations;

  const barWidth = meeting > 0 ? (meeting * blockWidth) - (blockWidth - pointWidth - outerPadding) : 0;
  const barStyle = isComplete ? {width: '100%'} : {width: `${barWidth}px`};

  const renderPoint = (index) => {
    let pointStyles;
    const pointStyleVariant = [s.point];

    let marginRight = {
      marginRight: `${blockWidth - pointWidth}px`
    };

    if (index === facilitator - 1) {
      pointStyleVariant.push(s.pointFacilitator);
    } else if (index === local - 1) {
      pointStyleVariant.push(s.pointLocal);
    } else if (index <= meeting - 1 || isComplete) {
      pointStyleVariant.push(s.pointCompleted);
    }

    if (index === teamCount - 1) {
      marginRight = {
        marginRight: 0
      };
    }

    pointStyles = combineStyles.apply(null, pointStyleVariant);

    return (
      <div className={pointStyles} onClick={() => onClick(index)} style={marginRight}>
        <div className={s.srOnly}>{index}</div>
      </div>
    );
  };

  const renderPoints = () => {
    const points = [];
    for (let i = 0; i < teamCount; i++) {
      points.push(renderPoint(i));
    }
    return points;
  };

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
  isComplete: PropTypes.bool,
  locations: PropTypes.object,
  onClick: PropTypes.func,
  teamCount: PropTypes.number
};

ProgressBar.defaultProps = {
  isComplete: false, // state for 100% progress
  locations: {
    facilitator: 5,
    local: 2,
    meeting: 3
  },
  onClick(index) {
    console.log(`ProgressBar.onClick() index: ${index}`);
  },
  teamCount: 5
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

export default look(ProgressBar);
