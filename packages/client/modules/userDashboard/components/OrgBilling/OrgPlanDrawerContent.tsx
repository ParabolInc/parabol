import React from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV3'
import {EnterpriseBenefits, TeamBenefits} from '../../../../utils/constants'
import {upperFirst} from '../../../../utils/upperFirst'
import {TierEnum} from '../../../../__generated__/DowngradeToStarterMutation.graphql'

const List = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  padding: '16px 0px',
  position: 'relative',
  width: '100%'
})

const DrawerContent = styled('div')({
  backgroundColor: PALETTE.WHITE,
  display: 'flex',
  overflowY: 'auto',
  padding: 16,
  height: '100vh',
  flexDirection: 'column'
})

const Title = styled('span')({
  fontWeight: 600,
  fontSize: 20
})

const Subtitle = styled('span')({
  fontWeight: 600,
  paddingBottom: 8
})

const UL = styled('ul')({
  margin: 0
})

const LI = styled('li')({
  fontSize: 16,
  lineHeight: '28px',
  color: PALETTE.SLATE_900,
  textTransform: 'none',
  fontWeight: 400,
  textAlign: 'left',
  listStyleType: 'disc'
})

const Link = styled('a')({
  color: PALETTE.SKY_500,
  fontWeight: 600,
  textDecoration: 'none',
  '&:hover, &:focus': {
    color: PALETTE.SKY_500,
    textDecoration: 'underline'
  }
})

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
                <Link href={feature.url} target='_blank' rel='noopener noreferrer'>
                  {`${feature.title}: `}
                </Link>
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
                <Link href={resource.url} target='_blank' rel='noopener noreferrer'>
                  {resource.title}
                </Link>
              </LI>
            ))}
          </UL>
        </List>
        <List>
          <Subtitle>{'Other resources for effective agile teams: '}</Subtitle>
          <UL>
            {additionalStarterResources.map((resource) => (
              <LI key={resource.url}>
                <Link href={resource.url} target='_blank' rel='noopener noreferrer'>
                  {resource.title}
                </Link>
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
              <Link href={resource.url} target='_blank' rel='noopener noreferrer'>
                {resource.title}
              </Link>
            </LI>
          ))}
        </UL>
      </List>
      <List>
        <Subtitle>{'Make the most out of Parabol:'}</Subtitle>
        <UL>
          <LI>
            {'Cover all of your agile meetings - '}
            <Link href={enterpriseResources.retros} target='_blank' rel='noopener noreferrer'>
              {'retros, '}
            </Link>
            <Link target='_blank' rel='noopener noreferrer' href={enterpriseResources.estimation}>
              {'estimation'}
            </Link>
            {' & '}
            <Link target='_blank' rel='noopener noreferrer' href={enterpriseResources.standups}>
              {'standups'}
            </Link>
          </LI>
          <LI>
            <Link target='_blank' rel='noopener noreferrer' href={enterpriseResources.templates}>
              {'40+ Meeting Templates'}
            </Link>
          </LI>
          <LI>
            <Link target='_blank' rel='noopener noreferrer' href={enterpriseResources.integrations}>
              {'Integrate with Jira, Slack & More'}
            </Link>
          </LI>
        </UL>
      </List>
    </DrawerContent>
  )
}

export default OrgPlanDrawerContent
