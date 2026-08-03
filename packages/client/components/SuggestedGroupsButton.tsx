import * as RadixPopover from '@radix-ui/react-popover'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {SuggestedGroupsButton_meeting$key} from '~/__generated__/SuggestedGroupsButton_meeting.graphql'
import useSuggestedGroupsSettings from '../hooks/useSuggestedGroupsSettings'
import useGenerateSuggestedGroupsMutation from '../mutations/useGenerateSuggestedGroupsMutation'
import {RetroDemo, Threshold} from '../types/constEnums'
import {Button} from '../ui/Button/Button'
import {useDialogState} from '../ui/Dialog/useDialogState'
import SuggestedGroupsPanel from './SuggestedGroupsPanel'

type Props = {
  meeting: SuggestedGroupsButton_meeting$key
}

const SuggestedGroupsButton = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment SuggestedGroupsButton_meeting on RetrospectiveMeeting {
        id
        organization {
          tier
          useAI
        }
        team {
          qualAIMeetingsCount
        }
        suggestedGrouping {
          mode
          sameColumnOnly
          userPrompt
          isStale
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, organization, team, suggestedGrouping} = meeting
  const {useAI, tier} = organization
  const {qualAIMeetingsCount} = team
  const {isOpen, open, close} = useDialogState()
  const [settings, updateSettings] = useSuggestedGroupsSettings(meetingId)
  const [execute, submitting] = useGenerateSuggestedGroupsMutation()

  const teamOverLimit = qualAIMeetingsCount >= Threshold.MAX_QUAL_AI_MEETINGS && tier === 'starter'
  const aiDisabledReason = !useAI
    ? 'AI features are turned off for your organization.'
    : teamOverLimit
      ? 'You have used all your AI retros. Upgrade to a paid plan to keep going.'
      : null

  // Nothing generated yet falls back to the ambient default the group phase computes on its own,
  // so a fresh meeting starts with the button disabled too.
  const appliedMode = suggestedGrouping?.mode ?? 'similarity'
  const appliedSameColumnOnly = suggestedGrouping?.sameColumnOnly ?? false
  const appliedPrompt = (suggestedGrouping?.userPrompt ?? '').trim()
  // Stale suggestions re-open the button even when nothing was retyped: only similarity grouping is
  // refreshed automatically, so this is how an AI board asks to be regrouped after the cards change
  const isUpToDate =
    !suggestedGrouping?.isStale &&
    settings.mode === appliedMode &&
    settings.sameColumnOnly === appliedSameColumnOnly &&
    (settings.mode !== 'ai' || settings.userPrompt.trim() === appliedPrompt)

  const onOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      close()
      return
    }
    // Never open onto a mode the viewer cannot use
    if (settings.mode === 'ai' && aiDisabledReason) {
      updateSettings({mode: 'similarity'})
    }
    open()
  }

  const onSubmit = () => {
    const {mode, userPrompt, sameColumnOnly} = settings
    execute({
      variables: {
        meetingId,
        mode,
        userPrompt: mode === 'ai' ? userPrompt.trim() || null : null,
        sameColumnOnly
      },
      // A failure throws, which the hook reports in a snackbar, so the panel stays open with the
      // settings the viewer just tried
      onCompleted: close
    })
  }

  // The demo runs against an in-memory schema with no grouping mutation to call
  if (meetingId === RetroDemo.MEETING_ID) return null

  return (
    <RadixPopover.Root open={isOpen} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>
        <Button
          variant='dialogPrimary'
          size='md'
          className='bg-grape-500 shadow-sm hover:bg-grape-600'
        >
          {'Suggest Groups ✨'}
        </Button>
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          side='bottom'
          align='start'
          sideOffset={8}
          collisionPadding={8}
          className='z-10 w-[375px] max-w-[95vw] rounded-lg border border-hairline bg-surface-card shadow-dialog'
        >
          <SuggestedGroupsPanel
            onSubmit={onSubmit}
            settings={settings}
            updateSettings={updateSettings}
            submitting={submitting}
            isUpToDate={isUpToDate}
            aiDisabledReason={aiDisabledReason}
          />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}

export default SuggestedGroupsButton
