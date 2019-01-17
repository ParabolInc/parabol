import styled from 'react-emotion'

const DelayUnmountShrinkAndScale = styled('div')(
  ({isExiting, duration}: {isExiting: boolean; duration: number}) => ({
    height: isExiting ? 0 : '100%',
    opacity: isExiting ? 0 : 1,
    overflow: 'hidden',
    transform: isExiting ? 'scale(0)' : 'scale(1)',
    transition: `all ${duration}ms`
  })
)

export default DelayUnmountShrinkAndScale
