import styled from '@emotion/styled'
import {Close} from '@mui/icons-material'
import {JSONContent} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {TeamPromptDiscussionDrawer_meeting$key} from '~/__generated__/TeamPromptDiscussionDrawer_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import AddReactjiToReactableMutation from '~/mutations/AddReactjiToReactableMutation'
import ReactjiId from '~/shared/gqlIds/ReactjiId'
import findStageById from '~/utils/meetings/findStageById'
import {PALETTE} from '../../styles/paletteV3'
import Avatar from '../Avatar/Avatar'
import DiscussionThreadRoot from '../DiscussionThreadRoot'
import PlainButton from '../PlainButton/PlainButton'
import ReactjiSection from '../ReflectionCard/ReactjiSection'
import PromptResponseEditor from '../promptResponse/PromptResponseEditor'
import TeamPromptLastUpdatedTime from './TeamPromptLastUpdatedTime'

const ThreadColumn = styled('div')({
  alignItems: 'center',
  bottom: 0,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'flex-end',
  maxWidth: 700,
  overflow: 'auto',
  position: 'relative',
  width: '100%'
})

const CloseIcon = styled(Close)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.5
  }
})

const DiscussionResponseCard = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '16px 8px 8px 12px',
  width: '100%'
})

const Header = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  flexDirection: 'row',
  padding: '0 8px'
})

const StyledCloseButton = styled(PlainButton)({
  height: 24,
  marginLeft: 'auto'
})

const StyledReactjis = styled(ReactjiSection)({
  paddingTop: '16px'
})

const DiscussionHeaderWrapper = styled('div')({
  padding: '0px 12px 20px 12px'
})

const TeamMemberName = styled('h3')({
  padding: '0 8px',
  margin: 0
})

interface Props {
  meetingRef: TeamPromptDiscussionDrawer_meeting$key
  onToggleDrawer: () => void
}

const TeamPromptDiscussionDrawer = ({meetingRef, onToggleDrawer}: Props) => {
  const meeting = useFragment(
    graphql`
      fragment TeamPromptDiscussionDrawer_meeting on TeamPromptMeeting {
        localStageId
        id
        phases {
          stages {
            id
            ... on TeamPromptResponseStage {
              discussionId
              teamMember {
                user {
                  picture
                  preferredName
                }
              }
              response {
                id
                content
                updatedAt
                createdAt
                reactjis {
                  ...ReactjiSection_reactjis
                  id
                  isViewerReactji
                }
              }
            }
          }
        }
      }
    `,
    meetingRef
  )

  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitMutation, submitting} = useMutationProps()

  const {localStageId, id: meetingId} = meeting
  if (!localStageId) {
    return null
  }

  const stage = findStageById(meeting.phases, localStageId)
  if (!stage) {
    return null
  }

  const {discussionId, teamMember, response} = stage.stage
  if (!discussionId || !teamMember) {
    return null
  }
  const {user} = teamMember
  const {picture, preferredName} = user

  const onToggleReactji = (emojiId: string) => {
    if (submitting || !reactjis || !response) return
    const isRemove = !!reactjis.find((reactji) => {
      return reactji.isViewerReactji && ReactjiId.split(reactji.id).name === emojiId
    })
    submitMutation()
    AddReactjiToReactableMutation(
      atmosphere,
      {
        reactableId: response?.id,
        reactableType: 'RESPONSE',
        isRemove,
        reactji: emojiId,
        meetingId
      },
      {onCompleted, onError}
    )
  }

  const contentJSON: JSONContent | null = response ? JSON.parse(response.content) : null
  const reactjis = response?.reactjis ?? []

  return (
    <>
      <DiscussionResponseCard>
        <Header>
          <div className='flex items-center'>
            <Avatar picture={picture} className={'h-12 w-12'} />
            <TeamMemberName>
              {preferredName}
              {response && (
                <TeamPromptLastUpdatedTime
                  updatedAt={response.updatedAt}
                  createdAt={response.createdAt}
                />
              )}
            </TeamMemberName>
          </div>
          <StyledCloseButton onClick={onToggleDrawer}>
            <CloseIcon />
          </StyledCloseButton>
        </Header>
      </DiscussionResponseCard>
      <ThreadColumn>
        <DiscussionThreadRoot
          discussionId={discussionId}
          allowedThreadables={['comment', 'task']}
          width={'100%'}
          header={
            <DiscussionHeaderWrapper>
              <PromptResponseEditor content={contentJSON} readOnly={true} teamId='' />
              <StyledReactjis key={localStageId} reactjis={reactjis} onToggle={onToggleReactji} />
            </DiscussionHeaderWrapper>
          }
        />
      </ThreadColumn>
    </>
  )
}

export default TeamPromptDiscussionDrawer
