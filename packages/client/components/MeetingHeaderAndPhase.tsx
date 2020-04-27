import styled from '@emotion/styled'
import {Breakpoint} from '~/types/constEnums'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'

const MeetingHeaderAndPhase = styled('div')<{hideBottomBar: boolean}>(({hideBottomBar}) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
  minHeight: 0, // FF68 hack to allow discuss tasks to scroll & facilitatorbar to stay visible when shrinking viewpoint height
  paddingBottom: hideBottomBar ? undefined : 56,
  [makeMinWidthMediaQuery(Breakpoint.SINGLE_REFLECTION_COLUMN)]: {
    paddingBottom: 0
  }
}))

export default MeetingHeaderAndPhase
