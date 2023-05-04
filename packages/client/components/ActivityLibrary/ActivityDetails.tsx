import {ContentCopy} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import React, {useCallback, useState} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect, useHistory} from 'react-router'
import {Link} from 'react-router-dom'
import {ActivityDetailsQuery} from '~/__generated__/ActivityDetailsQuery.graphql'
import customTemplateIllustration from '../../../../static/images/illustrations/customTemplate.png'
import useAtmosphere from '../../hooks/useAtmosphere'
import useModal from '../../hooks/useModal'
import useMutationProps from '../../hooks/useMutationProps'
import AddTemplatePrompt from '../../modules/meeting/components/AddTemplatePrompt'
import CloneTemplate from '../../modules/meeting/components/CloneTemplate'
import EditableTemplateName from '../../modules/meeting/components/EditableTemplateName'
import TemplatePromptList from '../../modules/meeting/components/TemplatePromptList'
import {UnstyledTemplateSharing} from '../../modules/meeting/components/TemplateSharing'
import RemoveReflectTemplateMutation from '../../mutations/RemoveReflectTemplateMutation'
import useTemplateDescription from '../../utils/useTemplateDescription'
import AzureDevOpsSVG from '../AzureDevOpsSVG'
import DetailAction from '../DetailAction'
import FlatButton from '../FlatButton'
import GitHubSVG from '../GitHubSVG'
import GitLabSVG from '../GitLabSVG'
import IconLabel from '../IconLabel'
import JiraSVG from '../JiraSVG'
import JiraServerSVG from '../JiraServerSVG'
import {ActivityCard} from './ActivityCard'
import ActivityDetailsBadges from './ActivityDetailsBadges'
import ActivityDetailsSidebar from './ActivityDetailsSidebar'
import {activityIllustrations} from './ActivityIllustrations'
import {CATEGORY_THEMES, CategoryID} from './Categories'
import TeamPickerModal from './TeamPickerModal'

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
    ...ActivityDetailsBadges_template
    ...ActivityDetailsSidebar_template
    ...EditableTemplateName_teamTemplates
    ...ReflectTemplateDetailsTemplate @relay(mask: false)
    ...TeamPickerModal_templates
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
    (edge) => edge.node.id === templateId && edge.node.type === 'retrospective'
  )?.node

  const history = useHistory<{prevCategory?: string}>()

  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()

  const removeTemplate = useCallback(() => {
    if (submitting) return
    submitMutation()
    RemoveReflectTemplateMutation(
      atmosphere,
      {templateId},
      {
        onError,
        onCompleted: () => {
          onCompleted()
          history.replace('/activity-library')
        }
      }
    )
  }, [templateId, submitting, submitMutation, onError, onCompleted])

  const {togglePortal, modalPortal, closePortal} = useModal({
    id: 'templateTeamPickerModal'
  })

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

  if (!selectedTemplate) {
    return <Redirect to='/activity-library' />
  }

  const {name: templateName, prompts} = selectedTemplate

  const templateIllustration =
    activityIllustrations[selectedTemplate.id as keyof typeof activityIllustrations]
  const activityIllustration = templateIllustration ?? customTemplateIllustration

  const category = selectedTemplate.category as CategoryID

  return (
    <>
      <div className='relative flex h-full flex-col bg-white'>
        <div className='flex grow'>
          <div className='mt-4 grow'>
            <div className='mb-14 ml-4 flex h-min w-max items-center'>
              <Link
                className='mr-4'
                to={`/activity-library/category/${
                  history.location.state?.prevCategory ?? category
                }`}
              >
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
                <div>
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
                    <ActivityDetailsBadges templateRef={selectedTemplate} />
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
                                    <CloneTemplate canClone={true} onClick={togglePortal} />
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
                                onClick={togglePortal}
                              >
                                <ContentCopy className='text-slate-600' />
                                <div className='font-semibold text-slate-700'>Clone & Edit</div>
                              </FlatButton>
                            </div>
                          </div>
                        )}
                      </div>
                      <b>Reflect</b> on what’s working or not on your team. <b>Group</b> common
                      themes and vote on the hottest topics. As you <b>discuss topics</b>, create{' '}
                      <b>takeaway tasks</b> that can be integrated with your backlog.
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
                        <b>Tip:</b> push takeaway tasks to your backlog
                      </div>
                    </div>
                  </div>
                  <TemplatePromptList
                    isOwner={isOwner && isEditing}
                    prompts={prompts!}
                    templateId={templateId}
                  />
                  {isOwner && isEditing && (
                    <AddTemplatePrompt templateId={templateId} prompts={prompts!} />
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
          <div className='absolute bottom-0 flex h-20 w-full items-center justify-center bg-slate-200'>
            <button
              onClick={() => setIsEditing(false)}
              className='w-max cursor-pointer rounded-full bg-sky-500 px-10 py-3 text-center font-sans text-lg font-semibold text-white hover:bg-sky-600'
            >
              Done Editing
            </button>
          </div>
        )}
      </div>
      {modalPortal(
        <TeamPickerModal
          category={category}
          teamsRef={teams}
          templatesRef={availableTemplates.edges
            .map((edge) => edge.node)
            .filter((template) => template.type === 'retrospective')}
          closePortal={closePortal}
          parentTemplateId={selectedTemplate.id}
        />
      )}
    </>
  )
}

export default ActivityDetails
