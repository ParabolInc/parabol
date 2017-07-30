import {Component} from 'react';
import PropTypes from 'prop-types';

// QueryRenderer doesn't provide a callback when the loading is done, so let's use the render function
export default class SetLoading extends Component {
  static propTypes = {
    setLoading: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.setLoading(true);
  }

  render() {
    return null;
  }
}
