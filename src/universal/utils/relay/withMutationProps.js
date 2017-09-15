import React, {Component} from 'react';
import getDisplayName from 'universal/utils/getDisplayName';

// Serves as a lightweight alternative for redux-form when we just have a button or something
export default (ComposedComponent) => {
  // eslint-disable-next-line react/prefer-stateless-function
  return class WithMutationProps extends Component {
    static displayName = `WithMutationProps(${getDisplayName(ComposedComponent)})`;

    constructor(props) {
      super(props);
      this.state = {
        submitting: false,
        error: undefined
      };
    }

    componentWillMount() {
      this._mounted = true;
    }

    componentWillUnmount() {
      this._mounted = false;
    }

    onCompleted = () => {
      if (this._mounted) {
        this.setState({
          submitting: false,
          error: undefined
        });
      }
    };

    onError = (error) => {
      if (this._mounted) {
        this.setState({
          submitting: false,
          error
        });
      }
    };

    submitMutation = () => {
      if (this._mounted) {
        this.setState({
          submitting: true
        });
      }
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
