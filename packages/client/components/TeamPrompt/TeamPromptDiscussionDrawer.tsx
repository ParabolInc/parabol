import styled from '@emotion/styled'
import {Close} from '@mui/icons-material'
import {JSONContent} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import AddReactjiToReactableMutation from '~/mutations/AddReactjiToReactableMutation'
import ReactjiId from '~/shared/gqlIds/ReactjiId'
import findStageById from '~/utils/meetings/findStageById'
import {TeamPromptDiscussionDrawer_meeting$key} from '~/__generated__/TeamPromptDiscussionDrawer_meeting.graphql'
import {desktopSidebarShadow} from '../../styles/elevation'
import {PALETTE} from '../../styles/paletteV3'
import {BezierCurve, DiscussionThreadEnum, ZIndex} from '../../types/constEnums'
import Avatar from '../Avatar/Avatar'
import DiscussionThreadRoot from '../DiscussionThreadRoot'
import PlainButton from '../PlainButton/PlainButton'
import PromptResponseEditor from '../promptResponse/PromptResponseEditor'
import ReactjiSection from '../ReflectionCard/ReactjiSection'
import ResponsiveDashSidebar from '../ResponsiveDashSidebar'
import TeamPromptLastUpdatedTime from './TeamPromptLastUpdatedTime'
import {TeamMemberName} from './TeamPromptResponseCard'

const Drawer = styled('div')<{isDesktop: boolean; isOpen: boolean}>(({isDesktop, isOpen}) => ({
  boxShadow: isDesktop ? desktopSidebarShadow : undefined,
  backgroundColor: '#FFFFFF',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'stretch',
  overflow: 'hidden',
  position: isDesktop ? 'fixed' : 'static',
  bottom: 0,
  top: 0,
  right: isDesktop ? 0 : undefined,
  transition: `all 200ms ${BezierCurve.DECELERATE}`,
  userSelect: 'none',
  transform: `translateX(${isOpen ? 0 : DiscussionThreadEnum.WIDTH}px)`,
  width: DiscussionThreadEnum.WIDTH,
  zIndex: ZIndex.SIDEBAR,
  height: '100%',
  '@supports (height: 1svh) and (height: 1lvh)': {
    height: isDesktop ? '100lvh' : '100svh'
  }
}))

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
  padding: '8px 8px 8px 12px',
  width: '100%'
})

const Header = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  flexDirection: 'row',
  alignItems: 'center',
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

interface Props {
  meetingRef: TeamPromptDiscussionDrawer_meeting$key
  isDesktop: boolean
}

const TeamPromptDiscussionDrawer = ({meetingRef, isDesktop}: Props) => {
  const {t} = useTranslation()

  const meeting = useFragment(
    graphql`
      fragment TeamPromptDiscussionDrawer_meeting on TeamPromptMeeting {
        localStageId
        isRightDrawerOpen
        id
        phases {
          stages {
            id
            ... on TeamPromptResponseStage {
              discussionId
              teamMember {
                picture
                preferredName
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

  const {localStageId, id: meetingId, isRightDrawerOpen} = meeting
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

  const onToggleDrawer = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      if (!meeting) return
      const isRightDrawerOpen = meeting.getValue('isRightDrawerOpen')
      meeting.setValue(!isRightDrawerOpen, 'isRightDrawerOpen')
    })
  }

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
    <ResponsiveDashSidebar
      isOpen={isRightDrawerOpen}
      isRightDrawer
      onToggle={onToggleDrawer}
      sidebarWidth={DiscussionThreadEnum.WIDTH}
    >
      <Drawer isDesktop={isDesktop} isOpen={isRightDrawerOpen}>
        <DiscussionResponseCard>
          <Header>
            <Avatar picture={teamMember.picture} size={48} />
            <TeamMemberName>
              {teamMember.preferredName}
              {response && (
                <TeamPromptLastUpdatedTime
                  updatedAt={response.updatedAt}
                  createdAt={response.createdAt}
                />
              )}
            </TeamMemberName>
            <StyledCloseButton onClick={onToggleDrawer}>
              <CloseIcon />
            </StyledCloseButton>
          </Header>
        </DiscussionResponseCard>
        <ThreadColumn>
          <DiscussionThreadRoot
            discussionId={discussionId}
            allowedThreadables={['comment', 'task']}
            width={t('TeamPromptDiscussionDrawer.100')}
            header={
              <DiscussionHeaderWrapper>
                <PromptResponseEditor content={contentJSON} readOnly={true} />
                <StyledReactjis reactjis={reactjis} onToggle={onToggleReactji} />
              </DiscussionHeaderWrapper>
            }
          />
        </ThreadColumn>
      </Drawer>
    </ResponsiveDashSidebar>
  )
}

export default TeamPromptDiscussionDrawer
