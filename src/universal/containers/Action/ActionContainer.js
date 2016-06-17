import React, {PropTypes, Component} from 'react';
import Action from '../../components/Action/Action';

export default class ActionContainer extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired
  };

  render() {
    return <Action {...this.props} />;
  }
}
