import {css} from 'aphrodite-local-styles/no-important';
import GraphiQL from 'graphiql';
import fetch from 'isomorphic-fetch';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import withAsync from 'react-async-hoc';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import requireAuthAndRole from 'universal/decorators/requireAuthAndRole/requireAuthAndRole';
import withStyles from 'universal/styles/withStyles';
import {getGraphQLHost, getGraphQLProtocol} from 'universal/utils/graphQLConfig';

const graphQLHost = getGraphQLHost();
const graphQLProtocol = getGraphQLProtocol();

const graphiqlStylesheet = __PRODUCTION__
  ? 'https://cdnjs.cloudflare.com/ajax/libs/graphiql/0.8.0/graphiql.min.css'
  : '/static/css/graphiql.css';

const makeGraphQLFetcher = (authToken) => {
  return async (graphQLParams) => {
    if (!__CLIENT__) {
      return undefined;
    }
    const variables = graphQLParams.variables ? graphQLParams.variables : undefined;
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

const styleThunk = () => ({
  graphiql: {
    margin: 0,
    height: '100vh',
    minHeight: '100vh',
    padding: 0,
    width: '100%'
  }
});

const loadStylesCb = () => ({stylesLoaded: true});

@withStyles(styleThunk)
@requireAuthAndRole({role: 'su'})
@withAsync(undefined, {[graphiqlStylesheet]: loadStylesCb})
export default class Graphiql extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    styles: PropTypes.object,
    stylesLoaded: PropTypes.bool
  };

  constructor (props) {
    super(props);
    this.state = {graphQLFetcher: null};
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.stylesLoaded) {
      this.setState({
        graphQLFetcher: makeGraphQLFetcher(nextProps.atmosphere.authToken)
      });
    }
  }

  render () {
    const {styles} = this.props;
    const {graphQLFetcher} = this.state;
    if (!graphQLFetcher) {
      return <LoadingView />;
    }
    return (
      <div className={css(styles.graphiql)}>
        <GraphiQL fetcher={graphQLFetcher} />
      </div>
    );
  }
}
