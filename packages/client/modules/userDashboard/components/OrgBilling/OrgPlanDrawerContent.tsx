import type {ReactNode} from 'react'
import type {TierEnum} from '../../../../__generated__/DowngradeToStarterMutation.graphql'
import {EnterpriseBenefits, TeamBenefits} from '../../../../utils/constants'
import {upperFirst} from '../../../../utils/upperFirst'

const List = (props: {children: ReactNode}) => (
  <div className='relative flex w-full flex-col py-4'>{props.children}</div>
)

const DrawerContent = (props: {children: ReactNode}) => (
  <div className='flex flex-col overflow-y-auto bg-surface-card p-4'>{props.children}</div>
)

const Title = (props: {children: ReactNode}) => (
  <span className='font-semibold text-[20px]'>{props.children}</span>
)

const Subtitle = (props: {children: ReactNode}) => (
  <span className='pb-2 font-semibold'>{props.children}</span>
)

const UL = (props: {children: ReactNode}) => <ul className='m-0'>{props.children}</ul>

const LI = (props: {children: ReactNode}) => (
  <li className='list-disc text-left font-normal text-[16px] text-fg-primary normal-case leading-[28px]'>
    {props.children}
  </li>
)

const Link = (props: {children: ReactNode; href: string}) => (
  <a
    className='font-semibold text-accent no-underline hover:text-accent hover:underline focus:text-accent focus:underline'
    href={props.href}
    target='_blank'
    rel='noopener noreferrer'
  >
    {props.children}
  </a>
)

const starterAgileResources = [
  {
    title: 'Invite your team',
    url: 'https://www.parabol.co/support-categories/inviting-and-joining/#invite-team'
  },
  {
    title: 'Integrate with Jira, Slack & More',
    url: 'https://www.parabol.co/integrations/'
  },
  {
    title: 'Get help if you need it',
    url: 'https://www.parabol.co/support/'
  }
]

const additionalStarterResources = [
  {
    title: '50+ Retrospective Questions for your Next Meeting',
    url: 'https://www.parabol.co/resources/retrospective-questions/'
  },
  {
    title: 'Fresh Retrospective Ideas for New Agile Teams',
    url: 'https://www.parabol.co/blog/retrospective-ideas-new-agile-teams/'
  },
  {
    title: '8 Facilitation Tips for Fun & Effective Retros',
    url: 'https://www.parabol.co/blog/sprint-retrospective-facilitator-pro-tips/'
  }
]

const agileResources = [
  {
    title: '57 Daily Standup Questions for More Engaging Updates',
    url: 'https://www.parabol.co/resources/daily-standup-questions/'
  },
  {
    title: '29 Effective Meeting Tips for Advanced Facilitators',
    url: 'https://www.parabol.co/blog/effective-meeting-tips/'
  },
  {
    title: '50+ Retrospective Questions for your Next Meeting',
    url: 'https://www.parabol.co/resources/retrospective-questions/'
  },
  {
    title: '8 Agile Estimation Techniques to Try With your Team',
    url: 'https://www.parabol.co/blog/agile-estimation-techniques/'
  }
]

const enterpriseResources = {
  retros: 'https://www.parabol.co/agile/retrospectives/',
  estimation: 'https://www.parabol.co/agile/sprint-poker/',
  standups: 'https://www.parabol.co/agile/online-standup-tool/',
  templates: 'https://www.parabol.co/templates/',
  integrations: 'https://www.parabol.co/integrations/'
}

const featuresLookup = {
  team: TeamBenefits,
  enterprise: EnterpriseBenefits
} as const

const starterFeatures = [
  {
    title: 'Retrospectives',
    url: 'https://www.parabol.co/agile/retrospectives/',
    description: 'reflect on your work, find themes, and evolve as a team.'
  },
  {
    title: 'Estimation',
    url: 'https://www.parabol.co/agile/sprint-poker/',
    description:
      'Sync issues from your backlog management tool and collaborate on estimation with a fun digital deck.'
  },
  {
    title: 'Standups',
    url: 'https://www.parabol.co/agile/online-standup-tool/',
    description: 'Share and review updates on your own time.'
  }
]

type Props = {
  tier: TierEnum
}

const OrgPlanDrawerContent = (props: Props) => {
  const {tier} = props
  if (tier === 'starter') {
    return (
      <DrawerContent>
        <Title>{'🎉 Welcome to Parabol!'}</Title>
        <List>
          <Subtitle>{'Parabol is your all-in-one agile meeting toolkit, including: '}</Subtitle>
          <UL>
            {starterFeatures.map((feature) => (
              <LI key={feature.url}>
                <Link href={feature.url}>{`${feature.title}: `}</Link>
                {feature.description}
              </LI>
            ))}
          </UL>
        </List>
        <List>
          <Subtitle>{'Make the most out of Parabol: '}</Subtitle>
          <UL>
            {starterAgileResources.map((resource) => (
              <LI key={resource.url}>
                <Link href={resource.url}>{resource.title}</Link>
              </LI>
            ))}
          </UL>
        </List>
        <List>
          <Subtitle>{'Other resources for effective agile teams: '}</Subtitle>
          <UL>
            {additionalStarterResources.map((resource) => (
              <LI key={resource.url}>
                <Link href={resource.url}>{resource.title}</Link>
              </LI>
            ))}
          </UL>
        </List>
      </DrawerContent>
    )
  }

  const subtitle = `In addition to the features on the ${
    tier === 'team' ? 'Starter' : 'Team'
  } plan, you now have access to: `
  return (
    <DrawerContent>
      <Title>{`🎉 Welcome to the ${upperFirst(tier)} Plan!`}</Title>
      <List>
        <Subtitle>{subtitle}</Subtitle>
        <UL>
          {featuresLookup[tier].map((feature) => (
            <LI key={feature}>{feature}</LI>
          ))}
        </UL>
      </List>
      <List>
        <Subtitle>{'Resources for effective agile teams: '}</Subtitle>
        <UL>
          {agileResources.map((resource) => (
            <LI key={resource.title}>
              <Link href={resource.url}>{resource.title}</Link>
            </LI>
          ))}
        </UL>
      </List>
      <List>
        <Subtitle>{'Make the most out of Parabol:'}</Subtitle>
        <UL>
          <LI>
            {'Cover all of your agile meetings - '}
            <Link href={enterpriseResources.retros}>{'retros, '}</Link>
            <Link href={enterpriseResources.estimation}>{'estimation'}</Link>
            {' & '}
            <Link href={enterpriseResources.standups}>{'standups'}</Link>
          </LI>
          <LI>
            <Link href={enterpriseResources.templates}>{'40+ Meeting Templates'}</Link>
          </LI>
          <LI>
            <Link href={enterpriseResources.integrations}>
              {'Integrate with Jira, Slack & More'}
            </Link>
          </LI>
        </UL>
      </List>
    </DrawerContent>
  )
}

export default OrgPlanDrawerContent
