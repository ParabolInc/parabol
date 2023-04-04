import graphql from 'babel-plugin-relay/macro'
import React, {useCallback} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect, useHistory} from 'react-router'

import {ActivityDetailsQuery} from '~/__generated__/ActivityDetailsQuery.graphql'
import {Link} from 'react-router-dom'
import IconLabel from '../IconLabel'
import EditableTemplateName from '../../modules/meeting/components/EditableTemplateName'
import TemplatePromptList from '../../modules/meeting/components/TemplatePromptList'
import AddTemplatePrompt from '../../modules/meeting/components/AddTemplatePrompt'
import {ActivityCard, CategoryID, MeetingThemes} from './ActivityCard'
import {activityIllustrations} from './ActivityIllustrations'
import customTemplateIllustration from '../../../../static/images/illustrations/customTemplate.png'
import makeTemplateDescription from '../../utils/makeTemplateDescription'
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
import {CATEGORY_ID_TO_NAME} from './ActivityLibrary'

const query = graphql`
  query ActivityDetailsQuery {
    viewer {
      tier
      availableTemplates(first: 100) @connection(key: "ActivityDetails_availableTemplates") {
        edges {
          node {
            id
            name
            type
            category
            orgId
            isFree
            ...RemoveTemplate_teamTemplates
            ...EditableTemplateName_teamTemplates
            ...ReflectTemplateDetailsTemplate @relay(mask: false)
          }
        }
      }
      teams {
        id
      }
      organizations {
        id
      }
      featureFlags {
        templateLimit
        retrosInDisguise
      }

      ...makeTemplateDescription_viewer
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

  const history = useHistory()

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

  if (!selectedTemplate) {
    return <Redirect to='/activity-library' />
  }

  const {name: templateName, prompts} = selectedTemplate
  const teamIds = teams.map((team) => team.id)
  const orgIds = organizations.map((org) => org.id)

  const isOwner = teamIds.includes(selectedTemplate.teamId!)

  const teamTemplates = availableTemplates.edges
    .map((edge) => edge.node)
    .filter((edge) => edge.teamId === selectedTemplate.teamId)

  const lowestScope = isOwner
    ? 'TEAM'
    : orgIds.includes(selectedTemplate.orgId)
    ? 'ORGANIZATION'
    : 'PUBLIC'
  const description = makeTemplateDescription(lowestScope, selectedTemplate, viewer, tier)

  const templateIllustration =
    activityIllustrations[selectedTemplate.id as keyof typeof activityIllustrations]
  const activityIllustration = templateIllustration ?? customTemplateIllustration

  const category = selectedTemplate.category as CategoryID

  return (
    <div className='flex h-full bg-white'>
      <div className='ml-4 mt-4'>
        <div className='flex w-max items-center'>
          <Link className='mr-4' to='/activity-library'>
            <IconLabel icon={'arrow_back'} iconLarge />
          </Link>
          <div className='w-max text-xl font-semibold'>Start Activity</div>
        </div>
      </div>
      <div className='mt-14 flex w-full justify-center'>
        <div className='mx-auto flex justify-center'>
          <ActivityCard
            className='h-[200px] w-80'
            category={category}
            imageSrc={activityIllustration}
            badge={null}
          />
          <div className='mx-auto'>
            <div className='mb-10 pl-14'>
              <div className='mb-2 flex h-8 items-center'>
                <EditableTemplateName
                  className='text-[32px]'
                  key={templateId}
                  name={templateName}
                  templateId={templateId}
                  teamTemplates={teamTemplates}
                  isOwner={isOwner}
                />
              </div>
              <div className='mb-4 flex gap-2'>
                <DetailsBadge className={clsx(MeetingThemes[category].primary, 'text-white')}>
                  {CATEGORY_ID_TO_NAME[category]}
                </DetailsBadge>
                {!selectedTemplate.isFree &&
                  (lowestScope === 'PUBLIC' ? (
                    <DetailsBadge className='bg-gold-300 text-grape-700'>Premium</DetailsBadge>
                  ) : (
                    <DetailsBadge className='bg-grape-700 text-white'>Custom</DetailsBadge>
                  ))}
              </div>
              <div className='mb-8'>
                {isOwner ? (
                  <div className='flex items-center justify-between'>
                    <div className='w-max rounded-full border border-solid border-slate-400 pl-3'>
                      <UnstyledTemplateSharing
                        noModal={true}
                        isOwner={isOwner}
                        template={selectedTemplate}
                      />
                    </div>
                    <div className='rounded-full border border-solid border-slate-400'>
                      <DetailAction
                        icon={'delete'}
                        tooltip={'Delete template'}
                        onClick={removeTemplate}
                      />
                    </div>
                  </div>
                ) : (
                  <div className='py-2 text-sm font-semibold text-slate-600'>{description}</div>
                )}
              </div>

              <div className='w-[480px]'>
                <b>Reflect</b> on what’s working or not on your team. <b>Group</b> common themes and
                vote on the hottest topics. As you <b>discuss topics</b>, create{' '}
                <b>takeaway tasks</b> that can be integrated with your backlog.
              </div>
              <div className='mt-[18px] flex items-center'>
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
            <TemplatePromptList isOwner={isOwner} prompts={prompts!} templateId={templateId} />
            {isOwner && <AddTemplatePrompt templateId={templateId} prompts={prompts!} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityDetails
