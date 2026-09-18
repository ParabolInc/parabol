import type {ReactNode} from 'react'
import {Link} from 'react-router'
import {Notifications, NotificationsOff} from '~/ui/icons'
import {getProviderAnchorId} from '../../modules/teamDashboard/components/ProviderRow/ProviderRowEntry'
import {Providers} from '../../types/constEnums'
import MattermostSVG from '../MattermostSVG'
import MSTeamsSVG from '../MSTeamsSVG'
import SlackSVG from '../SlackSVG'

export type ReminderService = 'Slack' | 'Mattermost' | 'Teams'

interface Props {
  services: ReminderService[]
  isOn: boolean
  isSpectating: boolean
  teamId: string
}

const serviceIcons = {
  Slack: <SlackSVG />,
  Mattermost: (
    <span className='[&_path]:fill-current'>
      <MattermostSVG />
    </span>
  ),
  Teams: <MSTeamsSVG />
} satisfies Record<ReminderService, ReactNode>

const providerNames = {
  Slack: Providers.SLACK_NAME,
  Mattermost: Providers.MATTERMOST_NAME,
  Teams: Providers.MSTEAMS_NAME
} satisfies Record<ReminderService, string>

const TeamHealthReminderStatus = (props: Props) => {
  const {services, isOn, isSpectating, teamId} = props
  const label = isSpectating
    ? isOn
      ? 'Your team gets a reminder the day before this closes'
      : 'Reminders are disabled'
    : isOn
      ? "You'll get a reminder the day before this closes"
      : 'Your team health reminders are disabled'
  const getSettingsUrl = (service: ReminderService) =>
    `/team/${teamId}/integrations#${getProviderAnchorId(providerNames[service])}`
  const icons = services.map((service) => <span key={service}>{serviceIcons[service]}</span>)
  const rowClassName = 'mt-4 flex flex-wrap items-center justify-center gap-2 text-fg-muted text-sm'
  const iconsClassName = 'flex items-center gap-1.5 [&_svg]:h-4 [&_svg]:w-4'
  if (!isOn) {
    return (
      <Link
        to={getSettingsUrl(services[0] ?? 'Slack')}
        className={`${rowClassName} rounded-sm hover:text-fg-secondary hover:underline focus-visible:outline-accent`}
      >
        <NotificationsOff fontSize='small' />
        <span>{label}</span>
        <span className={iconsClassName}>{icons}</span>
      </Link>
    )
  }
  return (
    <div className={rowClassName}>
      <Notifications fontSize='small' />
      <span>{label}</span>
      <span className={iconsClassName}>
        {services.map((service) => (
          <Link
            key={service}
            to={getSettingsUrl(service)}
            title={`${service} notification settings`}
            className='rounded-sm hover:opacity-80 focus-visible:outline-accent'
          >
            {serviceIcons[service]}
          </Link>
        ))}
      </span>
    </div>
  )
}

export default TeamHealthReminderStatus
