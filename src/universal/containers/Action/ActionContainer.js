import React, {PropTypes, Component} from 'react';
import Action from 'universal/components/Action/Action';

// eslint-disable-next-line react/prefer-stateless-function
export default class ActionContainer extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired
  };

  render() {
    return <Action {...this.props} />;
  }
}
