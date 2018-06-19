import ms from 'ms'
import PropTypes from 'prop-types'
import React, {Component} from 'react'
import Row from 'universal/components/Row/Row'
import RaisedButton from 'universal/components/RaisedButton'
import ServiceDropdownInput from 'universal/modules/integrations/components/ServiceDropdownInput/ServiceDropdownInput'
import AddGitHubRepoMutation from 'universal/mutations/AddGitHubRepoMutation'
import formError from 'universal/styles/helpers/formError'
import ui from 'universal/styles/ui'
import {GITHUB_ENDPOINT} from 'universal/utils/constants'
import makeGitHubPostOptions from 'universal/utils/makeGitHubPostOptions'
import {clearError, setError} from 'universal/utils/relay/mutationCallbacks'
import appTheme from 'universal/styles/theme/theme'
import styled from 'react-emotion'

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
  const repos = []

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

class AddGitHubRepo extends Component {
  static propTypes = {
    accessToken: PropTypes.string,
    environment: PropTypes.object,
    teamId: PropTypes.string,
    teamMemberId: PropTypes.string
  }

  constructor (props) {
    super(props)
    this._mounted = true
    this.state = {
      options: [],
      selectedRepo: defaultSelectedRepo(),
      showHint: undefined
    }
    this.lastUpdated = 0
    this.fetchOptions(props.accessToken)
  }

  componentWillReceiveProps (nextProps) {
    const {accessToken} = nextProps
    if (!this.props.accessToken !== accessToken) {
      this.fetchOptions(accessToken)
      clearError.call(this)
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
    const {environment, teamId} = this.props
    const {
      selectedRepo: {repoId, nameWithOwner}
    } = this.state
    if (!repoId) return

    AddGitHubRepoMutation(
      environment,
      nameWithOwner,
      teamId,
      setError.bind(this),
      clearError.bind(this)
    )
    this.setState({
      selectedRepo: defaultSelectedRepo(),
      showHint: false
    })
  }

  handleToggleClick = () => {
    const {accessToken} = this.props
    const {showHint, menuOpen} = this.state
    const nextMenuOpen = !menuOpen
    this.setState({
      menuOpen: nextMenuOpen,
      showHint: nextMenuOpen === false && showHint === undefined ? true : showHint
    })
    this.fetchOptions(accessToken)
  }

  fetchOptions = async (accessToken) => {
    const now = new Date()
    const isStale = now - this.lastUpdated > ms('30s')
    if (accessToken && isStale) {
      this.lastUpdated = now
      const postOptions = makeGitHubPostOptions(accessToken, {
        query: getReposQuery
      })
      const res = await window.fetch(GITHUB_ENDPOINT, postOptions)
      const resJson = await res.json()
      if (!this._mounted) return
      const {data, errors, message} = resJson
      if (errors || message) {
        if (errors) {
          setError.call(this, errors[0].message)
          throw errors
        }
        setError.call(this, `GitHub Error: ${message}. Try refreshing your token`)
        throw message
      }
      const {
        viewer: {
          organizations: {nodes: orgs},
          repositories: {nodes: personalRepos}
        }
      } = data
      const repos = getUniqueRepos(orgs, personalRepos)
      const {subbedRepos} = this.props
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

  render () {
    const {
      error,
      isLoaded,
      options,
      selectedRepo: {nameWithOwner},
      showHint
    } = this.state
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

export default AddGitHubRepo
