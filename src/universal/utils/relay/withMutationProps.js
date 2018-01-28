import React, {Component} from 'react';
import getDisplayName from 'universal/utils/getDisplayName';

// Serves as a lightweight alternative for redux-form when we just have a button or something
export default (ComposedComponent) => {
  // eslint-disable-next-line react/prefer-stateless-function
  return class WithMutationProps extends Component {
    static displayName = `WithMutationProps(${getDisplayName(ComposedComponent)})`;

    setDirty = () => {
      if (this._mounted && !this.state.dirty) {
        this.setState({dirty: true});
      }
    };

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

    constructor(props) {
      super(props);
      this.state = {
        submitting: false,
        error: undefined,
        dirty: false
      };
    }

    submitMutation = () => {
      if (this._mounted) {
        this.setState({
          submitting: true
        });
      }
    };

    render() {
      const {dirty, error, submitting} = this.state;
      return (<ComposedComponent
        {...this.props}
        dirty={dirty}
        error={error}
        setDirty={this.setDirty}
        submitting={submitting}
        submitMutation={this.submitMutation}
        onCompleted={this.onCompleted}
        onError={this.onError}
      />);
    }
  };
};

// const propTypes = {
//  setDirty: PropTypes.func.isRequired,
//  error: PropTypes.any,
//  submitting: PropTypes.bool,
//  submitMutation: PropTypes.func.isRequired,
//  onCompleted: PropTypes.func.isRequired,
//  onError: PropTypes.func.isRequired
// }
