import graphql from 'babel-plugin-relay/macro'
import {ContentCopy} from '@mui/icons-material'
import React, {useCallback, useEffect, useState} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect, useHistory} from 'react-router'
import {ActivityDetailsQuery} from '~/__generated__/ActivityDetailsQuery.graphql'
import {Link} from 'react-router-dom'
import IconLabel from '../IconLabel'
import EditableTemplateName from '../../modules/meeting/components/EditableTemplateName'
import TemplatePromptList from '../../modules/meeting/components/TemplatePromptList'
import TemplateDimensionList from '../../modules/meeting/components/TemplateDimensionList'
import AddTemplatePrompt from '../../modules/meeting/components/AddTemplatePrompt'
import AddPokerTemplateDimension from '../../modules/meeting/components/AddPokerTemplateDimension'
import {ActivityCard} from './ActivityCard'
import {activityIllustrations} from './ActivityIllustrations'
import customTemplateIllustration from '../../../../static/images/illustrations/customTemplate.png'
import useTemplateDescription from '../../utils/useTemplateDescription'
import clsx from 'clsx'
import {UnstyledTemplateSharing} from '../../modules/meeting/components/TemplateSharing'
import DetailAction from '../DetailAction'
import RemoveReflectTemplateMutation from '../../mutations/RemoveReflectTemplateMutation'
import useMutationProps from '../../hooks/useMutationProps'
import useAtmosphere from '../../hooks/useAtmosphere'
import GitHubSVG from '../GitHubSVG'
import JiraSVG from '../JiraSVG'
import GitLabSVG from '../GitLabSVG'
import AzureDevOpsSVG from '../AzureDevOpsSVG'
import JiraServerSVG from '../JiraServerSVG'
import ActivityDetailsSidebar from './ActivityDetailsSidebar'
import CloneTemplate from '../../modules/meeting/components/CloneTemplate'
import useModal from '../../hooks/useModal'
import TeamPickerModal from './TeamPickerModal'
import FlatButton from '../FlatButton'
import {
  CategoryID,
  CATEGORY_THEMES,
  CATEGORY_ID_TO_NAME,
  QUICK_START_CATEGORY_ID
} from './Categories'
import {setActiveTemplate} from '../../utils/relay/setActiveTemplate'
import PokerTemplateScaleDetails from '../../modules/meeting/components/PokerTemplateScaleDetails'
import RemovePokerTemplateMutation from '../../mutations/RemovePokerTemplateMutation'

graphql`
  fragment ActivityDetails_template on MeetingTemplate {
    id
    name
    type
    category
    orgId
    teamId
    isFree
    scope
    team {
      editingScaleId
      ...PokerTemplateScaleDetails_team
    }
    ...ActivityDetailsSidebar_template
    ...EditableTemplateName_teamTemplates
    ...ReflectTemplateDetailsTemplate @relay(mask: false)
    ...PokerTemplateDetailsTemplate @relay(mask: false)
    ...TeamPickerModal_templates
    ...useTemplateDescription_template
  }
`

const query = graphql`
  query ActivityDetailsQuery {
    viewer {
      tier
      availableTemplates(first: 100) @connection(key: "ActivityDetails_availableTemplates") {
        edges {
          node {
            ...ActivityDetails_template @relay(mask: false)
          }
        }
      }
      teams {
        id
        ...ActivityDetailsSidebar_teams
        ...TeamPickerModal_teams
      }
      organizations {
        id
      }

      ...useTemplateDescription_viewer
    }
  }
`

interface DetailsBadgeProps {
  className?: string
  children?: React.ReactNode
}

const DetailsBadge = (props: DetailsBadgeProps) => {
  const {className, children} = props
  return (
    <div className={clsx('w-min rounded-full px-3 py-1 text-xs font-semibold', className)}>
      {children}
    </div>
  )
}

const SUPPORTED_TYPES = ['retrospective', 'poker']

interface Props {
  queryRef: PreloadedQuery<ActivityDetailsQuery>
  templateId: string
}

const ActivityDetails = (props: Props) => {
  const {queryRef, templateId} = props
  const data = usePreloadedQuery<ActivityDetailsQuery>(query, queryRef)
  const {viewer} = data
  const {availableTemplates, teams, organizations, tier} = viewer
  const selectedTemplate = availableTemplates.edges.find(
    (edge) => edge.node.id === templateId && SUPPORTED_TYPES.includes(edge.node.type)
  )?.node

  const history = useHistory<{prevCategory?: string}>()

  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()

  const categoryLink = `/activity-library/category/${
    history.location.state?.prevCategory ?? selectedTemplate?.category ?? QUICK_START_CATEGORY_ID
  }`

  const removeTemplate = useCallback(() => {
    if (submitting) return
    if (selectedTemplate?.type === 'retrospective') {
      submitMutation()
      RemoveReflectTemplateMutation(
        atmosphere,
        {templateId},
        {
          onError,
          onCompleted: () => {
            onCompleted()
            history.replace(categoryLink)
          }
        }
      )
    } else if (selectedTemplate?.type === 'poker') {
      submitMutation()
      RemovePokerTemplateMutation(
        atmosphere,
        {templateId},
        {
          onError,
          onCompleted: () => {
            onCompleted()
            history.replace(categoryLink)
          }
        }
      )
    }
  }, [templateId, submitting, submitMutation, onError, onCompleted])

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
    if (selectedTemplate?.team.editingScaleId) {
      openPokerTemplateScaleDetailsPortal()
    } else {
      closePokerTemplateScaleDetailsPortal()
    }
  }, [
    openPokerTemplateScaleDetailsPortal,
    closePokerTemplateScaleDetailsPortal,
    selectedTemplate?.team.editingScaleId
  ])

  const teamIds = teams.map((team) => team.id)
  const orgIds = organizations.map((org) => org.id)

  const isOwner = !!selectedTemplate && teamIds.includes(selectedTemplate.teamId)

  const teamTemplates = availableTemplates.edges
    .map((edge) => edge.node)
    .filter((edge) => edge.teamId === selectedTemplate?.teamId)

  const lowestScope = isOwner
    ? 'TEAM'
    : selectedTemplate && orgIds.includes(selectedTemplate.orgId)
    ? 'ORGANIZATION'
    : 'PUBLIC'
  const description = useTemplateDescription(lowestScope, selectedTemplate, viewer, tier)

  const [isEditing, setIsEditing] = useState(false)

  useEffect(
    () =>
      selectedTemplate &&
      setActiveTemplate(atmosphere, selectedTemplate.teamId, templateId, selectedTemplate.type),
    [selectedTemplate, templateId]
  )

  if (!selectedTemplate) {
    return <Redirect to='/activity-library' />
  }

  const {name: templateName, prompts, dimensions, type} = selectedTemplate

  const templateIllustration =
    activityIllustrations[selectedTemplate.id as keyof typeof activityIllustrations]
  const activityIllustration = templateIllustration ?? customTemplateIllustration

  const category = selectedTemplate.category as CategoryID

  return (
    <>
      <div className='flex h-full flex-col bg-white'>
        <div className='flex grow'>
          <div className='mt-4 grow'>
            <div className='mb-14 ml-4 flex h-min w-max items-center'>
              <Link className='mr-4' to={categoryLink}>
                <IconLabel icon={'arrow_back'} iconLarge />
              </Link>
              <div className='w-max text-xl font-semibold'>Start Activity</div>
            </div>
            <div className='mx-auto w-min'>
              <div
                className={clsx(
                  'flex w-full flex-col justify-start pl-4 pr-14 xl:flex-row xl:justify-center xl:pl-14',
                  isEditing && 'lg:flex-row lg:justify-center lg:pl-14'
                )}
              >
                <ActivityCard
                  className='ml-14 mb-8 h-[200px] w-80 xl:ml-0 xl:mb-0'
                  theme={CATEGORY_THEMES[category]}
                  imageSrc={activityIllustration}
                  badge={null}
                />
                <div className='pb-20'>
                  <div className='mb-10 pl-14'>
                    <div className='mb-2 flex min-h-[40px] items-center'>
                      <EditableTemplateName
                        className='text-[32px] leading-9'
                        key={templateId}
                        name={templateName}
                        templateId={templateId}
                        teamTemplates={teamTemplates}
                        isOwner={isOwner && isEditing}
                      />
                    </div>
                    <div className='mb-4 flex gap-2'>
                      <DetailsBadge
                        className={clsx(CATEGORY_THEMES[category].primary, 'text-white')}
                      >
                        {CATEGORY_ID_TO_NAME[category]}
                      </DetailsBadge>
                      {!selectedTemplate.isFree &&
                        (lowestScope === 'PUBLIC' ? (
                          <DetailsBadge className='bg-gold-300 text-grape-700'>
                            Premium
                          </DetailsBadge>
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
                                isEditing &&
                                  'rounded-full border border-solid border-slate-400 pl-3'
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
                                    <CloneTemplate
                                      canClone={true}
                                      onClick={toggleTeamPickerPortal}
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className='flex items-center justify-between'>
                            <div className='py-2 text-sm font-semibold text-slate-600'>
                              {description}
                            </div>
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
                      {type === 'retrospective' && (
                        <>
                          <b>Reflect</b> on what’s working or not on your team. <b>Group</b> common
                          themes and vote on the hottest topics. As you <b>discuss topics</b>,
                          create <b>takeaway tasks</b> that can be integrated with your backlog.
                        </>
                      )}
                      {type === 'poker' && (
                        <>
                          <b>Select</b> a list of issues from your integrated backlog, or create new
                          issues to estimate. <b>Estimate</b> with your team on 1 or many scoring
                          dimensions. <b>Push</b> the estimations to your backlog.
                        </>
                      )}
                    </div>
                    <div className='mt-[18px] flex min-w-max items-center'>
                      <div className='flex items-center gap-3'>
                        <JiraSVG />
                        <GitHubSVG />
                        <JiraServerSVG />
                        <GitLabSVG />
                        <AzureDevOpsSVG />
                      </div>
                      <div className='ml-4'>
                        <b>Tip:</b>{' '}
                        {type === 'retrospective' && 'push takeaway tasks to your backlog'}
                        {type === 'poker' && 'sync estimations with your backlog'}
                      </div>
                    </div>
                  </div>
                  {type === 'retrospective' && (
                    <>
                      <TemplatePromptList
                        isOwner={isOwner && isEditing}
                        prompts={prompts!}
                        templateId={templateId}
                      />
                      {isOwner && isEditing && (
                        <AddTemplatePrompt templateId={templateId} prompts={prompts!} />
                      )}
                    </>
                  )}
                  {type === 'poker' && (
                    <>
                      <TemplateDimensionList
                        isOwner={isOwner}
                        readOnly={!isEditing}
                        dimensions={dimensions!}
                        templateId={templateId}
                      />
                      {isOwner && isEditing && (
                        <AddPokerTemplateDimension
                          templateId={templateId}
                          dimensions={dimensions!}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <ActivityDetailsSidebar
            selectedTemplateRef={selectedTemplate}
            teamsRef={teams}
            isOpen={!isEditing}
          />
        </div>
        {isEditing && (
          <div className='fixed bottom-0 flex h-20 w-full items-center justify-center bg-slate-200'>
            <button
              onClick={() => setIsEditing(false)}
              className='w-max cursor-pointer rounded-full bg-sky-500 px-10 py-3 text-center font-sans text-lg font-semibold text-white hover:bg-sky-600'
            >
              Done Editing
            </button>
          </div>
        )}
      </div>
      {teamPickerModalPortal(
        <TeamPickerModal
          category={category}
          teamsRef={teams}
          templatesRef={availableTemplates.edges.map((edge) => edge.node)}
          closePortal={closeTeamPickerPortal}
          parentTemplateId={selectedTemplate.id}
          type={type}
        />
      )}
      {type === 'poker' &&
        selectedTemplate.team.editingScaleId &&
        pokerTemplateScaleDetailsPortal(
          <div className='w-[520px]'>
            <PokerTemplateScaleDetails team={selectedTemplate.team} />
          </div>
        )}
    </>
  )
}

export default ActivityDetails
