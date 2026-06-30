import type {JSONContent} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {TeamPromptDrawer_meeting$key} from '~/__generated__/TeamPromptDrawer_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import AddReactjiToReactableMutation from '../../mutations/AddReactjiToReactableMutation'
import ReactjiId from '../../shared/gqlIds/ReactjiId'
import {DiscussionThreadEnum} from '../../types/constEnums'
import findStageById from '../../utils/meetings/findStageById'
import DiscussionDrawer from '../DiscussionDrawer'
import ResponsiveDashSidebar from '../ResponsiveDashSidebar'
import TeamPromptDiscussionThreadHeader from './TeamPromptDiscussionThreadHeader'
import TeamPromptWorkDrawer from './TeamPromptWorkDrawer'

interface Props {
  meetingRef: TeamPromptDrawer_meeting$key
}

const TeamPromptDrawer = ({meetingRef}: Props) => {
  const meeting = useFragment(
    graphql`
      fragment TeamPromptDrawer_meeting on TeamPromptMeeting {
        ...TeamPromptWorkDrawer_meeting
        ...DiscussionDrawerTranscripts_meeting
        id
        teamId
        isRightDrawerOpen
        localStageId
        phases {
          stages {
            id
            ... on TeamPromptResponseStage {
              discussionId
              teamMember {
                id
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
  const {id: meetingId, isRightDrawerOpen, localStageId} = meeting

  const onToggleDrawer = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const meetingProxy = store.get(meetingId)
      if (!meetingProxy) return
      meetingProxy.setValue(!meetingProxy.getValue('isRightDrawerOpen'), 'isRightDrawerOpen')
    })
  }

  const allStages = meeting.phases.flatMap((p) => p.stages)
  const selectedStage = localStageId ? findStageById(meeting.phases, localStageId)?.stage : null
  const activeStage =
    selectedStage?.discussionId && selectedStage?.teamMember
      ? selectedStage
      : allStages.find((s) => s.discussionId && s.teamMember && s.response?.content)

  const {discussionId, teamMember, response} = activeStage ?? {}

  const reactjis = response?.reactjis ?? []
  const contentJSON: JSONContent | null = response ? JSON.parse(response.content) : null

  const onToggleReactji = (emojiId: string) => {
    if (submitting || !reactjis || !response) return
    const isRemove = !!reactjis.find(
      (reactji) => reactji.isViewerReactji && ReactjiId.split(reactji.id).name === emojiId
    )
    submitMutation()
    AddReactjiToReactableMutation(
      atmosphere,
      {
        reactableId: response.id,
        reactableType: 'RESPONSE',
        isRemove,
        reactji: emojiId,
        meetingId
      },
      {onCompleted, onError}
    )
  }

  return (
    <ResponsiveDashSidebar
      isOpen={isRightDrawerOpen}
      isRightDrawer
      onToggle={onToggleDrawer}
      sidebarWidth={DiscussionThreadEnum.WIDTH}
    >
      <DiscussionDrawer
        discussionId={discussionId}
        onToggle={onToggleDrawer}
        allowedThreadables={['comment', 'task']}
        meetingRef={meeting}
        meetingId={meetingId}
        threadHeader={
          <TeamPromptDiscussionThreadHeader
            teamMember={teamMember}
            response={response}
            contentJSON={contentJSON}
            stageId={activeStage?.id}
            onToggleReactji={onToggleReactji}
          />
        }
        workContent={<TeamPromptWorkDrawer meetingRef={meeting} />}
      />
    </ResponsiveDashSidebar>
  )
}

export default TeamPromptDrawer
