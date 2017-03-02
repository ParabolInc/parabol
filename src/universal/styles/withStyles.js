import React, {Component, PropTypes} from 'react';
import {StyleSheet} from 'aphrodite-local-styles/no-important';

const contextMap = new WeakMap();

const propsTriggeredInvalidation = (invalidatingProps, props, nextProps) => {
  for (let i = 0; i < invalidatingProps.length; i++) {
    const propName = invalidatingProps[i];
    if (props[propName] !== nextProps[propName]) {
      return true;
    }
  }
  return false;
};

// if invalidatingProps is falsy, then no change to props will invalidate the styles
// if styles will be invalidated, an array of scalar prop names must be passed in eg ['color', 'style']
const withStyles = (mapThemeToStyles, invalidatingProps) => (WrappedComponent) => {
  return class WithStyles extends Component {
    static contextTypes = {
      userTheme: PropTypes.object
    };

    constructor(props, context) {
      super(props, context);
      this.styles = StyleSheet.create(mapThemeToStyles(this.context.userTheme, props));
      contextMap.set(mapThemeToStyles, {context: this.context.theme, cache: this.styles});
    }

    componentWillReceiveProps(nextProps) {
      // if the thunk looks for the props && we declare that the props should update styles
      if (mapThemeToStyles.length > 1 && Array.isArray(invalidatingProps)) {
        if (propsTriggeredInvalidation(invalidatingProps, this.props, nextProps)) {
          StyleSheet.create(mapThemeToStyles(this.context.userTheme, nextProps));
        }
      }
    }

    render() {
      const entry = contextMap.get(mapThemeToStyles);
      const oldContext = entry && entry.context;
      if (oldContext !== this.context.theme) {
        console.log('a diff!');
      }
      return <WrappedComponent {...this.props} styles={this.styles} />;
    }
  };
};

export default withStyles;
