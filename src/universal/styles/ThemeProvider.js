import PropTypes from 'prop-types';
import { Component, Children } from 'react';

export default class ThemeProvider extends Component {
  constructor(props, context) {
    super(props, context);
    this.customTheme = props.customTheme;
  }

  getChildContext() {
    return {customTheme: this.customTheme};
  }

  render() {
    return Children.only(this.props.children);
  }
}

ThemeProvider.propTypes = {
  customTheme: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired
};

ThemeProvider.childContextTypes = {
  customTheme: PropTypes.object.isRequired
};
