import graphql from 'babel-plugin-relay/macro'
import React, {useCallback, useEffect} from 'react'
import {useFragment} from 'react-relay'
import {MeetingTypeEnum} from '~/__generated__/ActivityDetailsQuery.graphql'
import {TemplateDetails_user$key} from '~/__generated__/TemplateDetails_user.graphql'
import {TemplateDetails_templates$key} from '~/__generated__/TemplateDetails_templates.graphql'
import {QUICK_START_CATEGORY_ID} from '../Categories'
import {IntegrationsTip} from './components/IntegrationsTip'
import clsx from 'clsx'
import {useHistory} from 'react-router'
import {ContentCopy} from '@mui/icons-material'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useModal from '../../../hooks/useModal'
import useMutationProps from '../../../hooks/useMutationProps'
import CloneTemplate from '../../../modules/meeting/components/CloneTemplate'
import {UnstyledTemplateSharing} from '../../../modules/meeting/components/TemplateSharing'
import RemovePokerTemplateMutation from '../../../mutations/RemovePokerTemplateMutation'
import RemoveReflectTemplateMutation from '../../../mutations/RemoveReflectTemplateMutation'
import {setActiveTemplate} from '../../../utils/relay/setActiveTemplate'
import useTemplateDescription from '../../../utils/useTemplateDescription'
import DetailAction from '../../DetailAction'
import FlatButton from '../../FlatButton'
import PokerTemplateScaleDetails from '../../../modules/meeting/components/PokerTemplateScaleDetails'
import TeamPickerModal from '../TeamPickerModal'
import AddPokerTemplateDimension from '../../../modules/meeting/components/AddPokerTemplateDimension'
import AddTemplatePrompt from '../../../modules/meeting/components/AddTemplatePrompt'
import TemplateDimensionList from '../../../modules/meeting/components/TemplateDimensionList'
import TemplatePromptList from '../../../modules/meeting/components/TemplatePromptList'
import {ActivityWithTemplate} from './hooks/useActivityDetails'
import ActivityDetailsBadges from './ActivityDetailsBadges'

interface Props {
  activity: ActivityWithTemplate
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  viewerRef: TemplateDetails_user$key
  templatesRef: TemplateDetails_templates$key
}

export const TemplateDetails = (props: Props) => {
  const {viewerRef, templatesRef, isEditing, setIsEditing, activity} = props
  const {category, type, description: activityDescription, integrationsTip, template} = activity

  const viewer = useFragment(
    graphql`
      fragment TemplateDetails_user on User {
        tier
        teams {
          id
          ...TeamPickerModal_teams
        }
        organizations {
          id
        }
        ...useTemplateDescription_viewer
      }
    `,
    viewerRef
  )

  const templates = useFragment(
    graphql`
      fragment TemplateDetails_templates on MeetingTemplate @relay(plural: true) {
        name
        type
        teamId
        ...TeamPickerModal_templates
      }
    `,
    templatesRef
  )

  const {teams, organizations, tier} = viewer
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
    removeTemplateMutation(atmosphere, {templateId: template.id}, mutationArgs)
  }, [template.id, submitting, submitMutation, onError, onCompleted])

  const {
    togglePortal: toggleTeamPickerPortal,
    modalPortal: teamPickerModalPortal,
    closePortal: closeTeamPickerPortal
  } = useModal({
    id: 'templateTeamPickerModal'
  })

  const {
    openPortal: openPokerTemplateScaleDetailsPortal,
    modalPortal: pokerTemplateScaleDetailsPortal,
    closePortal: closePokerTemplateScaleDetailsPortal
  } = useModal({
    id: 'pokerTemplateScaleDetailsModal'
  })

  useEffect(() => {
    if (template.team.editingScaleId) {
      openPokerTemplateScaleDetailsPortal()
    } else {
      closePokerTemplateScaleDetailsPortal()
    }
  }, [
    openPokerTemplateScaleDetailsPortal,
    closePokerTemplateScaleDetailsPortal,
    template.team.editingScaleId
  ])

  const teamIds = teams.map((team) => team.id)
  const orgIds = organizations.map((org) => org.id)
  const isOwner = teamIds.includes(template.teamId)

  const lowestScope = isOwner ? 'TEAM' : orgIds.includes(template.orgId) ? 'ORGANIZATION' : 'PUBLIC'
  const description = useTemplateDescription(lowestScope, template, viewer, tier)

  useEffect(() => {
    setIsEditing(!!history.location.state?.edit)
  }, [history.location.state?.edit, setIsEditing])

  useEffect(
    () => setActiveTemplate(atmosphere, template.teamId, template.teamId, template.type),
    [template]
  )

  const templateConfigLookup: Record<MeetingTypeEnum, React.ReactNode> = {
    retrospective: (
      <>
        <TemplatePromptList
          isOwner={isOwner && isEditing}
          prompts={template.prompts!}
          templateId={template.id}
        />
        {isOwner && isEditing && (
          <AddTemplatePrompt templateId={template.id} prompts={template.prompts!} />
        )}
      </>
    ),
    poker: (
      <>
        <TemplateDimensionList
          isOwner={isOwner}
          readOnly={!isEditing}
          dimensions={template.dimensions!}
          templateId={template.id}
        />
        {isOwner && isEditing && (
          <AddPokerTemplateDimension templateId={template.id} dimensions={template.dimensions!} />
        )}
      </>
    ),
    action: null,
    teamPrompt: null
  }

  return (
    <div className='space-y-6'>
      <ActivityDetailsBadges isEditing={isEditing} templateRef={activity.template} />
      <div className='w-[480px]'>
        <div className='mb-8'>
          {isOwner ? (
            <div className='flex items-center justify-between'>
              <div
                className={clsx(
                  'w-max',
                  isEditing && 'rounded-full border border-solid border-slate-400 pl-3'
                )}
              >
                <UnstyledTemplateSharing
                  isOwner={isOwner}
                  template={template}
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
                      <CloneTemplate canClone={true} onClick={toggleTeamPickerPortal} />
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className='flex items-center justify-between'>
              <div className='py-2 text-sm font-semibold text-slate-600'>{description}</div>
              <div className='rounded-full border border-solid border-slate-400 text-slate-600'>
                <FlatButton
                  style={{padding: '8px 12px', border: '0'}}
                  className='flex gap-1 px-12'
                  onClick={toggleTeamPickerPortal}
                >
                  <ContentCopy className='text-slate-600' />
                  <div className='font-semibold text-slate-700'>Clone & Edit</div>
                </FlatButton>
              </div>
            </div>
          )}
        </div>
        {activityDescription}
      </div>

      <IntegrationsTip>{integrationsTip}</IntegrationsTip>

      <div className='-ml-14 pt-4'>{templateConfigLookup[type]}</div>

      {isEditing && (
        <div className='fixed bottom-0 left-0 right-0 flex h-20 w-full items-center justify-center bg-slate-200'>
          <button
            onClick={() => setIsEditing(false)}
            className='w-max cursor-pointer rounded-full bg-sky-500 px-10 py-3 text-center font-sans text-lg font-semibold text-white hover:bg-sky-600'
          >
            Done Editing
          </button>
        </div>
      )}

      {teamPickerModalPortal(
        <TeamPickerModal
          category={category}
          teamsRef={teams}
          templatesRef={templates}
          closePortal={closeTeamPickerPortal}
          parentTemplateId={template.id}
          type={template.type}
        />
      )}

      {template.type === 'poker' &&
        template.team.editingScaleId &&
        pokerTemplateScaleDetailsPortal(
          <div className='w-[520px]'>
            <PokerTemplateScaleDetails team={template.team} />
          </div>
        )}
    </div>
  )
}
