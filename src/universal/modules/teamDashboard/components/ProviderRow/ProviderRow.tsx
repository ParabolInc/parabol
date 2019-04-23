import {ProviderRow_providerDetails} from '__generated__/ProviderRow_providerDetails.graphql'
import React from 'react'
import styled, {css} from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import ConditionalLink from 'universal/components/ConditionalLink/ConditionalLink'
import SecondaryButton from 'universal/components/SecondaryButton'
import ProviderCard from 'universal/components/ProviderCard'
import RowActions from 'universal/components/Row/RowActions'
import RowInfo from 'universal/components/Row/RowInfo'
import RowInfoHeading from 'universal/components/Row/RowInfoHeading'
import RowInfoCopy from 'universal/components/Row/RowInfoCopy'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {IntegrationServiceEnum} from 'universal/types/graphql'
import {ATLASSIAN_SCOPE, GITHUB, GITHUB_SCOPE, SLACK, SLACK_SCOPE} from 'universal/utils/constants'
import handleOpenOAuth from 'universal/utils/handleOpenOAuth'
import makeHref from 'universal/utils/makeHref'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import SlackProviderLogo from 'universal/SlackProviderLogo'
import GitHubProviderLogo from 'universal/GitHubProviderLogo'
import {Layout, Providers} from 'universal/types/constEnums'
import {PALETTE} from 'universal/styles/paletteV2'

const StyledButton = styled(SecondaryButton)({
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

const providerRowContent = {
  color: PALETTE.TEXT.MAIN,
  display: 'block',
  ':hover, :focus': {
    color: PALETTE.TEXT.MAIN
  }
}

const ProviderActions = styled(RowActions)({
  marginLeft: 'auto',
  paddingLeft: Layout.ROW_GUTTER,
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
    description: Providers.GITHUB_DESC,
    providerName: Providers.GITHUB_NAME,
    route: 'github',
    makeUri: (state) =>
      `https://github.com/login/oauth/authorize?client_id=${
        window.__ACTION__.github
      }&scope=${GITHUB_SCOPE}&state=${state}`
  },
  [SLACK]: {
    description: Providers.SLACK_DESC,
    providerName: Providers.SLACK_NAME,
    route: 'slack',
    makeUri: (state) => {
      const redirect = makeHref('/auth/slack')
      return `https://slack.com/oauth/authorize?client_id=${
        window.__ACTION__.slack
      }&scope=${SLACK_SCOPE}&state=${state}&redirect_uri=${redirect}`
    }
  }
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
  const {accessToken} = providerDetails || {accessToken: ''}
  const {description, providerName, route} = providerLookup[name]
  const linkStyle = {
    display: 'block',
    textDecoration: 'none'
  }
  const to = `/team/${teamId}/settings/integrations/${route}`
  const openOAuth = handleOpenOAuth({
    name: name as IntegrationServiceEnum,
    submitting,
    submitMutation,
    atmosphere,
    onError,
    onCompleted,
    teamId
  })
  return (
    <ProviderCard>
      <ConditionalLink isLink={!comingSoon} to={to} style={linkStyle}>
        {name === IntegrationServiceEnum.SlackIntegration && <SlackProviderLogo />}
        {name === IntegrationServiceEnum.GitHubIntegration && <GitHubProviderLogo />}
      </ConditionalLink>
      <RowInfo>
        <ConditionalLink isLink={!comingSoon} to={to} className={css(providerRowContent)}>
          <RowInfoHeading>{providerName}</RowInfoHeading>
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
              {'Settings'}
            </StyledButton>
          ) : (
            <StyledButton key='linkAccount' onClick={openOAuth} waiting={submitting}>
              {'Connect'}
            </StyledButton>
          )}
        </ProviderActions>
      )}
    </ProviderCard>
  )
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(withRouter(ProviderRow))),
  graphql`
    fragment ProviderRow_providerDetails on ProviderRow {
      accessToken
    }
  `
)
