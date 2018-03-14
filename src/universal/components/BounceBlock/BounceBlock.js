import styled, {keyframes} from 'react-emotion';

const BounceKeyframes = keyframes`
  from, 10%, 26%, 40%, to {
    transform: translate3d(0, 0, 0);
  }

  20%, 22% {
    transform: translate3d(0, -1rem, 0);
  }

  35% {
    transform: translate3d(0, -.5rem, 0);
  }

  45% {
    transform: translate3d(0, -.25rem, 0);
  }
`;

const BounceBlock = styled('div')(({animationDelay}) => ({
  animation: `${BounceKeyframes} 2s ease infinite`,
  animationDelay,
  transformOrigin: 'center bottom'
}));

export default BounceBlock;
