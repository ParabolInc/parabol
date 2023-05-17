import graphql from 'babel-plugin-relay/macro'
import React, {useCallback, useEffect} from 'react'
import {useFragment} from 'react-relay'
import {ActivityDetailsQuery} from '~/__generated__/ActivityDetailsQuery.graphql'
import {TemplateDetails_user$key} from '~/__generated__/TemplateDetails_user.graphql'
import {TemplateDetails_templates$key} from '~/__generated__/TemplateDetails_templates.graphql'
import {
  CATEGORY_ID_TO_NAME,
  CATEGORY_THEMES,
  CategoryID,
  QUICK_START_CATEGORY_ID
} from '../Categories'
import {IntegrationsList} from './components/IntegrationsList'
import clsx from 'clsx'
import {useHistory} from 'react-router'
import {DetailsBadge} from './components/DetailsBadge'
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
import {descriptionLookup, tipLookup} from './ActivityDetails'

type Template =
  ActivityDetailsQuery['response']['viewer']['availableTemplates']['edges'][number]['node']

interface Props {
  selectedTemplate: Template
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  viewerRef: TemplateDetails_user$key
  templatesRef: TemplateDetails_templates$key
}

export const TemplateDetails = (props: Props) => {
  const {viewerRef, templatesRef, selectedTemplate, isEditing, setIsEditing} = props
  const {category} = selectedTemplate

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

    const removeTemplateMutation = removeTemplateMutationLookup[selectedTemplate.type]
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
    removeTemplateMutation(atmosphere, {templateId: selectedTemplate.id}, mutationArgs)
  }, [selectedTemplate.id, submitting, submitMutation, onError, onCompleted])

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
    if (selectedTemplate.team.editingScaleId) {
      openPokerTemplateScaleDetailsPortal()
    } else {
      closePokerTemplateScaleDetailsPortal()
    }
  }, [
    openPokerTemplateScaleDetailsPortal,
    closePokerTemplateScaleDetailsPortal,
    selectedTemplate.team.editingScaleId
  ])

  const teamIds = teams.map((team) => team.id)
  const orgIds = organizations.map((org) => org.id)
  const isOwner = teamIds.includes(selectedTemplate.teamId)

  const lowestScope = isOwner
    ? 'TEAM'
    : orgIds.includes(selectedTemplate.orgId)
    ? 'ORGANIZATION'
    : 'PUBLIC'
  const description = useTemplateDescription(lowestScope, selectedTemplate, viewer, tier)

  useEffect(() => {
    setIsEditing(!!history.location.state?.edit)
  }, [history.location.state?.edit, setIsEditing])

  useEffect(
    () =>
      setActiveTemplate(
        atmosphere,
        selectedTemplate.teamId,
        selectedTemplate.teamId,
        selectedTemplate.type
      ),
    [selectedTemplate]
  )

  return (
    <>
      <div className='flex gap-2'>
        <DetailsBadge
          className={clsx(CATEGORY_THEMES[category as CategoryID].primary, 'text-white')}
        >
          {CATEGORY_ID_TO_NAME[category as CategoryID]}
        </DetailsBadge>
        {!selectedTemplate.isFree &&
          (lowestScope === 'PUBLIC' ? (
            <DetailsBadge className='bg-gold-300 text-grape-700'>Premium</DetailsBadge>
          ) : (
            <DetailsBadge className='bg-grape-700 text-white'>Custom</DetailsBadge>
          ))}
      </div>
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
                  noModal={true}
                  isOwner={isOwner}
                  template={selectedTemplate}
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
        {descriptionLookup[selectedTemplate.type]}
      </div>
      <div className='flex min-w-max items-center'>
        <IntegrationsList />
        <div className='ml-4'>
          <b>Tip:</b> {tipLookup[selectedTemplate.type]}
        </div>
      </div>

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
          parentTemplateId={selectedTemplate.id}
          type={selectedTemplate.type}
        />
      )}

      {selectedTemplate.type === 'poker' &&
        selectedTemplate.team.editingScaleId &&
        pokerTemplateScaleDetailsPortal(
          <div className='w-[520px]'>
            <PokerTemplateScaleDetails team={selectedTemplate.team} />
          </div>
        )}
    </>
  )
}
