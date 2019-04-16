import {ProviderRow_providerDetails} from '__generated__/ProviderRow_providerDetails.graphql'
import React from 'react'
import styled, {css} from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import ConditionalLink from 'universal/components/ConditionalLink/ConditionalLink'
import RaisedButton from 'universal/components/RaisedButton'
import Row from 'universal/components/Row/Row'
import RowActions from 'universal/components/Row/RowActions'
import RowInfo from 'universal/components/Row/RowInfo'
import RowInfoCopy from 'universal/components/Row/RowInfoCopy'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import ui from 'universal/styles/ui'
import {IntegrationServiceEnum} from 'universal/types/graphql'
import {ATLASSIAN_SCOPE, GITHUB, GITHUB_SCOPE, SLACK, SLACK_SCOPE} from 'universal/utils/constants'
import handleOpenOAuth from 'universal/utils/handleOpenOAuth'
import makeHref from 'universal/utils/makeHref'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import SlackProviderLogo from '../../../../SlackProviderLogo'
import ProviderRowName from './ProviderRowName'

const StyledButton = styled(RaisedButton)({
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

const StyledRow = styled(Row)({
  justifyContent: 'flex-start'
})

const ProviderAvatar = styled('div')(({backgroundColor}: {backgroundColor: 'string'}) => ({
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

const ProviderActions = styled(RowActions)({
  marginLeft: 'auto',
  paddingLeft: ui.rowGutter,
  maxWidth: '10rem'
})

export const providerLookup = {
  atlassian: {
    makeUri: (state) =>
      `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${
        window.__ACTION__.atlassian
      }&scope=${encodeURI(ATLASSIAN_SCOPE)}&redirect_uri=${makeHref(
        '/auth/atlassian'
      )}&state=${state}&response_type=code&prompt=consent`
  },
  [GITHUB]: {
    ...ui.providers.github,
    route: 'github',
    makeUri: (state) =>
      `https://github.com/login/oauth/authorize?client_id=${
        window.__ACTION__.github
      }&scope=${GITHUB_SCOPE}&state=${state}`
  },
  [SLACK]: {
    ...ui.providers.slack,
    route: 'slack',
    makeUri: (state) => {
      const redirect = makeHref('/auth/slack')
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

interface Props extends WithAtmosphereProps, WithMutationProps, RouteComponentProps<{}> {
  comingSoon?: boolean
  name: string
  providerDetails: ProviderRow_providerDetails
  teamId: string
}

const ProviderRow = (props: Props) => {
  const {
    atmosphere,
    comingSoon,
    history,
    name,
    providerDetails,
    teamId,
    submitting,
    submitMutation,
    onError,
    onCompleted
  } = props
  const {accessToken, userCount, integrationCount} = providerDetails || defaultDetails
  const {color, icon, description, providerName, route} = providerLookup[name]
  const linkStyle = {
    display: 'block',
    textDecoration: 'none'
  }
  const to = `/team/${teamId}/settings/integrations/${route}`
  const openOAuth = handleOpenOAuth({
    name,
    submitting,
    submitMutation,
    atmosphere,
    onError,
    onCompleted,
    teamId
  })
  return (
    <StyledRow>
      <ConditionalLink isLink={!comingSoon} to={to} style={linkStyle}>
        <ProviderAvatar backgroundColor={color}>
          {name === IntegrationServiceEnum.SlackIntegration && <SlackProviderLogo />}
          {icon && <ProviderIcon name={icon} />}
        </ProviderAvatar>
      </ConditionalLink>
      <RowInfo>
        <ConditionalLink isLink={!comingSoon} to={to} className={css(providerRowContent)}>
          <ProviderRowName
            name={providerName}
            userCount={userCount}
            integrationCount={integrationCount}
          />
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
            <StyledButton key='linkAccount' onClick={openOAuth} palette='warm' waiting={submitting}>
              {'Link My Account'}
            </StyledButton>
          )}
        </ProviderActions>
      )}
    </StyledRow>
  )
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(withRouter(ProviderRow))),
  graphql`
    fragment ProviderRow_providerDetails on ProviderRow {
      accessToken
      integrationCount
      userCount
    }
  `
)
