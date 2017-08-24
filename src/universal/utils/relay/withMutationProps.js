import React, {Component} from 'react';
import getDisplayName from 'universal/utils/getDisplayName';

// Serves as a lightweight alternative for redux-form when we just have a button or something
export default (ComposedComponent) => {
  // eslint-disable-next-line react/prefer-stateless-function
  return class WithMutationProps extends Component {
    static displayName = `WithMutationProps(${getDisplayName(ComposedComponent)})`;
    state = {
      submitting: false,
      error: undefined
    };

    onCompleted = () => {
      this.setState({
        submitting: false,
        error: undefined
      });
    };

    onError = (error) => {
      this.setState({
        submitting: false,
        error
      });
    };

    submitMutation = () => {
      this.setState({
        submitting: true
      });
    };

    render() {
      const {error, submitting} = this.state;
      return (<ComposedComponent
        {...this.props}
        error={error}
        submitting={submitting}
        submitMutation={this.submitMutation}
        onCompleted={this.onCompleted}
        onError={this.onError}
      />);
    }
  };
};

// const propTypes = {
//  error: PropTypes.any,
//  submitting: PropTypes.bool,
//  submitMutation: PropTypes.func.isRequired,
//  onCompleted: PropTypes.func.isRequired,
//  onError: PropTypes.func.isRequired
// }
