import React, {lazy} from 'react'
import styled, {keyframes} from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import FlatButton from 'universal/components/FlatButton'
import Icon from 'universal/components/Icon'
import JiraConfigMenu from 'universal/components/JiraConfigMenu'
import LoadableMenu from 'universal/components/LoadableMenu'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'
import PlainButton from 'universal/components/PlainButton/PlainButton'
import useAtlassianSites from 'universal/hooks/useAtlassianSites'
import {DECELERATE} from 'universal/styles/animation'
import {PALETTE} from 'universal/styles/paletteV2'
import jiraLogo from 'universal/styles/theme/images/graphics/jira.svg'
import {ICON_SIZE} from 'universal/styles/typographyV2'
import LoadableDropdownMenu from 'universal/components/LoadableDropdownMenu'
import {JiraIntegrationHeader_team} from '__generated__/JiraIntegrationHeader_team.graphql'

const JiraLogo = styled('img')({
  width: 48,
  height: 48,
  marginRight: 16
})

const Title = styled('div')({
  color: PALETTE.TEXT.MAIN,
  fontSize: 18,
  lineHeight: '24px'
})

const Subtitle = styled('div')({
  color: PALETTE.TEXT.LIGHT,
  fontSize: 14,
  lineHeight: '18px'
})

const Header = styled('div')({
  display: 'flex',
  padding: 16,
  position: 'relative',
  width: 492
})

const SiteList = styled('div')({})

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0);
  }
	100% {
	  opacity: 1;
	  transform: scale(1);
	}
`

const SiteAvatar = styled('img')(({idx}: {idx: number}) => ({
  animation: `${fadeIn} 300ms ${DECELERATE} ${idx * 50}ms forwards`,
  animationName: fadeIn,
  animationDuration: '300ms',
  animationTimingFunction: DECELERATE,
  animationDelay: `${idx * 100}ms`,
  animationIterationCount: 1,
  borderRadius: '100%',
  marginLeft: 8,
  opacity: 0
}))

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
}

interface Props {
  accessToken?: string
  team: JiraIntegrationHeader_team
}

const MenuButton = styled(PlainButton)({
  color: PALETTE.PRIMARY.MAIN,
  fontSize: ICON_SIZE.MD18,
  userSelect: 'none'
})

const TitleRow = styled('div')({
  display: 'flex',
  justifyContent: 'space-between'
})

const Content = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '100%'
})

const ListAndMenu = styled('div')({
  display: 'flex'
})

const AddProjectButton = styled(FlatButton)({
  background: '#fff',
  borderColor: PALETTE.BORDER.LIGHT,
  borderWidth: 1,
  display: 'flex',
  fontSize: 14,
  fontWeight: 600,
  justifyContent: 'flex-end',
  marginTop: 16
})

const SubAndButton = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: 'fit-content'
})

const DownArrow = styled(Icon)({
  marginLeft: 16
})

const JiraAvailableProjectsMenu = lazy(() =>
  import(/* webpackChunkName: 'JiraAvailableProjectsMenu' */ 'universal/components/JiraAvailableProjectsMenu')
)

const JiraIntegrationHeader = (props: Props) => {
  const {accessToken, team} = props
  const {id: teamId, atlassianProjects} = team
  const {sites, status} = useAtlassianSites(accessToken)
  return (
    <Header>
      <JiraLogo src={jiraLogo} />
      <Content>
        <TitleRow>
          <Title>Jira</Title>
          <ListAndMenu>
            <SiteList>
              {status === 'loaded' &&
                sites.map((site, idx) => (
                  <SiteAvatar
                    key={site.id}
                    width={24}
                    height={24}
                    src={site.avatarUrl}
                    title={site.name}
                    idx={sites.length - idx}
                  />
                ))}
              {status === 'loading' && <LoadingComponent spinnerSize={24} height={24} />}
            </SiteList>
            <LoadableMenu
              LoadableComponent={JiraConfigMenu}
              maxWidth={400}
              maxHeight={225}
              originAnchor={originAnchor}
              queryVars={{teamId}}
              targetAnchor={targetAnchor}
              toggle={
                <MenuButton>
                  <Icon>more_vert</Icon>
                </MenuButton>
              }
            />
          </ListAndMenu>
        </TitleRow>
        <SubAndButton>
          <Subtitle>Create issues from Parabol</Subtitle>
          <LoadableDropdownMenu
            LoadableComponent={JiraAvailableProjectsMenu}
            maxHeight={150}
            maxWidth={300}
            originAnchor={originAnchor}
            queryVars={{accessToken, sites, atlassianProjects}}
            targetAnchor={targetAnchor}
            toggle={
              <AddProjectButton disabled={sites.length < 1}>
                Add Project
                <DownArrow>expand_more</DownArrow>
              </AddProjectButton>
            }
          />
        </SubAndButton>
      </Content>
    </Header>
  )
}

export default createFragmentContainer(
  JiraIntegrationHeader,
  graphql`
    fragment JiraIntegrationHeader_team on Team {
      id
      atlassianProjects {
        ...JiraAvailableProjectsMenu_atlassianProjects
      }
    }
  `
)
