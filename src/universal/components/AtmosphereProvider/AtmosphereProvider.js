import React, { Children, Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

const mapStateToProps = (state) => ({authToken: state.auth.obj.sub});

class AtmosphereProvider extends Component {
  static childContextTypes = {
    atmosphere: PropTypes.object
  };

  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    authToken: PropTypes.string,
    children: PropTypes.element.isRequired
  };

  getChildContext() {
    return {
      atmosphere: this.props.atmosphere
    };
  }

  componentWillMount() {
    const {atmosphere, authToken} = this.props;
    if (authToken) {
      atmosphere.setAuthToken(authToken);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {atmosphere, authToken} = nextProps;
    if (this.props.authToken !== authToken){
      atmosphere.setAuthToken(authToken);
    }
  }

  render() {
    return Children.only(this.props.children);
  }
}

export default connect(mapStateToProps)(AtmosphereProvider);