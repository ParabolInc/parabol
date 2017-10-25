import React, {Component} from 'react';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired
  };

  state = {
    error: null,
    errorInfo: null
  };

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error,
      errorInfo
    });
    // You can also log error messages to an error reporting service here
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <ErrorComponent error={{_error: this.state.error.message}} />
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}

export default ErrorBoundary;
