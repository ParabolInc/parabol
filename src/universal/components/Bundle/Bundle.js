import React, {Component} from 'react';
import PropTypes from 'prop-types';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';

class Bundle extends Component {
  static contextTypes = {
    store: PropTypes.object
  };

  static propTypes = {
    extra: PropTypes.object,
    history: PropTypes.object.isRequired,
    isPrivate: PropTypes.bool,
    location: PropTypes.object.isRequired,
    match: PropTypes.object,
    mod: PropTypes.func.isRequired
  };

  state = {
    mod: null
  };

  componentWillMount() {
    this.loadMod(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {mod} = this.props;
    if (mod !== nextProps.mod) {
      this.loadMod(nextProps);
    }
  }

  loadMod(props) {
    this.setState({Mod: null});
    const {isPrivate, mod} = props;
    mod().then((res) => {
      let component = res.default;
      if (isPrivate) {
        component = requireAuth(component);
      }
      this.setState({
        Mod: component
      });
    });
  }

  render() {
    const {Mod} = this.state;
    if (!Mod) return null;
    const {history, location, match, extra} = this.props;
    return <Mod {...extra} history={history} location={location} match={match} />;
  }
}

export default Bundle;
