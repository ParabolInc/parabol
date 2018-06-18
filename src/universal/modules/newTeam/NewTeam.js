import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import LinkButton from 'universal/components/LinkButton'
import IconLabel from 'universal/components/IconLabel'
import NewTeamForm from 'universal/modules/newTeam/components/NewTeamForm/NewTeamForm'
import {PRICING_LINK} from 'universal/utils/externalLinks'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'

const NewTeamLayout = styled('div')({
  alignItems: 'center',
  backgroundColor: ui.backgroundColor,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  width: '100%'
})

const NewTeamInner = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  minWidth: '60rem',
  paddingBottom: '10vh',
  width: '100%'
})

const HelpLayout = styled('div')({
  paddingTop: '6.75rem'
})

const HelpBlock = styled('div')({
  background: appTheme.palette.yellow30l,
  boxShadow: ui.shadow[1],
  color: appTheme.palette.dark,
  margin: '1rem 0',
  padding: '.75rem',
  textAlign: 'center',
  width: '15rem'
})

const HelpHeading = styled('div')({
  fontSize: appTheme.typography.s4,
  fontWeight: 600,
  margin: 0
})

const HelpCopy = styled('div')({
  fontSize: appTheme.typography.s2,
  lineHeight: appTheme.typography.s4,
  margin: '.5rem 0'
})

const LearnMoreLink = styled(LinkButton)({
  height: '2rem',
  margin: '0 auto'
})

const NewTeam = (props) => {
  const {defaultOrgId, viewer} = props

  const {organizations} = viewer
  const firstOrgId = organizations[0] && organizations[0].id
  const orgId = organizations.find((org) => org.id === defaultOrgId) ? defaultOrgId : firstOrgId
  return (
    <NewTeamLayout>
      <NewTeamInner>
        <NewTeamForm
          defaultOrgId={defaultOrgId}
          initialValues={{orgId, isNewOrganization: String(!defaultOrgId)}}
          organizations={organizations}
        />
        <HelpLayout>
          <HelpBlock>
            <HelpHeading>{'What’s an Organization?'}</HelpHeading>
            <HelpCopy>
              {`It’s the billing entity for a group of teams
              such as a company, non-profit, or
              for your personal use. Once created, you can
              create teams and invite others, even if they
              don't share your email domain.`}
            </HelpCopy>
            <HelpCopy>
              {'New Organizations start out on the '}
              <b>{'Free Personal Plan'}</b>
              {'.'}
            </HelpCopy>
            <LearnMoreLink palette='warm' onClick={() => window.open(PRICING_LINK, '_blank')}>
              <IconLabel icon={ui.iconExternalLink} iconAfter label='Learn More' />
            </LearnMoreLink>
          </HelpBlock>
        </HelpLayout>
      </NewTeamInner>
    </NewTeamLayout>
  )
}

NewTeam.propTypes = {
  defaultOrgId: PropTypes.string,
  viewer: PropTypes.object.isRequired
}

export default createFragmentContainer(
  NewTeam,
  graphql`
    fragment NewTeam_viewer on User {
      organizations {
        id
        name
        tier
      }
    }
  `
)
