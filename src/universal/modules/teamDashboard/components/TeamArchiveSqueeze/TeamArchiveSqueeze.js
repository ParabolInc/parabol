import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {createRefetchContainer} from 'react-relay'
import withRouter from 'react-router-dom/es/withRouter'
import PrimaryButton from 'universal/components/PrimaryButton'
import Panel from 'universal/components/Panel/Panel'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import {PERSONAL_LABEL, PRO_LABEL} from 'universal/utils/constants'
import {PRICING_LINK} from 'universal/utils/externalLinks'
import styled from 'react-emotion'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

const ArchiveSqueezeOuter = styled('div')({
  margin: '0 auto',
  maxWidth: '56rem',
  minWidth: 0
})

const ArchiveSqueezeInner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  padding: ui.rowGutter
})

const ArchiveSqueezeContent = styled('div')({
  padding: '0 .5rem 1rem'
})

const ArchiveSqueezeHeading = styled('h2')({
  color: ui.palette.mid,
  fontSize: appTheme.typography.s6,
  lineHeight: 1.5,
  margin: '.5rem 0'
})

const ArchiveSqueezeCopy = styled('p')({
  color: ui.palette.dark,
  lineHeight: 1.75,
  fontSize: appTheme.typography.sBase
})

const ArchiveSqueezeButtonBlock = styled('div')({
  padding: '0 1rem'
})

const ContactCopy = styled('div')({
  color: ui.palette.dark,
  fontSize: appTheme.typography.sBase,
  lineHeight: 1.5,
  textAlign: 'center'
})

const ContactLink = styled('a')({
  display: 'block',
  fontSize: 0,
  fontWeight: 600
})

const ContactLinkLabel = styled('div')({
  display: 'inline-block',
  fontSize: appTheme.typography.s6,
  paddingRight: '.25rem',
  verticalAlign: 'middle'
})

const linkLabel = 'Compare Plans'

const StyledIcon = styled(Icon)({
  fontSize: MD_ICONS_SIZE_18,
  marginLeft: '.25rem',
  verticalAlign: 'middle'
})

class TeamArchiveSqueeze extends Component {
  componentWillReceiveProps (nextProps) {
    const {
      tasksAvailableCount: oldCount,
      relay: {refetch}
    } = this.props
    const {tasksAvailableCount: newCount} = nextProps
    if (newCount !== oldCount) {
      refetch()
    }
  }
  render () {
    const {history, orgId, tasksAvailableCount, viewer} = this.props
    const {
      archivedTasksCount,
      team: {
        organization: {isBillingLeader, mainBillingLeader}
      }
    } = viewer
    const unavailableTasks = archivedTasksCount - tasksAvailableCount
    if (unavailableTasks < 1) {
      // https://github.com/reactjs/react-transition-group/issues/208
      return <br />
    }
    const handleUpgrade = () => {
      history.push(`/me/organizations/${orgId}`)
    }
    return (
      <ArchiveSqueezeOuter>
        <Panel bgTheme='light'>
          <ArchiveSqueezeInner>
            <ArchiveSqueezeContent>
              <ArchiveSqueezeHeading>
                {`${unavailableTasks} Cards Unavailable!`}
              </ArchiveSqueezeHeading>
              <ArchiveSqueezeCopy>
                {'With the '}
                <b>{`${PERSONAL_LABEL} Plan`}</b>
                {' you can see cards archived up to '}
                <b>{'14 days ago'}</b>
                {'.'}
                <br />
                {'For full access to your team’s archive, upgrade to the '}
                <b>{`${PRO_LABEL} Plan`}</b>
                {'.'}
                <br />
                <a href={PRICING_LINK} target='_blank' title={linkLabel}>
                  <b>{linkLabel}</b> <StyledIcon>{ui.iconExternalLink}</StyledIcon>
                </a>
              </ArchiveSqueezeCopy>
            </ArchiveSqueezeContent>
            <ArchiveSqueezeButtonBlock>
              {isBillingLeader ? (
                <PrimaryButton size='medium' onClick={handleUpgrade}>
                  {`Upgrade to the ${PRO_LABEL} Plan`}
                </PrimaryButton>
              ) : (
                <ContactCopy>
                  {'Talk with your '}
                  <b>{'Billing Leader'}</b>
                  {':'}
                  <ContactLink
                    href={`mailto:${mainBillingLeader.email}`}
                    title={`Email: ${mainBillingLeader.email}`}
                  >
                    <ContactLinkLabel>{mainBillingLeader.preferredName}</ContactLinkLabel>
                    <StyledIcon>email</StyledIcon>
                  </ContactLink>
                </ContactCopy>
              )}
            </ArchiveSqueezeButtonBlock>
          </ArchiveSqueezeInner>
        </Panel>
      </ArchiveSqueezeOuter>
    )
  }
}

TeamArchiveSqueeze.propTypes = {
  history: PropTypes.object.isRequired,
  orgId: PropTypes.string.isRequired,
  tasksAvailableCount: PropTypes.number,
  relay: PropTypes.object.isRequired,
  viewer: PropTypes.object.isRequired
}

export default createRefetchContainer(
  withRouter(TeamArchiveSqueeze),
  graphql`
    fragment TeamArchiveSqueeze_viewer on User {
      archivedTasksCount(teamId: $teamId)
      team(teamId: $teamId) {
        organization {
          isBillingLeader
          mainBillingLeader {
            preferredName
            email
          }
        }
      }
    }
  `,
  graphql`
    query TeamArchiveSqueezeRefetchQuery($teamId: ID!) {
      viewer {
        archivedTasksCount(teamId: $teamId)
      }
    }
  `
)
