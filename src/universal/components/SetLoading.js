import React, {Component} from 'react';

// QueryRenderer doesn't provide a callback when the loading is done, so let's use the render function
export default class SetLoading extends Component {
  componentWillMount() {
    this.props.setLoading(true);
  }
  render() {
    return null;
  }
}
