import React, {Component, PropTypes, Children} from 'react'

export default class ThemeProvider extends Component {
  getChildContext() {
    return {customTheme: this.customTheme}
  }

  constructor(props, context) {
    super(props, context);
    this.customTheme = props.customTheme
  }

  render() {
    return Children.only(this.props.children)
  }
}

ThemeProvider.propTypes = {
  customTheme: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired
};

ThemeProvider.childContextTypes = {
  customTheme: PropTypes.object.isRequired,
};
