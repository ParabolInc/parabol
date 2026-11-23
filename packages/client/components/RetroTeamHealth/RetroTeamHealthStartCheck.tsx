import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {RetroTeamHealthStartCheckQuery} from '~/__generated__/RetroTeamHealthStartCheckQuery.graphql'
import {MonitorHeart, OpenInNew} from '~/ui/icons'
import useStartTeamHealthMutation from '../../mutations/useStartTeamHealthMutation'
import {Button} from '../../ui/Button/Button'
import {isNotNull} from '../../utils/predicates'
import RetroTeamHealthTemplateOption from './RetroTeamHealthTemplateOption'

export const query = graphql`
  query RetroTeamHealthStartCheckQuery {
    viewer {
      everythingBagel: activity(activityId: "everythingBagelTemplate") {
        id
        ...RetroTeamHealthTemplateOption_template
      }
      projectAristotle: activity(activityId: "googleProjectAristotleTemplate") {
        id
        ...RetroTeamHealthTemplateOption_template
      }
      squadHealthCheck: activity(activityId: "spotifySquadHealthCheckTemplate") {
        id
        ...RetroTeamHealthTemplateOption_template
      }
    }
  }
`

interface Props {
  queryRef: PreloadedQuery<RetroTeamHealthStartCheckQuery>
  retroMeetingId: string
  teamId: string
}

const RetroTeamHealthStartCheck = (props: Props) => {
  const {queryRef, retroMeetingId, teamId} = props
  const {viewer} = usePreloadedQuery<RetroTeamHealthStartCheckQuery>(query, queryRef)
  const {everythingBagel, projectAristotle, squadHealthCheck} = viewer
  const templates = [everythingBagel, projectAristotle, squadHealthCheck].filter(isNotNull)
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id)
  const [startTeamHealth, submitting] = useStartTeamHealthMutation()
  const detailsUrl = `/activity-library/details/${selectedTemplateId}`
  const start = () => {
    if (!selectedTemplateId) return
    startTeamHealth({
      variables: {teamIds: [teamId], templateId: selectedTemplateId, retroMeetingId}
    })
  }
  return (
    <div className='flex w-full flex-col items-center gap-3 px-6 py-8'>
      <section className='flex w-full max-w-xl flex-col rounded-3xl bg-surface-card px-8 py-7 shadow-card-raised'>
        <div className='flex items-center gap-4'>
          <span className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-lilac-100 dark:bg-lilac-900'>
            <MonitorHeart className='text-grape-700 dark:text-lilac-200' />
          </span>
          <div className='flex flex-col gap-1'>
            <h2 className='m-0 font-bold text-2xl text-fg-primary'>No Team Health check is open</h2>
            <span className='text-fg-secondary text-sm'>
              Pick the questions, and everyone here answers them now.
            </span>
          </div>
        </div>
        <fieldset className='m-0 mt-5 flex min-w-0 flex-col gap-2 border-0 p-0'>
          <legend className='mb-2 p-0 font-semibold text-fg-secondary text-xs uppercase tracking-wide'>
            Quick Questions
          </legend>
          {templates.map((template) => (
            <RetroTeamHealthTemplateOption
              key={template.id}
              template={template}
              isSelected={template.id === selectedTemplateId}
              isDefault={template.id === everythingBagel?.id}
              onSelect={() => setSelectedTemplateId(template.id)}
            />
          ))}
        </fieldset>
        <div className='mt-5 flex items-center justify-between gap-4'>
          <span className='text-fg-secondary text-sm'>
            Closes when this retro ends. Answers stay anonymous.
          </span>
          <Button variant='primary' shape='default' size='lg' disabled={submitting} onClick={start}>
            Start check
          </Button>
        </div>
        <div className='mt-5 flex flex-wrap items-center justify-between gap-3 border-hairline border-t pt-4'>
          <a
            href={detailsUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-1 font-semibold text-accent text-sm'
          >
            Customize the questions
            <OpenInNew className='size-4' />
          </a>
        </div>
      </section>
      <p className='m-0 text-fg-muted text-sm'>Or press Next to skip Team Health today.</p>
    </div>
  )
}

export default RetroTeamHealthStartCheck
