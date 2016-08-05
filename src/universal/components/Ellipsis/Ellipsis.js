import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

const combineStyles = StyleSheet.combineStyles;

let s = {};
let keyframesOpacity = {};

const Ellipsis = (props) => {
  const {
    isAnimated
  } = props;

  let dotStyles1 = s.dot;
  let dotStyles2 = s.dot;
  let dotStyles3 = s.dot;

  if (isAnimated) {
    dotStyles1 = combineStyles(s.dotAnimated, s.dot1);
    dotStyles2 = combineStyles(s.dotAnimated, s.dot2);
    dotStyles3 = combineStyles(s.dotAnimated, s.dot3);
  }

  return (
    <div className={s.root}>
      {isAnimated ?
        <span>
          <span className={dotStyles1}>.</span>
          <span className={dotStyles2}>.</span>
          <span className={dotStyles3}>.</span>
        </span> :
        <span>…</span>
      }
    </div>
  );
};

Ellipsis.propTypes = {
  isAnimated: PropTypes.bool
};

Ellipsis.defaultProps = {
  isAnimated: true
};

keyframesOpacity = StyleSheet.keyframes({
  '0%': {
    opacity: '1'
  },
  '100%': {
    opacity: '.25'
  }
});

s = StyleSheet.create({
  root: {
    display: 'inline'
  },

  dot: {
    display: 'inline'
  },

  dotAnimated: {
    animationDuration: '.8s',
    animationIterationCount: 'infinite',
    animationName: keyframesOpacity,
    display: 'inline-block',
    fontSize: '1.2em',
    fontWeight: 700,
    lineHeight: 'inherit',
    verticalAlign: 'baseline'
  },

  dot1: {
    animationDelay: '0ms',
  },

  dot2: {
    animationDelay: '200ms',
  },

  dot3: {
    animationDelay: '400ms',
  }
});

export default look(Ellipsis);
