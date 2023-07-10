import React from 'react'
import {PreloadedQuery, usePreloadedQuery, useFragment} from 'react-relay'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import {DialogDescription} from '../ui/Dialog/DialogDescription'
import {DialogActions} from '../ui/Dialog/DialogActions'
import {Select} from '../ui/Select/Select'
import {SelectItem} from '../ui/Select/SelectItem'
import {SelectTrigger} from '../ui/Select/SelectTrigger'
import {SelectGroup} from '../ui/Select/SelectGroup'
import {SelectValue} from '../ui/Select/SelectValue'
import {SelectContent} from '../ui/Select/SelectContent'
import graphql from 'babel-plugin-relay/macro'
import {ShareTopicModalQuery} from '../__generated__/ShareTopicModalQuery.graphql'
import {ShareTopicModal_viewer$key} from '../__generated__/ShareTopicModal_viewer.graphql'
import SlackClientManager from '../utils/SlackClientManager'
import useMutationProps from '../hooks/useMutationProps'
import useAtmosphere from '../hooks/useAtmosphere'
import useSlackChannels from '../hooks/useSlackChannels'

interface Props {
  isOpen: boolean
  onClose: () => void
  stageId: string
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
              defaultTeamChannelId
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
  const {isOpen, onClose, queryRef} = props

  const onShare = () => {
    /* TODO */
  }

  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const data = usePreloadedQuery<ShareTopicModalQuery>(query, queryRef)
  const viewer = useFragment<ShareTopicModal_viewer$key>(ShareTopicModalViewerFragment, data.viewer)
  const {meeting} = viewer

  const slack = meeting?.viewerMeetingMember?.teamMember.integrations.slack ?? null
  const isSlackConnected = slack?.isActive
  const slackDefaultTeamChannelId = slack?.defaultTeamChannelId
  const slackChannels = useSlackChannels(slack)

  const defaultSelectedIntegration = isSlackConnected ? 'slack' : ''
  const [selectedIntegration, setSelectedIntegration] = React.useState<Integration | ''>(
    defaultSelectedIntegration
  )
  const [selectedChannel, setSelectedChannel] = React.useState<string>(
    slackDefaultTeamChannelId ?? ''
  )

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
          submitting,
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
        <DialogDescription>Where would you like to share the topic?</DialogDescription>

        <fieldset className={fieldsetStyles}>
          <label className={labelStyles}>Integration</label>
          <Select
            onValueChange={onIntegrationChange}
            value={selectedIntegration}
            disabled={submitting}
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
                  className='data-[disabled]:opacity-100'
                >
                  Teams
                </SelectItem>
                <SelectItem
                  value='mattermost'
                  disabled={true}
                  endAdornment={comingSoonBadge}
                  className='data-[disabled]:opacity-100'
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
            disabled={submitting || selectedIntegration === ''}
          >
            <SelectTrigger>
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
          <PrimaryButton size='small' onClick={onShare}>
            Share
          </PrimaryButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default ShareTopicModal
