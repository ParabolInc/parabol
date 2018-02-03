import PropTypes from 'prop-types';
import {Children, Component} from 'react';
import {connect} from 'react-redux';
import Atmosphere from 'universal/Atmosphere';
import {withRouter} from 'react-router-dom';

const mapStateToProps = (state) => ({authToken: state.auth.token});

let atmosphere = new Atmosphere();

export const resetAtmosphere = () => {
  atmosphere = new Atmosphere();
};

class AtmosphereProvider extends Component {
  static childContextTypes = {
    atmosphere: PropTypes.object
  };

  static propTypes = {
    authToken: PropTypes.string,
    children: PropTypes.element.isRequired,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired
  };

  getChildContext() {
    return {
      atmosphere
    };
  }

  componentWillMount() {
    const {authToken, dispatch, history} = this.props;
    // super dirty, we'll remove it in the next chore PR when we remove auth from redux
    atmosphere.dispatch = dispatch;
    atmosphere.history = history;
    if (authToken) {
      atmosphere.setAuthToken(authToken);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {authToken} = nextProps;
    if (this.props.authToken !== authToken) {
      atmosphere.setAuthToken(authToken);
    }
  }

  render() {
    return Children.only(this.props.children);
  }
}

export default withRouter(connect(mapStateToProps)(AtmosphereProvider));
