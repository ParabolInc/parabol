import graphql from 'babel-plugin-relay/macro'
import React, {useCallback, useState} from 'react'
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
import NewMeetingTeamPicker from '../NewMeetingTeamPicker'
import {MenuPosition} from '../../hooks/useCoords'
import sortByTier from '../../utils/sortByTier'
import NewMeetingSettingsToggleCheckIn from '../NewMeetingSettingsToggleCheckIn'
import NewMeetingSettingsToggleAnonymity from '../NewMeetingSettingsToggleAnonymity'
import NewMeetingActionsCurrentMeetings from '../NewMeetingActionsCurrentMeetings'
import FlatPrimaryButton from '../FlatPrimaryButton'

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
            teamId
            isFree
            scope
            ...RemoveTemplate_teamTemplates
            ...EditableTemplateName_teamTemplates
            ...ReflectTemplateDetailsTemplate @relay(mask: false)
          }
        }
      }
      teams {
        ...NewMeetingTeamPicker_selectedTeam
        ...NewMeetingTeamPicker_teams
        ...NewMeetingSettings_selectedTeam
        ...NewMeetingActionsCurrentMeetings_team
        id
        lastMeetingType
        name
        tier
        orgId
        retroSettings: meetingSettings(meetingType: retrospective) {
          ...NewMeetingSettingsToggleCheckIn_settings
          ...NewMeetingSettingsToggleAnonymity_settings
        }
      }
      organizations {
        id
      }
      featureFlags {
        templateLimit
        retrosInDisguise
      }

      ...makeTemplateDescription_viewer
      ...NewMeetingSettings_viewer
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

  const templateTeam = teams.find((team) => team.id === selectedTemplate.teamId)

  const [selectedTeam, setSelectedTeam] = useState(templateTeam ?? sortByTier(teams)[0]!)

  const availableTeams =
    selectedTemplate.scope === 'PUBLIC'
      ? teams
      : selectedTemplate.scope === 'ORGANIZATION'
      ? teams.filter((team) => team.orgId === selectedTemplate.orgId)
      : templateTeam
      ? [templateTeam]
      : []

  return (
    <div className='flex h-full bg-white'>
      <div className='mt-4 grow'>
        <div className='mb-14 ml-4 flex h-min w-max items-center'>
          <Link
            className='mr-4'
            to={`/activity-library/category/${history.location.state?.prevCategory ?? category}`}
          >
            <IconLabel icon={'arrow_back'} iconLarge />
          </Link>
          <div className='w-max text-xl font-semibold'>Start Activity</div>
        </div>
        <div className='mx-auto flex w-min flex-col justify-start xl:flex-row xl:justify-center'>
          <ActivityCard
            className='ml-14 mb-8 h-[200px] w-80 xl:ml-0 xl:mb-0'
            category={category}
            imageSrc={activityIllustration}
            badge={null}
          />
          <div>
            <div className='mb-10 pl-14'>
              <div className='mb-2 flex min-h-[40px] items-center'>
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
      <div className='flex w-96 flex-col border-l border-solid border-slate-300 px-4 pb-9 pt-14'>
        <div className='mb-6 text-xl font-semibold'>Settings</div>

        <div className='flex grow flex-col gap-2'>
          {availableTeams && (
            <NewMeetingTeamPicker
              noModal={true}
              positionOverride={MenuPosition.UPPER_LEFT}
              onSelectTeam={(teamId) => {
                const newTeam = availableTeams.find((team) => team.id === teamId)
                newTeam && setSelectedTeam(newTeam)
              }}
              selectedTeamRef={selectedTeam}
              teamsRef={availableTeams}
            />
          )}

          <NewMeetingSettingsToggleCheckIn settingsRef={selectedTeam.retroSettings} />
          <NewMeetingSettingsToggleAnonymity settingsRef={selectedTeam.retroSettings} />
          <div className='flex grow flex-col justify-end gap-2'>
            <NewMeetingActionsCurrentMeetings noModal={true} team={selectedTeam} />
            <FlatPrimaryButton className='h-14'>
              <div className='text-lg'>Start Activity</div>
            </FlatPrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityDetails
