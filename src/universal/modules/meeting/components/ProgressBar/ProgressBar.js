import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import t from 'universal/styles/theme';
import {srOnly} from 'universal/styles/helpers';

let s = {};

const combineStyles = StyleSheet.combineStyles;

const barHeight = '.375rem';
const pointHeight = barHeight;
const pointWidth = '.5rem';

const ProgressBar = (props) => {
  const {
    isComplete,
    locations,
    onClick,
    teamCount
  } = props;

  // NOTE: All sizing based on:
  //       • Avatar width = 44px
  //       • Point width = 8px
  //       • Gutter between avatars = 24px
  // TODO: Make sizing more flexible in the future (TA)

  const barWidth = `${locations.meeting > 0 ? (locations.meeting * 68) - 42 : 0}px`;

  const barStyle = {
    width: barWidth
  };

  const renderPoint = (index) => {
    let pointStyles;
    const pointStyleOptions = [s.point];

    let marginRight = {
      marginRight: '3.75rem'
    };

    if (index === locations.facilitator - 1) {
      pointStyleOptions.push(s.pointFacilitator);
    } else if (index === locations.local - 1) {
      pointStyleOptions.push(s.pointLocal);
    } else if (index <= locations.meeting - 1 || isComplete) {
      pointStyleOptions.push(s.pointCompleted);
    }

    if (index === teamCount - 1) {
      marginRight = {
        marginRight: 0
      };
    }

    pointStyles = combineStyles.apply(null, pointStyleOptions);

    return (
      <div className={pointStyles} onClick={() => onClick(index)} style={marginRight}>
        <div className={s.srOnly}>{index}</div>
      </div>
    );
  };

  const renderPoints = (count) => {
    const points = [];
    for (let i = 0; i < count; i++) {
      points.push(renderPoint(i, locations, count));
    }
    return points;
  };

  if (isComplete) {
    barStyle.width = '100%';
  }

  return (
    <div className={s.root}>
      <div className={s.points}>
        {renderPoints(teamCount)}
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
    facilitator: 3,
    local: 3,
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
    borderRadius: barHeight,
    display: 'inline-block',
    fontSize: 0,
    height: barHeight,
    position: 'relative',
    width: 'auto'
  },

  bar: {
    backgroundColor: t.palette.cool50l,
    borderRadius: barHeight,
    height: barHeight,
    left: 0,
    position: 'absolute',
    top: 0,
    transition: 'width .2s ease-in',
    zIndex: 200
  },

  points: {
    height: barHeight,
    padding: '0 1.125rem',
    position: 'relative',
    zIndex: 400
  },

  point: {
    backgroundColor: t.palette.dark40l,
    cursor: 'pointer',
    display: 'inline-block',
    height: pointHeight,
    transition: 'scale .2s ease-in',
    width: pointWidth,

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
