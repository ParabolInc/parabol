import PropTypes from 'prop-types';
import React, {Component} from 'react';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import requireAuthAndRole from 'universal/decorators/requireAuthAndRole/requireAuthAndRole';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import CreateImposterTokenMutation from 'universal/mutations/CreateImposterTokenMutation';


const showDucks = () => {
  return (
    <div>
      <Helmet title="Authenticating As..." />
      <LoadingView />
    </div>
  );
};

@requireAuthAndRole('su', {silent: true})
@withAtmosphere
export default class Impersonate extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    newUserId: PropTypes.string,
    history: PropTypes.object.isRequired
  };

  componentWillMount() {
    const {atmosphere, dispatch, match: {params: {newUserId}}, history} = this.props;
    if (newUserId) {
      CreateImposterTokenMutation(atmosphere, newUserId, {dispatch, history});
    }
  }

  render() {
    const {match: {params: {newUserId}}} = this.props;
    if (!__CLIENT__) {
      return showDucks();
    }
    if (!newUserId) {
      return (
        <div>
          No newUserId provided!
        </div>
      );
    }
    return showDucks();
  }
}
