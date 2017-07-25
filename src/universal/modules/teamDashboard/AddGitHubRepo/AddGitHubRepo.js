import {css} from 'aphrodite-local-styles/no-important';
import ms from 'ms';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from 'universal/components/Button/Button';
import ServiceDropdownInput from 'universal/modules/integrations/components/ServiceDropdownInput/ServiceDropdownInput';
import AddGitHubRepoMutation from 'universal/mutations/AddGitHubRepoMutation';
import formError from 'universal/styles/helpers/formError';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {GITHUB_ENDPOINT} from 'universal/utils/constants';
import {clearError, setError} from 'universal/utils/relay/mutationCallbacks';

const defaultSelectedRepo = () => ({
  repoId: undefined,
  nameWithOwner: 'Select a GitHub repo'
});

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
  }
}
`;

class AddGitHubRepo extends Component {
  static propTypes = {
    accessToken: PropTypes.string,
    environment: PropTypes.object,
    styles: PropTypes.object,
    teamMemberId: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.state = {
      options: [],
      selectedRepo: defaultSelectedRepo()
    };
    this.lastUpdated = 0;
    this.fetchOptions(props.accessToken);
  }

  componentWillReceiveProps(nextProps) {
    const {accessToken} = nextProps;
    if (!this.props.accessToken !== accessToken) {
      this.fetchOptions(accessToken);
      clearError.call(this);
    }
  }

  updateDropdownItem = (option) => () => {
    this.setState({
      selectedRepo: {
        repoId: option.id,
        nameWithOwner: option.label
      },
      options: this.state.options.filter((row) => row.id !== option.id)
    });
  };

  handleAddRepo = () => {
    const {environment, teamId} = this.props;
    const {selectedRepo: {repoId, nameWithOwner}} = this.state;
    if (!repoId) return;

    AddGitHubRepoMutation(environment, nameWithOwner, teamId, setError.bind(this), clearError.bind(this));
    this.setState({
      selectedRepo: defaultSelectedRepo()
    });
  };

  fetchOptions = async (accessToken) => {
    const now = new Date();
    const isStale = now - this.lastUpdated > ms('30s');
    if (accessToken && isStale) {
      this.lastUpdated = now;
      const authedPostOptions = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          query: getReposQuery
        })
      };
      const res = await fetch(GITHUB_ENDPOINT, authedPostOptions);
      const resJson = await res.json();
      const {data, errors, message} = resJson;
      if (errors || message) {
        if (errors) {
          setError.call(this, {_error: errors[0].message})
          throw errors;
        }
        setError.call(this, {_error: `GitHub Error: ${message}. Try refreshing your token`});
        throw message;
      }
      const {viewer: {organizations: {nodes}, repositories}} = data;
      nodes.unshift({
        repositories
      });
      const repos = nodes.reduce((master, single) => {
        master.push(...single.repositories.nodes);
        return master;
      }, []);

      const {subbedRepos} = this.props;
      const subbedRepoIds = subbedRepos.map(({nameWithOwner}) => nameWithOwner);
      const oneMonthAgo = Date.now() - ms('30d');
      const options = repos.filter((repo) => !subbedRepoIds.includes(repo.nameWithOwner) && new Date(repo.updatedAt) > oneMonthAgo)
        .map((repo) => ({id: repo.nameWithOwner, label: repo.nameWithOwner}));
      this.setState({
        isLoaded: true,
        options
      });
    }
  };

  render() {
    const {isLoaded, options, selectedRepo: {nameWithOwner}} = this.state;
    const {accessToken, styles} = this.props;
    return (
      <div className={css(styles.addRepo)}>
        <div className={css(styles.dropdownAndError)}>
          <ServiceDropdownInput
            fetchOptions={() => this.fetchOptions(accessToken)}
            dropdownText={nameWithOwner}
            handleItemClick={this.updateDropdownItem}
            options={options}
            isLoaded={isLoaded}
          />
          <div className={css(styles.error)}>
            {this.state.error}
          </div>
        </div>
        <div style={{paddingLeft: ui.rowGutter, minWidth: '11rem'}}>
          <Button
            colorPalette="cool"
            isBlock
            label="Add Repo"
            size="small"
            onClick={this.handleAddRepo}
          />
        </div>
      </div>

    );
  }
}

const styleThunk = () => ({
  addRepo: {
    display: 'flex',
    width: '100%'
  },
  dropdownAndError: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column'
  },
  error: {
    ...formError,
    textAlign: 'right'
  }
});


export default withStyles(styleThunk)(AddGitHubRepo);
