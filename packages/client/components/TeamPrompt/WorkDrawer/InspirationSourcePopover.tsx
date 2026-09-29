import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {InspirationSourcePopover_teamMember$key} from '../../../__generated__/InspirationSourcePopover_teamMember.graphql'
import {Spinner} from '../../../ui/Spinner/Spinner'
import Ellipsis from '../../Ellipsis/Ellipsis'
import GitHubRepoFilterBar from './GitHubRepoFilterBar'
import InspirationKindSwitch from './InspirationKindSwitch'
import InspirationSourceConnectButton from './InspirationSourceConnectButton'
import InspirationSourceLogo from './InspirationSourceLogo'
import {issueCountLabel, serviceLabel} from './inspirationCopy'
import {
  INSPIRATION_SOURCE_KINDS,
  type InspirationSourceService,
  type InspirationSourceSettings
} from './inspirationSources'
import JiraProjectFilterBar from './JiraProjectFilterBar'
import LinearProjectFilterBar from './LinearProjectFilterBar'

interface Props {
  service: InspirationSourceService
  isConnected: boolean
  issueCount: number | undefined
  drafting: boolean
  meetingId: string
  settings: InspirationSourceSettings
  setSettings: (update: (prev: InspirationSourceSettings) => InspirationSourceSettings) => void
  teamMemberRef: InspirationSourcePopover_teamMember$key
}

const InspirationSourcePopover = (props: Props) => {
  const {
    service,
    isConnected,
    issueCount,
    drafting,
    meetingId,
    settings,
    setSettings,
    teamMemberRef
  } = props
  const teamMember = useFragment(
    graphql`
      fragment InspirationSourcePopover_teamMember on TeamMember {
        ...InspirationSourceConnectButton_teamMember
        ...GitHubRepoFilterBar_teamMember
        ...JiraProjectFilterBar_teamMember @defer
        ...LinearProjectFilterBar_teamMember
      }
    `,
    teamMemberRef
  )
  const label = serviceLabel(service)
  const enabledKinds = settings.kinds[service]
  const kinds = INSPIRATION_SOURCE_KINDS[service]
  const toggleKind = (kind: string, checked: boolean) =>
    setSettings((prev) => {
      const current = prev.kinds[service]
      const next = checked ? [...current, kind] : current.filter((key) => key !== kind)
      return {...prev, kinds: {...prev.kinds, [service]: next}}
    })
  const isIncluded = isConnected && enabledKinds.length > 0

  return (
    <div className='flex w-76 flex-col gap-3 p-4'>
      <div className='flex items-center gap-3'>
        <div className='flex h-8 w-8 items-center justify-center'>
          <InspirationSourceLogo service={service} />
        </div>
        <div className='flex flex-col'>
          <span className='font-semibold text-fg-primary text-sm'>{label}</span>
          <span className='text-fg-muted text-xs'>
            {!isIncluded ? (
              'Not in your draft'
            ) : drafting ? (
              <>
                Counting items
                <Ellipsis />
              </>
            ) : (
              issueCountLabel(issueCount)
            )}
          </span>
        </div>
      </div>
      {isConnected ? (
        <>
          <div className='flex flex-col border-hairline border-y py-0.5'>
            {kinds.map(({key, label: kindLabel}) => (
              <InspirationKindSwitch
                key={key}
                label={kindLabel}
                checked={enabledKinds.includes(key)}
                onCheckedChange={(checked) => toggleKind(key, checked)}
              />
            ))}
          </div>
          <Suspense fallback={<Spinner className='size-5 self-center' />}>
            {service === 'github' && (
              <GitHubRepoFilterBar
                teamMemberRef={teamMember}
                selectedRepos={settings.githubRepos}
                setSelectedRepos={(githubRepos) => setSettings((prev) => ({...prev, githubRepos}))}
              />
            )}
            {service === 'jira' && (
              <JiraProjectFilterBar
                teamMemberRef={teamMember}
                selectedProjectIds={settings.jiraProjectIds}
                setSelectedProjectIds={(jiraProjectIds) =>
                  setSettings((prev) => ({...prev, jiraProjectIds}))
                }
              />
            )}
            {service === 'linear' && (
              <LinearProjectFilterBar
                className='m-0'
                teamMemberRef={teamMember}
                selectedLinearIds={settings.linearIds}
                setSelectedLinearIds={(linearIds) => setSettings((prev) => ({...prev, linearIds}))}
              />
            )}
          </Suspense>
          <p className='m-0 text-fg-muted text-xs'>
            {kinds.length > 1
              ? `Turn everything off to leave ${label} out of your draft.`
              : `Turn this off to leave ${label} out of your draft.`}
          </p>
        </>
      ) : (
        <InspirationSourceConnectButton
          service={service}
          meetingId={meetingId}
          teamMemberRef={teamMember}
        />
      )}
    </div>
  )
}

export default InspirationSourcePopover
