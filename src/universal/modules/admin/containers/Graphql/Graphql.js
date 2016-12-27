import React, {Component, PropTypes} from 'react';
import GraphiQL from 'graphiql';
import fetch from 'isomorphic-fetch';
import {connect} from 'react-redux';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {getGraphQLHost, getGraphQLProtocol} from 'universal/utils/graphQLConfig';
import requireAuthAndRole from 'universal/decorators/requireAuthAndRole/requireAuthAndRole';
import LoadingView from 'universal/components/LoadingView/LoadingView';

const graphQLHost = getGraphQLHost();
const graphQLProtocol = getGraphQLProtocol();

const graphiqlStylesheet = __PRODUCTION__ ?
  'https://cdnjs.cloudflare.com/ajax/libs/graphiql/0.8.0/graphiql.min.css' :
  '/static/css/graphiql.css';

const makeGraphQLFetcher = authToken => {
  return async(graphQLParams) => {
    if (!__CLIENT__) {
      return undefined;
    }
    const variables = graphQLParams.variables ?
      JSON.parse(graphQLParams.variables) : undefined;
    const res = await fetch(`${graphQLProtocol}//${graphQLHost}/graphql`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({query: graphQLParams.query, variables})
    });
    return res.json();
  };
};

const mapStateToProps = state => {
  return {
    authToken: state.auth.token
  };
};

const styleThunk = () => ({
  graphiql: {
    margin: 0,
    height: '100vh',
    minHeight: '100vh',
    padding: 0,
    width: '100%'
  }
});

@connect(mapStateToProps)
@withStyles(styleThunk)
@requireAuthAndRole('su')
export default class Graphiql extends Component {
  static propTypes = {
    authToken: PropTypes.string,
    styles: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {graphQLFetcher: null};
  }

  componentDidMount() {
    const {authToken} = this.props;
    const linkElement = document.createElement('link');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute('type', 'text/css');
    linkElement.setAttribute('href', graphiqlStylesheet);
    document.head.appendChild(linkElement);
    linkElement.onload = () => {
      this.setState({graphQLFetcher: makeGraphQLFetcher(authToken)});
    };
  }

  render() {
    const {styles} = this.props;
    const {graphQLFetcher} = this.state;
    if (!graphQLFetcher) {
      return <LoadingView />;
    }
    return (
      <div className={css(styles.graphiql)}>
        <GraphiQL fetcher={graphQLFetcher}/>
      </div>
    );
  }
}
