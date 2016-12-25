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
 'https://cdnjs.cloudflare.com/ajax/libs/graphiql/0.7.8/graphiql.min.css' :
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
// eslint-disable-next-line react/prefer-stateless-function
export default class Graphiql extends Component {
  static propTypes = {
    authToken: PropTypes.string,
    styles: PropTypes.object
  };

  constructor() {
    super();
    this.state = { cssLoaded: false };
  }

  componentDidMount() {
    const linkElement = document.createElement('link');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute('type', 'text/css');
    linkElement.setAttribute('href', graphiqlStylesheet);
    const eventListener = () =>
      this.setState({ cssLoaded: true }, () => {
        linkElement.removeEventListener('load', eventListener);
      });
    linkElement.addEventListener('load', eventListener);

    document.head.appendChild(linkElement);
  }

  render() {
    const {cssLoaded} = this.state;
    const {styles} = this.props;
    if (!cssLoaded) {
      return <LoadingView />;
    }
    const {authToken} = this.props;
    const graphQLFetcher = makeGraphQLFetcher(authToken);
    return (
      <div className={css(styles.graphiql)}>
        <GraphiQL fetcher={graphQLFetcher}/>
      </div>
    );
  }
}
