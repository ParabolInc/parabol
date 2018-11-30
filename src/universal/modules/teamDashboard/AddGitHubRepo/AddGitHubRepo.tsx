import ms from 'ms'
import React, {Component} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import RaisedButton from 'universal/components/RaisedButton'
import Row from 'universal/components/Row/Row'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import ServiceDropdownInput from 'universal/modules/integrations/components/ServiceDropdownInput/ServiceDropdownInput'
import AddGitHubRepoMutation from 'universal/mutations/AddGitHubRepoMutation'
import formError from 'universal/styles/helpers/formError'
import appTheme from 'universal/styles/theme/theme'
import ui from 'universal/styles/ui'
import {GITHUB_ENDPOINT} from 'universal/utils/constants'
import makeGitHubPostOptions from 'universal/utils/makeGitHubPostOptions'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import {AddGitHubRepo_subbedRepos} from '__generated__/AddGitHubRepo_subbedRepos.graphql'

const StyledRow = styled(Row)({
  alignItems: 'flex-start',
  border: 0,
  padding: 0
})

const DropdownAndError = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%'
})

const Error = styled('div')({
  ...formError,
  textAlign: 'right'
})

const Footer = styled('div')({
  color: appTheme.palette.mid90l,
  textAlign: 'right'
})

const StyledButton = styled(RaisedButton)({
  marginLeft: ui.rowGutter,
  minWidth: '11rem',
  paddingLeft: 0,
  paddingRight: 0
})

const getUniqueRepos = (orgs, personalRepos) => {
  const repoSet = new Set()
  const repos = [] as Array<Repo>

  // add in the organization repos
  for (let i = 0; i < orgs.length; i++) {
    const organization = orgs[i]
    const orgRepos = organization.repositories.nodes
    for (let j = 0; j < orgRepos.length; j++) {
      const repo = orgRepos[j]
      repoSet.add(repo.nameWithOwner)
      repos.push(repo)
    }
  }
  // add in repos from personal & collaborations
  for (let i = 0; i < personalRepos.length; i++) {
    const repo = personalRepos[i]
    if (!repoSet.has(repo.nameWithOwner)) {
      repos.push(repo)
    }
  }
  return repos
}

const defaultSelectedRepo = () => ({
  repoId: undefined,
  nameWithOwner: 'Select a GitHub repo'
})

const getReposQuery = `
query getRepos {
  viewer {
    organizations(first: 100) {
      nodes {
        repositories(first: 100, isLocked: false, orderBy: {field: UPDATED_AT, direction: DESC}) {
          ...repoFrag
        }
      }
    }
    repositories(first: 100, isLocked: false, orderBy: {field: UPDATED_AT, direction: DESC}) {
      ...repoFrag
    }
  }
}

fragment repoFrag on RepositoryConnection {
  nodes {
    nameWithOwner
    updatedAt
    viewerCanAdminister
  }
}
`

interface Repo {
  // id: string
  nameWithOwner: string
  viewerCanAdminister: boolean
}

interface Props extends WithAtmosphereProps, WithMutationProps {
  accessToken: string
  subbedRepos: AddGitHubRepo_subbedRepos
  teamId: string
}

interface Option {
  id: string
  label: string
}

interface State {
  isLoaded: boolean
  menuOpen: boolean
  options: Array<Option>
  selectedRepo: {
    repoId: undefined | string
    nameWithOwner: string
  }
  showHint: undefined | boolean
}

class AddGitHubRepo extends Component<Props, State> {
  lastUpdated: number = 0
  _mounted = true
  state = {
    isLoaded: false,
    menuOpen: false,
    options: [] as Array<Option>,
    selectedRepo: defaultSelectedRepo(),
    // not sure why casting is required here, but setting to true on ~L194 requires it
    showHint: undefined as undefined | boolean
  }

  componentDidMount () {
    this.fetchOptions(this.props.accessToken).catch()
  }

  componentWillReceiveProps (nextProps) {
    const {accessToken} = nextProps
    if (this.props.accessToken !== accessToken) {
      this.fetchOptions(accessToken).catch()
      this.props.onCompleted()
    }
  }

  componentWillUnmount () {
    this._mounted = false
  }

  updateDropdownItem = (option) => () => {
    // TODO refactor all of this. DRY it out between slack & GH, add loading & empty state
    if (option.id === null) {
      // there are no options
    }
    this.setState({
      selectedRepo: {
        repoId: option.id,
        nameWithOwner: option.label
      },
      options: this.state.options.filter((row) => row.id !== option.id),
      showHint: false
    })
  }

  handleAddRepo = () => {
    const {atmosphere, teamId, submitting, submitMutation, onCompleted, onError} = this.props
    const {
      selectedRepo: {repoId, nameWithOwner}
    } = this.state
    if (!repoId || submitting) return
    submitMutation()
    const handleCompleted = () => {
      onCompleted()
      this.setState({
        selectedRepo: defaultSelectedRepo(),
        showHint: false
      })
    }
    AddGitHubRepoMutation(atmosphere, {nameWithOwner, teamId}, onError, handleCompleted)
  }

  handleToggleClick = () => {
    const {accessToken} = this.props
    const {showHint, menuOpen} = this.state
    const nextMenuOpen = !menuOpen
    this.setState({
      menuOpen: nextMenuOpen,
      showHint: nextMenuOpen === false && showHint === undefined ? true : showHint
    })
    this.fetchOptions(accessToken).catch()
  }

  fetchOptions = async (accessToken) => {
    const now = Date.now()
    const isStale = now - this.lastUpdated > ms('30s')
    const {onCompleted, onError, submitMutation, submitting, subbedRepos} = this.props
    if (accessToken && isStale && !submitting) {
      this.lastUpdated = now
      const postOptions = makeGitHubPostOptions(accessToken, {
        query: getReposQuery
      })
      submitMutation()
      const res = await window.fetch(GITHUB_ENDPOINT, postOptions)
      const resJson = await res.json()
      if (!this._mounted) return
      const {data, errors, message} = resJson
      if (errors || message) {
        if (errors) {
          onError(errors[0].message)
          // throw errors
        } else {
          onError(`GitHub Error: ${message}. Try refreshing your token`)
        }
      } else {
        onCompleted()
        const {
          viewer: {
            organizations: {nodes: orgs},
            repositories: {nodes: personalRepos}
          }
        } = data
        const repos = getUniqueRepos(orgs, personalRepos)
        const subbedRepoIds = subbedRepos.map(({nameWithOwner}) => nameWithOwner)
        const options = repos
          .filter((repo) => repo.viewerCanAdminister && !subbedRepoIds.includes(repo.nameWithOwner))
          .map((repo) => ({id: repo.nameWithOwner, label: repo.nameWithOwner}))
          .sort((a, b) => (a.label < b.label ? -1 : 1))
        this.setState({
          isLoaded: true,
          options
        })
      }
    }
  }

  render () {
    const {
      isLoaded,
      options,
      selectedRepo: {nameWithOwner},
      showHint
    } = this.state
    const {error} = this.props
    const footerMessage =
      error || (showHint && 'Repo 404? Make sure you have admin privileges in GitHub!')
    const FooterBlock = error ? Error : Footer
    return (
      <StyledRow>
        <DropdownAndError>
          <ServiceDropdownInput
            fetchOptions={this.handleToggleClick}
            dropdownText={nameWithOwner}
            handleItemClick={this.updateDropdownItem}
            options={options}
            isLoaded={isLoaded}
          />
          <FooterBlock>{footerMessage}</FooterBlock>
        </DropdownAndError>
        <StyledButton size='medium' palette='warm' onClick={this.handleAddRepo}>
          {'Add Repo'}
        </StyledButton>
      </StyledRow>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(AddGitHubRepo)),
  graphql`
    fragment AddGitHubRepo_subbedRepos on GitHubIntegration @relay(plural: true) {
      nameWithOwner
    }
  `
)
