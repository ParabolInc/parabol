import PropTypes from 'prop-types'
import React from 'react'
import FontAwesome from 'react-fontawesome'
import {createFragmentContainer} from 'react-relay'
import {withRouter} from 'react-router-dom'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import {GITHUB, GITHUB_SCOPE, SLACK, SLACK_SCOPE} from 'universal/utils/constants'
import makeHref from 'universal/utils/makeHref'
import styled, {css} from 'react-emotion'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import RowActions from 'universal/components/Row/RowActions'
import ConditionalLink from 'universal/components/ConditionalLink/ConditionalLink'
import RowInfo from 'universal/components/Row/RowInfo'
import RowInfoCopy from 'universal/components/Row/RowInfoCopy'
import RaisedButton from 'universal/components/RaisedButton'
import Row from 'universal/components/Row/Row'

const StyledButton = styled(RaisedButton)({
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

const StyledRow = styled(Row)({
  justifyContent: 'flex-start'
})

const ProviderAvatar = styled('div')(({backgroundColor}) => ({
  backgroundColor,
  borderRadius: ui.providerIconBorderRadius
}))

const ProviderIcon = styled(StyledFontAwesome)({
  alignItems: 'center',
  color: ui.palette.white,
  display: 'flex',
  fontSize: ui.iconSize2x,
  height: ui.providerIconSize,
  justifyContent: 'center',
  width: ui.providerIconSize
})

const providerRowContent = {
  color: ui.providerName.color,
  display: 'block',
  ':hover, :focus': {
    color: ui.providerName.color
  }
}

const NameAndMeta = styled('div')({
  display: 'flex',
  alignItems: 'center'
})

const ProviderMeta = styled('div')({
  color: appTheme.palette.mid,
  display: 'inline-block',
  fontSize: 0,
  height: '1rem',
  lineHeight: appTheme.typography.s3,
  padding: '0 0 .125rem 1.5rem',
  verticalAlign: 'middle'
})

const ProviderMetaItem = styled('div')({
  display: 'inline-block',
  fontSize: appTheme.typography.s3,
  fontWeight: 600,
  marginRight: ui.rowGutter
})

const ProviderName = styled('div')({
  ...ui.providerName,
  display: 'inline-block',
  marginRight: ui.rowGutter,
  verticalAlign: 'middle'
})

const ProviderActions = styled(RowActions)({
  marginLeft: 'auto',
  paddingLeft: ui.rowGutter,
  maxWidth: '10rem'
})

export const providerLookup = {
  [GITHUB]: {
    ...ui.providers.github,
    route: 'github',
    makeUri: (jwt, teamId) => {
      // const redirect = makeHref('/auth/github/entry');
      const state = `${teamId}::${jwt}`
      // eslint-disable-next-line
      return `https://github.com/login/oauth/authorize?client_id=${
        window.__ACTION__.github
      }&scope=${GITHUB_SCOPE}&state=${state}`
    }
  },
  [SLACK]: {
    ...ui.providers.slack,
    route: 'slack',
    makeUri: (jwt, teamId) => {
      const redirect = makeHref('/auth/slack')
      // state is useful for CSRF, but we jwt to make sure the person isn't overwriting the int for another team
      const state = `${teamId}::${jwt}`
      // eslint-disable-next-line
      return `https://slack.com/oauth/authorize?client_id=${
        window.__ACTION__.slack
      }&scope=${SLACK_SCOPE}&state=${state}&redirect_uri=${redirect}`
    }
  }
}

const defaultDetails = {
  userCount: 0,
  integrationCount: 0
}

const ProviderRow = (props) => {
  const {comingSoon, history, jwt, name, providerDetails, teamId} = props
  const {
    accessToken,
    userCount,
    integrationCount
    // providerUserName
  } =
    providerDetails || defaultDetails
  const {color, icon, description, makeUri, providerName, route} = providerLookup[name]
  const openOauth = () => {
    const uri = makeUri(jwt, teamId)
    window.open(uri)
  }
  const linkStyle = {
    display: 'block',
    textDecoration: 'none'
  }
  const to = `/team/${teamId}/settings/integrations/${route}`
  const metaIconStyle = {
    display: 'inline-block',
    fontSize: ui.iconSize,
    fontWeight: 400
  }
  const hasActivity = userCount > 0 || integrationCount > 0
  return (
    <StyledRow>
      <ConditionalLink isLink={!comingSoon} to={to} style={linkStyle}>
        <ProviderAvatar backgroundColor={color}>
          <ProviderIcon name={icon} />
        </ProviderAvatar>
      </ConditionalLink>
      <RowInfo>
        <ConditionalLink isLink={!comingSoon} to={to} className={css(providerRowContent)}>
          <NameAndMeta>
            <ProviderName>
              {providerName}
              {hasActivity && (
                <ProviderMeta>
                  <ProviderMetaItem>
                    <FontAwesome name='user-circle' style={metaIconStyle} /> {userCount}
                  </ProviderMetaItem>
                  <ProviderMetaItem>
                    <FontAwesome name={icon} style={metaIconStyle} /> {integrationCount}
                  </ProviderMetaItem>
                </ProviderMeta>
              )}
            </ProviderName>
          </NameAndMeta>
          <RowInfoCopy>
            {comingSoon && <b>{'Coming Soon! '}</b>}
            {description}
          </RowInfoCopy>
        </ConditionalLink>
      </RowInfo>
      {!comingSoon && (
        <ProviderActions>
          {accessToken ? (
            <StyledButton key='teamSettings' onClick={() => history.push(to)}>
              {'Team Settings'}
            </StyledButton>
          ) : (
            <StyledButton key='linkAccount' onClick={openOauth} palette='warm'>
              {'Link My Account'}
            </StyledButton>
          )}
        </ProviderActions>
      )}
    </StyledRow>
  )
}

ProviderRow.propTypes = {
  actions: PropTypes.any,
  comingSoon: PropTypes.bool,
  history: PropTypes.object,
  jwt: PropTypes.string,
  name: PropTypes.string,
  providerDetails: PropTypes.object,
  teamId: PropTypes.string.isRequired
}

export default createFragmentContainer(
  withRouter(ProviderRow),
  graphql`
    fragment ProviderRow_providerDetails on ProviderRow {
      accessToken
      integrationCount
      userCount
    }
  `
)
