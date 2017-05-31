import React, {Component} from 'react';

const draftjsPlugin = (ComposedComponent) => {
  class DraftJSPlugin extends Component {
    componentWillMount() {
      this.props.store.setComponent(this);
    }
    componentWillUnmount() {
      this.props.store.unsetComponent(this);
    }
    render() {
      console.log('draftjsplugin isOpen', this.props.store.state.isOpen)
      return <ComposedComponent {...this.props.store.state} />;
    }
  }
  return DraftJSPlugin;
};

export default draftjsPlugin;