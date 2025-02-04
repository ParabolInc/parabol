import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import {ShareTopicModalQuery} from '../__generated__/ShareTopicModalQuery.graphql'
import {ShareTopicModal_viewer$key} from '../__generated__/ShareTopicModal_viewer.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import useSlackChannels from '../hooks/useSlackChannels'
import useShareTopicMutation from '../mutations/useShareTopicMutation'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogActions} from '../ui/Dialog/DialogActions'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogDescription} from '../ui/Dialog/DialogDescription'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import {Select} from '../ui/Select/Select'
import {SelectContent} from '../ui/Select/SelectContent'
import {SelectGroup} from '../ui/Select/SelectGroup'
import {SelectItem} from '../ui/Select/SelectItem'
import {SelectTrigger} from '../ui/Select/SelectTrigger'
import {SelectValue} from '../ui/Select/SelectValue'
import SlackClientManager from '../utils/SlackClientManager'
import findStageById from '../utils/meetings/findStageById'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'

interface Props {
  isOpen: boolean
  onClose: () => void
  stageId: string
  meetingId: string
  queryRef: PreloadedQuery<ShareTopicModalQuery>
}

const ShareTopicModalViewerFragment = graphql`
  fragment ShareTopicModal_viewer on User @argumentDefinitions(meetingId: {type: "ID!"}) {
    meeting(meetingId: $meetingId) {
      teamId
      viewerMeetingMember {
        teamMember {
          integrations {
            slack {
              isActive
              botAccessToken
              slackUserId
              slackTeamId
              defaultTeamChannelId
            }
          }
        }
      }
      phases {
        phaseType
        stages {
          id
          ... on RetroDiscussStage {
            reflectionGroup {
              title
            }
          }
        }
      }
    }
  }
`

const query = graphql`
  query ShareTopicModalQuery($meetingId: ID!) {
    viewer {
      ...ShareTopicModal_viewer @arguments(meetingId: $meetingId)
    }
  }
`

type Integration = 'slack'

const ShareTopicModal = (props: Props) => {
  const {isOpen, onClose, queryRef, meetingId, stageId} = props
  const atmosphere = useAtmosphere()
  const [commit, shareTopicSubmitting] = useShareTopicMutation()
  const {
    submitting: slackOAuthSubmitting,
    submitMutation,
    onError,
    onCompleted
  } = useMutationProps()
  const data = usePreloadedQuery<ShareTopicModalQuery>(query, queryRef)
  const viewer = useFragment<ShareTopicModal_viewer$key>(ShareTopicModalViewerFragment, data.viewer)
  const {meeting} = viewer

  const stage = findStageById(meeting?.phases, stageId)?.stage
  const topicTitle = stage?.reflectionGroup?.title ?? ''

  const slack = meeting?.viewerMeetingMember?.teamMember.integrations.slack ?? null
  const isSlackConnected = slack?.isActive
  const slackDefaultTeamChannelId = slack?.defaultTeamChannelId
  const slackChannels = useSlackChannels(slack)
  const channelsLoading = slackChannels.length === 0 && isSlackConnected
  const isLoading = slackOAuthSubmitting || shareTopicSubmitting

  const defaultSelectedIntegration = isSlackConnected ? 'slack' : ''
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | ''>(
    defaultSelectedIntegration
  )
  const [selectedChannel, setSelectedChannel] = useState<string>(slackDefaultTeamChannelId ?? '')

  if (!meeting) {
    return null
  }

  const {teamId} = meeting

  const onIntegrationChange = (integration: Integration) => {
    if (integration === 'slack') {
      if (isSlackConnected) {
        setSelectedIntegration('slack')
      } else {
        SlackClientManager.openOAuth(atmosphere, teamId, {
          submitting: slackOAuthSubmitting,
          submitMutation,
          onError,
          onCompleted: () => {
            onCompleted()
            setSelectedIntegration('slack')
          }
        })
      }
    }
  }

  const onChannelChange = (channel: string) => {
    setSelectedChannel(channel)
  }

  const onShare = () => {
    commit(
      {
        variables: {
          stageId,
          meetingId,
          channelId: selectedChannel
        }
      },
      {
        onSuccess: () => {
          const channel = slackChannels.find((channel) => channel.id === selectedChannel)
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: `topicShared`,
            autoDismiss: 5,
            message: `"${topicTitle}" has been shared to ${channel?.name}`,
            action: {
              label: `View message`,
              callback: () => {
                const url = `https://app.slack.com/client/${
                  slack?.slackTeamId ?? ''
                }/${selectedChannel}`
                window.open(url, '_blank', 'noopener')?.focus()
              }
            }
          })
          onClose()
        }
      }
    )
  }

  const comingSoonBadge = (
    <div className='flex items-center justify-center rounded-full bg-slate-300 px-3 py-1'>
      <div className='text-center text-xs font-semibold text-slate-600'>coming soon</div>
    </div>
  )

  const connectButton = (
    <div className='flex cursor-pointer items-center justify-center rounded-full border bg-white px-3 py-1'>
      <div className='text-center text-xs font-semibold text-slate-700'>connect</div>
    </div>
  )

  const labelStyles = `w-[110px] text-left text-sm font-semibold`
  const fieldsetStyles = `mx-0 mb-[15px] mb-2 flex items-center gap-5 p-0`

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='z-10'>
        <DialogTitle>Share topic</DialogTitle>
        <DialogDescription>
          Where would you like to share the topic "{topicTitle}"?
        </DialogDescription>

        <fieldset className={fieldsetStyles}>
          <label className={labelStyles}>Integration</label>
          <Select
            onValueChange={onIntegrationChange}
            value={selectedIntegration}
            disabled={isLoading}
          >
            <SelectTrigger>
              {selectedIntegration !== '' ? (
                <SelectValue />
              ) : (
                <span className='text-slate-600'>Select Integration</span>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='slack' endAdornment={!isSlackConnected ? connectButton : null}>
                  Slack
                </SelectItem>
                <SelectItem
                  value='teams'
                  disabled={true}
                  endAdornment={comingSoonBadge}
                  className='data-disabled:opacity-100'
                >
                  Teams
                </SelectItem>
                <SelectItem
                  value='mattermost'
                  disabled={true}
                  endAdornment={comingSoonBadge}
                  className='data-disabled:opacity-100'
                >
                  Mattermost
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </fieldset>

        <fieldset className={fieldsetStyles}>
          <label className={labelStyles}>Channel</label>
          <Select
            onValueChange={onChannelChange}
            value={selectedChannel}
            disabled={isLoading || channelsLoading || selectedIntegration === ''}
          >
            <SelectTrigger isLoading={channelsLoading}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position='item-aligned'>
              <SelectGroup>
                {selectedIntegration === 'slack' &&
                  slackChannels.map((channel) => (
                    <SelectItem value={channel.id} key={channel.id}>
                      {channel.name}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </fieldset>
        <DialogActions>
          <SecondaryButton onClick={onClose} size='small'>
            Cancel
          </SecondaryButton>
          <PrimaryButton size='small' onClick={onShare} disabled={isLoading || channelsLoading}>
            Share
          </PrimaryButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default ShareTopicModal
