import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {commitLocalUpdate} from 'relay-runtime'
import {RetroDiscussionThreadHeader_organization$key} from '~/__generated__/RetroDiscussionThreadHeader_organization.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {PALETTE} from '../styles/paletteV3'
import {Header} from './DiscussionThreadList'
import FlatButton from './FlatButton'

const HeaderWrapper = styled('div')({
  display: 'flex',
  width: '100%'
})

const ButtonHeader = styled(FlatButton)<{isActive?: boolean; hasZoomFlag: boolean}>(
  ({isActive, hasZoomFlag}) => ({
    borderBottom: `1px solid ${PALETTE.SLATE_300}`,
    margin: '0 0 8px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    textTransform: 'none',
    color: PALETTE.SLATE_600,
    fontSize: 12,
    fontWeight: isActive ? 600 : 400,
    lineHeight: '18px',
    userSelect: 'none',
    width: hasZoomFlag ? '50%' : '100%',
    textDecoration: isActive ? 'underline' : 'none',
    borderRadius: 0,
    ':first-child': {
      borderRight: `1px solid ${PALETTE.SLATE_300}`
    }
  })
)

type Props = {
  showTranscription: boolean
  meetingId: string
  organizationRef?: RetroDiscussionThreadHeader_organization$key
}

const RetroDiscussionThreadHeader = (props: Props) => {
  const {showTranscription, meetingId, organizationRef} = props
  const atmosphere = useAtmosphere()

  const organization = useFragment(
    graphql`
      fragment RetroDiscussionThreadHeader_organization on Organization {
        hasZoomFlag: featureFlag(featureName: "zoomTranscription")
      }
    `,
    organizationRef ?? null
  )
  const hasZoomFlag = organization?.hasZoomFlag ?? false

  const handleHeaderClick = (header: 'discussion' | 'transcription') => {
    if (showTranscription && header === 'transcription') return
    if (!showTranscription && header === 'discussion') return
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      if (!meeting) return
      meeting.setValue(!showTranscription, 'showTranscription')
    })
  }

  if (hasZoomFlag) {
    return (
      <HeaderWrapper>
        <ButtonHeader
          onClick={() => handleHeaderClick('discussion')}
          isActive={!showTranscription}
          hasZoomFlag={hasZoomFlag}
        >
          {'Discussion & Tasks'}
        </ButtonHeader>
        <ButtonHeader
          onClick={() => handleHeaderClick('transcription')}
          isActive={showTranscription}
          hasZoomFlag={hasZoomFlag}
        >
          {'Transcription'}
        </ButtonHeader>
      </HeaderWrapper>
    )
  }

  return <Header>{'Discussion & Takeaway Tasks'}</Header>
}

export default RetroDiscussionThreadHeader
