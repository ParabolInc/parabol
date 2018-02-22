import PropTypes from 'prop-types';
import {Children, Component} from 'react';
import {connect} from 'react-redux';
import Atmosphere from 'universal/Atmosphere';

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
    dispatch: PropTypes.func.isRequired
  };

  getChildContext() {
    return {
      atmosphere
    };
  }

  componentWillMount() {
    const {authToken, dispatch} = this.props;
    // super dirty, we'll remove it in the next chore PR when we remove auth from redux
    atmosphere.dispatch = dispatch;
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

export default connect(mapStateToProps)(AtmosphereProvider);
