import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import theme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class ProgressDots extends Component {
  static propTypes = {
    numDots: PropTypes.number.isRequired, // how many total dots shall we draw?
    numCompleted: PropTypes.number,       // how many of the dots are completed?
    currentDot: PropTypes.number,         // which dot (1=first dot) is the user on now?
    onClick: PropTypes.func
  };

  renderDot(idx) {
    let { numCompleted, currentDot } = this.props;
    numCompleted--;
    currentDot--;
    let dotStyle = null;

    const handleClick = (e) => {
      e.preventDefault();
      this.props.onClick(idx + 1);
    };

    if (idx === currentDot) {
      /* we're the active dot */
      dotStyle = combineStyles(styles.progressDot, styles.progressDotCurrent);
    } else {
      if (idx <= numCompleted) {
        /* render a completed dot */
        dotStyle = combineStyles(styles.progressDot, styles.progressDotCompleted);
      } else {
        /* a dot for the future! */
        dotStyle = styles.progressDot;
      }
    }

    return (
      <a
        className={dotStyle}
        href="#"
        key={idx}
        onClick={(e) => handleClick(e)}
      >
        <span className={styles.progressDotLabel}>Step {idx + 1}</span>
      </a>
    );
  }

  render() {
    const {numDots} = this.props;

    return (
      <div className={styles.progressDotGroup}>
        {(() => {
          const dots = [];
          for (let i = 0; i < numDots; i++) {
            dots.push(this.renderDot(i));
          }
          return dots;
        })()}
      </div>
    );
  }
}

styles = StyleSheet.create({
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
    border: `2px solid ${theme.palette.mid50l}`,
    borderRadius: '100%',
    cursor: 'default',
    display: 'inline-block',
    height: '1rem',
    margin: '0 .375rem',
    width: '1rem'
  },

  progressDotCompleted: {
    backgroundColor: theme.palette.mid50l,
    cursor: 'pointer'
  },

  progressDotCurrent: {
    backgroundColor: theme.palette.warm,
    borderColor: theme.palette.warm
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
