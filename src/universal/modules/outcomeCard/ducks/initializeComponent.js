import React, {Component, PropTypes} from 'react';

const initializeComponent = (initializer, componentId) => (WrappedComponent) => {
  return class InitializedRedux extends Component {
    static contextTypes = {
      store: PropTypes.object
    };

    constructor(props, context) {
      super(props, context);
    }

    componentWillMount() {
      const component = this.props[componentId];
      const {mount} = initializer;
      this.context.store.dispatch(mount(component));
    }

    render() {
      return <WrappedComponent {...this.props}/>;
    }

    componentWillUnmount() {
      const component = this.props[componentId];
      const {unmount} = initializer;
      this.context.store.dispatch(unmount(component));
    }
  };
};

export default initializeComponent;
