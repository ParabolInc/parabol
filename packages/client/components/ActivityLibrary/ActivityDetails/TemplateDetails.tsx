import {ContentCopy} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import * as React from 'react'
import {useCallback, useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import {useHistory} from 'react-router'
import {MeetingTypeEnum} from '~/__generated__/ActivityDetailsQuery.graphql'
import {TemplateDetails_activity$key} from '~/__generated__/TemplateDetails_activity.graphql'
import {TemplateDetails_user$key} from '~/__generated__/TemplateDetails_user.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useModal from '../../../hooks/useModal'
import useMutationProps from '../../../hooks/useMutationProps'
import AddPokerTemplateDimension from '../../../modules/meeting/components/AddPokerTemplateDimension'
import AddTemplatePrompt from '../../../modules/meeting/components/AddTemplatePrompt'
import CloneTemplate from '../../../modules/meeting/components/CloneTemplate'
import PokerTemplateScaleDetails from '../../../modules/meeting/components/PokerTemplateScaleDetails'
import TemplateDimensionList from '../../../modules/meeting/components/TemplateDimensionList'
import TemplatePromptList from '../../../modules/meeting/components/TemplatePromptList'
import {UnstyledTemplateSharing} from '../../../modules/meeting/components/TemplateSharing'
import RemovePokerTemplateMutation from '../../../mutations/RemovePokerTemplateMutation'
import RemoveReflectTemplateMutation from '../../../mutations/RemoveReflectTemplateMutation'
import {setActiveTemplate} from '../../../utils/relay/setActiveTemplate'
import useTemplateDescription from '../../../utils/useTemplateDescription'
import DetailAction from '../../DetailAction'
import FlatButton from '../../FlatButton'
import ActivityCardFavorite from '../ActivityCardFavorite'
import {QUICK_START_CATEGORY_ID} from '../Categories'
import TeamPickerModal from '../TeamPickerModal'
import ActivityDetailsBadges from './ActivityDetailsBadges'
import {IntegrationsTip} from './components/IntegrationsTip'

const ACTIVITY_TYPE_DATA_LOOKUP: Record<
  MeetingTypeEnum,
  {description: React.ReactNode; integrationsTip: React.ReactNode}
> = {
  teamPrompt: {
    description: (
      <>
        This is the space for teammates to give async updates on their work. You can discuss how
        work is going using a thread, or hop on a call and review the updates together.
      </>
    ),
    integrationsTip: <>push takeaway tasks to your backlog</>
  },
  retrospective: {
    description: (
      <>
        <b>Reflect</b> on what’s working or not on your team. <b>Group</b> common themes and vote on
        the hottest topics. As you <b>discuss topics</b>, create <b>takeaway tasks</b> that can be
        integrated with your backlog.
      </>
    ),
    integrationsTip: <>push takeaway tasks to your backlog</>
  },
  poker: {
    description: (
      <>
        <b>Select</b> a list of issues from your integrated backlog, or create new issues to
        estimate. <b>Estimate</b> with your team on 1 or many scoring dimensions. <b>Push</b> the
        estimations to your backlog.
      </>
    ),
    integrationsTip: <>sync estimations with your backlog</>
  },
  action: {
    description: (
      <>
        This is a space to check in as a team. Share a personal update using the <b>Icebreaker</b>{' '}
        phase. Give a brief update on what’s changed with your work during the <b>Solo Updates</b>{' '}
        phase. Raise issues for discussion in the <b>Team Agenda</b> phase.
      </>
    ),
    integrationsTip: <>push takeaway tasks to your backlog</>
  }
}

interface Props {
  activityRef: TemplateDetails_activity$key
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  viewerRef: TemplateDetails_user$key
}

export const TemplateDetails = (props: Props) => {
  const {viewerRef, isEditing, setIsEditing, activityRef} = props

  const activity = useFragment(
    graphql`
      fragment TemplateDetails_activity on MeetingTemplate {
        __typename
        id
        category
        type
        team {
          id
          editingScaleId
          ...PokerTemplateScaleDetails_team
        }
        viewerLowestScope
        ... on PokerTemplate {
          dimensions {
            ...AddPokerTemplateDimension_dimensions
            ...TemplateDimensionList_dimensions
          }
        }
        ... on ReflectTemplate {
          prompts {
            ...AddTemplatePrompt_prompts
            ...TemplatePromptList_prompts
          }
        }
        ...ActivityDetailsBadges_template
        ...TemplateSharing_template
        ...useTemplateDescription_template
      }
    `,
    activityRef
  )
  const {
    __typename,
    id: activityId,
    category,
    dimensions,
    prompts,
    team,
    type,
    viewerLowestScope
  } = activity
  const {id: teamId, editingScaleId} = team

  const {description: activityDescription, integrationsTip} = ACTIVITY_TYPE_DATA_LOOKUP[type]

  const viewer = useFragment(
    graphql`
      fragment TemplateDetails_user on User {
        ...ActivityCardFavorite_user
        preferredTeamId
        teams {
          ...TeamPickerModal_teams
        }
      }
    `,
    viewerRef
  )

  const {teams, preferredTeamId} = viewer
  const history = useHistory<{prevCategory?: string; edit?: boolean}>()
  const prevCategory = history.location.state?.prevCategory

  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()

  const removeTemplate = useCallback(() => {
    if (submitting) return
    const removeTemplateMutationLookup = {
      retrospective: RemoveReflectTemplateMutation,
      poker: RemovePokerTemplateMutation,
      action: null,
      teamPrompt: null
    } as const

    const removeTemplateMutation = removeTemplateMutationLookup[type]
    if (!removeTemplateMutation) return

    submitMutation()
    const mutationArgs = {
      onError,
      onCompleted: () => {
        onCompleted()
        history.replace(
          `/activity-library/category/${prevCategory ?? category ?? QUICK_START_CATEGORY_ID}`
        )
      }
    }
    removeTemplateMutation(atmosphere, {templateId: activityId}, mutationArgs)
  }, [activityId, submitting, submitMutation, onError, onCompleted])

  const [teamPickerOpen, setTeamPickerOpen] = useState(false)

  const {
    openPortal: openPokerTemplateScaleDetailsPortal,
    modalPortal: pokerTemplateScaleDetailsPortal,
    closePortal: closePokerTemplateScaleDetailsPortal
  } = useModal({
    id: 'pokerTemplateScaleDetailsModal'
  })

  useEffect(() => {
    if (editingScaleId) {
      openPokerTemplateScaleDetailsPortal()
    } else {
      closePokerTemplateScaleDetailsPortal()
    }
  }, [openPokerTemplateScaleDetailsPortal, closePokerTemplateScaleDetailsPortal, editingScaleId])

  const isOwner = viewerLowestScope === 'TEAM'

  const description = useTemplateDescription(viewerLowestScope, activity)

  useEffect(() => {
    setIsEditing(!!history.location.state?.edit)
  }, [history.location.state?.edit, setIsEditing])

  useEffect(() => setActiveTemplate(atmosphere, teamId, activityId, type), [activity])

  return (
    <div className='space-y-6'>
      <ActivityDetailsBadges isEditing={isEditing} templateRef={activity} />
      <div className='max-w-[480px]'>
        <div className='mb-6'>
          {__typename === 'FixedActivity' && (
            <div className='text-base font-semibold text-slate-600'>Created by Parabol</div>
          )}
          {isOwner && (
            <div className='flex items-center justify-between'>
              <div
                className={clsx(
                  'w-max',
                  isEditing && 'rounded-full border border-solid border-slate-400 pl-3'
                )}
              >
                <UnstyledTemplateSharing
                  isOwner={isOwner}
                  template={activity}
                  readOnly={!isEditing}
                />
              </div>
              <div className='flex gap-2'>
                {isEditing ? (
                  <div className='rounded-full border border-solid border-slate-400'>
                    <DetailAction
                      icon={'delete'}
                      tooltip={'Delete template'}
                      onClick={removeTemplate}
                    />
                  </div>
                ) : (
                  <>
                    <div className='rounded-full border border-solid border-slate-400'>
                      <DetailAction
                        icon={'edit'}
                        tooltip={'Edit template'}
                        onClick={() => setIsEditing(true)}
                      />
                    </div>
                    <div className='rounded-full border border-solid border-slate-400'>
                      <CloneTemplate onClick={() => setTeamPickerOpen(true)} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          {!isOwner && __typename !== 'FixedActivity' && (
            <div className='flex items-center justify-between'>
              <div className='py-2 text-sm font-semibold text-slate-600'>{description}</div>
              <div className='flex items-center gap-2'>
                <ActivityCardFavorite
                  templateId={activityId}
                  viewerRef={viewer}
                  className='rounded-full border border-solid border-slate-400 hover:bg-slate-200'
                />
                <div className='rounded-full border border-solid border-slate-400'>
                  <FlatButton
                    style={{padding: '8px 12px', border: '0'}}
                    className='flex cursor-pointer gap-1 px-12'
                    onClick={() => setTeamPickerOpen(true)}
                  >
                    <ContentCopy className='text-slate-600' />
                    <div className='font-semibold text-slate-700'>Clone & Edit</div>
                  </FlatButton>
                </div>
              </div>
            </div>
          )}
        </div>
        {activityDescription}
      </div>
      <IntegrationsTip className='flex-wrap'>{integrationsTip}</IntegrationsTip>

      <div className='pt-4 sm:-ml-14'>
        {prompts && (
          <>
            <TemplatePromptList
              isOwner={isOwner && isEditing}
              prompts={prompts}
              templateId={activityId}
            />
            {isOwner && isEditing && (
              <AddTemplatePrompt templateId={activityId} prompts={prompts} />
            )}
          </>
        )}
        {dimensions && (
          <>
            <TemplateDimensionList
              isOwner={isOwner}
              readOnly={!isEditing}
              dimensions={dimensions}
              templateId={activityId}
            />
            {isOwner && isEditing && (
              <AddPokerTemplateDimension templateId={activityId} dimensions={dimensions} />
            )}
          </>
        )}
      </div>

      {isEditing && (
        <div className='fixed right-0 bottom-0 left-0 flex h-20 w-full items-center justify-center bg-slate-200'>
          <button
            onClick={() => setIsEditing(false)}
            className='w-max cursor-pointer rounded-full bg-sky-500 px-10 py-3 text-center font-sans text-lg font-semibold text-white hover:bg-sky-600'
          >
            Done Editing
          </button>
        </div>
      )}

      <TeamPickerModal
        category={category}
        teamsRef={teams}
        parentTemplateId={activityId}
        preferredTeamId={preferredTeamId}
        type={type}
        isOpen={teamPickerOpen}
        closeModal={() => {
          setTeamPickerOpen(false)
        }}
      />

      {type === 'poker' &&
        editingScaleId &&
        pokerTemplateScaleDetailsPortal(
          <div className='w-[520px]'>
            <PokerTemplateScaleDetails team={team} />
          </div>
        )}
    </div>
  )
}
