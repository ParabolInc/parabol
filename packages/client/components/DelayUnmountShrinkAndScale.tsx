import styled from '@emotion/styled'

const DelayUnmountShrinkAndScale = styled('div')<{isExiting: boolean; duration: number}>(
  ({isExiting, duration}) => ({
    // height 'auto' instead of '100%' to honor vertical margins of contained component
    height: isExiting ? 0 : 'auto',
    opacity: isExiting ? 0 : 1,
    // hidden means no box shadow
    // overflow: 'hidden',
    transform: isExiting ? 'scale(0)' : 'scale(1)',
    transition: `all ${duration}ms`
  })
)

export default DelayUnmountShrinkAndScale
