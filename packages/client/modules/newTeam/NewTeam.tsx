import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import LinkButton from '../../components/LinkButton'
import IconLabel from '../../components/IconLabel'
import {PRICING_LINK} from '../../utils/externalLinks'
import styled from '@emotion/styled'
import ui from '../../styles/ui'
import {cardShadow} from '../../styles/elevation'
import appTheme from '../../styles/theme/appTheme'
import NewTeamForm from './components/NewTeamForm/NewTeamForm'
import {DASH_SIDEBAR} from '../../components/Dashboard/DashSidebar'
import useBreakpoint from '../../hooks/useBreakpoint'
import {NewTeam_viewer} from '../../__generated__/NewTeam_viewer.graphql'

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
  maxWidth: 960,
  width: '100%'
})

const HelpLayout = styled('div')({
  paddingTop: '6.75rem'
})

const HelpBlock = styled('div')({
  backgroundColor: 'white',
  borderRadius: 4,
  boxShadow: cardShadow,
  color: appTheme.palette.dark,
  margin: '1rem 0',
  padding: 16,
  width: '17rem'
})

const HelpHeading = styled('div')({
  fontSize: 16,
  fontWeight: 600,
  lineHeight: 1.5,
  margin: 0
})

const HelpCopy = styled('div')({
  fontSize: 12,
  lineHeight: 1.5,
  margin: '.5rem 0'
})

const LearnMoreLink = styled(LinkButton)({
  height: '2rem',
  margin: '0 auto'
})

interface Props {
  defaultOrgId: string
  viewer: NewTeam_viewer
}

const NewTeam = (props: Props) => {
  const {defaultOrgId, viewer} = props
  const {organizations} = viewer
  const isDesktop = useBreakpoint(DASH_SIDEBAR.BREAKPOINT)
  return (
    <NewTeamLayout>
      <NewTeamInner>
        <NewTeamForm isNewOrganization={!defaultOrgId} organizations={organizations} />
        {isDesktop && (
          <HelpLayout>
            <HelpBlock>
              <HelpHeading>{'What’s an Organization?'}</HelpHeading>
              <HelpCopy>
                {`It’s the billing entity for a group of teams
                such as a company, non-profit, or
                for your personal use. Once created, you can
                create teams and invite others, even if they
                don't share your email domain. New Organizations
                start out on the Free Personal Plan.`}
              </HelpCopy>
              <LearnMoreLink palette='blue' onClick={() => window.open(PRICING_LINK, '_blank')}>
                <IconLabel icon={ui.iconExternalLink} iconAfter label='Learn More' />
              </LearnMoreLink>
            </HelpBlock>
          </HelpLayout>
        )}
      </NewTeamInner>
    </NewTeamLayout>
  )
}

export default createFragmentContainer(NewTeam, {
  viewer: graphql`
    fragment NewTeam_viewer on User {
      organizations {
        id
        ...NewTeamForm_organizations
      }
    }
  `
})
