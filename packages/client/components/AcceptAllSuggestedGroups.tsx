import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {useFragment} from 'react-relay'
import type {AcceptAllSuggestedGroups_meeting$key} from '~/__generated__/AcceptAllSuggestedGroups_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import ResetReflectionGroupsMutation from '~/mutations/ResetReflectionGroupsMutation'
import useAcceptSuggestedGroupsMutation from '~/mutations/useAcceptSuggestedGroupsMutation'
import {Button} from '~/ui/Button/Button'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'
import planSuggestedGroupMerges from '~/utils/smartGroup/planSuggestedGroupMerges'
import {getGroupIdByReflectionId, getSuggestedGroupIds} from '~/utils/smartGroup/suggestionLookup'

interface Props {
  meeting: AcceptAllSuggestedGroups_meeting$key
}

const AcceptAllSuggestedGroups = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment AcceptAllSuggestedGroups_meeting on RetrospectiveMeeting {
        id
        facilitatorUserId
        isSuggestedGroupingHidden
        resetReflectionGroups {
          groupTitle
        }
        suggestedGrouping {
          groups {
            id
            title
            reflectionIds
          }
        }
        reflectionGroups {
          id
          titleIsUserDefined
          sortOrder
          reflections {
            id
          }
        }
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const undoRef = useRef<HTMLButtonElement>(null)
  const [execute, submitting] = useAcceptSuggestedGroupsMutation()
  const {id: meetingId, facilitatorUserId, isSuggestedGroupingHidden, reflectionGroups} = meeting
  if (atmosphere.viewerId !== facilitatorUserId) return null

  const suggestions = isSuggestedGroupingHidden ? [] : (meeting.suggestedGrouping?.groups ?? [])
  const merges = planSuggestedGroupMerges(suggestions, reflectionGroups)
  const groupIdByReflectionId = getGroupIdByReflectionId(reflectionGroups)
  const skippedCount =
    suggestions.filter((s) => getSuggestedGroupIds(s, groupIdByReflectionId).size > 1).length -
    merges.length
  const groupById = new Map(reflectionGroups.map((group) => [group.id, group]))
  const movedCount = merges
    .flatMap(({sourceGroupIds}) => sourceGroupIds)
    .reduce((sum, id) => sum + (groupById.get(id)?.reflections.length ?? 0), 0)
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

  const undo = () => {
    atmosphere.eventEmitter.emit('removeSnackbar', ({key}) => key === 'acceptSuggestedGroups')
    ResetReflectionGroupsMutation(
      atmosphere,
      {meetingId},
      {
        onCompleted: (res) => {
          const message = res.resetReflectionGroups.error?.message ?? 'Undid Accept all.'
          atmosphere.eventEmitter.emit('addSnackbar', {autoDismiss: 5, key: 'undoAccept', message})
        },
        onError: () => {}
      }
    )
  }
  const accept = () => {
    execute({
      variables: {meetingId},
      onUndo: undo,
      onCompleted: () => {
        requestAnimationFrame(() => undoRef.current?.focus())
      }
    })
  }

  return (
    <>
      {merges.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='md'
              disabled={submitting}
              onClick={accept}
              aria-label={`Accept all ${plural(merges.length, 'suggested group')}`}
            >
              {submitting ? 'Grouping…' : `Accept all (${merges.length})`}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {`Moves ${plural(movedCount, 'card')} into ${plural(merges.length, 'group')}. Groups your team made stay together.`}
            {skippedCount > 0 &&
              ` Skips ${skippedCount} that would split or rename a group your team made.`}
          </TooltipContent>
        </Tooltip>
      )}
      {meeting.resetReflectionGroups && (
        <Button ref={undoRef} variant='flat' size='md' onClick={undo}>
          {'Undo Accept all'}
        </Button>
      )}
    </>
  )
}

export default AcceptAllSuggestedGroups
