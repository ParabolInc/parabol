import {createVerticalStrength} from 'react-dnd-scrollzone';

const linearVerticalStrength = createVerticalStrength(150);

const ease = (val) => {
  const t = (val + 1) / 2; // [-1, 1] -> [0, 1]
  // ease-in-out quadratic
  const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  return easedT * 2 - 1; // [0, 1] -> [-1, 1]
};

const verticalStrengthScroll = (box, point) => ease(linearVerticalStrength(box, point));

export default verticalStrengthScroll;
