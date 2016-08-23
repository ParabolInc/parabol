import React, {Component, PropTypes} from 'react';
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

@withHotkey
@withRouter
@look
export default class ProgressBar extends Component {
  static propTypes = {
    bindHotkey: PropTypes.func.isRequired,
    clickFactory: PropTypes.func,
    isComplete: PropTypes.bool,
    facilitatorPhaseItem: PropTypes.number, // index of 1
    localPhaseItem: PropTypes.number,       // index of 1
    meetingPhaseItem: PropTypes.number,     // index of 1
    membersCount: PropTypes.number          // members.length
  };

  renderPoints = () => {
    const {membersCount} = this.props;
    const points = [];
    for (let i = 1; i <= membersCount; i++) {
      points.push(this.renderPoint(i));
    }
    return points;
  };
  renderPoint = (idx) => {
    const {clickFactory, membersCount, facilitatorPhaseItem, localPhaseItem, meetingPhaseItem, isComplete} = this.props;
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

    if (idx === membersCount) {
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

  render() {
    const {
      isComplete,
      meetingPhaseItem,
    } = this.props;
    const {bindHotkey, localPhaseItem, clickFactory} = this.props;
    // TODO move to parent component so it doesn't unmount between switches
    const gotoNextItem = clickFactory(localPhaseItem + 1);
    const gotoPrevItem = clickFactory(localPhaseItem - 1);
    bindHotkey(['enter', 'right'], gotoNextItem);
    bindHotkey('left', gotoPrevItem);
    // eslint-disable-next-line max-len
    const barWidth = ((meetingPhaseItem) * blockWidth) - (blockWidth - pointWidth - outerPadding);
    const barStyle = isComplete ? {width: '100%'} : {width: `${barWidth}px`};
    return (
      <div className={s.root}>
        <div className={s.points}>
          {this.renderPoints()}
        </div>
        <div className={s.bar} style={barStyle}></div>
      </div>
    );
  }
}

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
