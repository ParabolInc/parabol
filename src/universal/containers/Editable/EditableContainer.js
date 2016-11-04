import React, {Component, PropTypes} from 'react';
import Editable from 'universal/components/Editable/Editable';
import {connect} from 'react-redux';
import {initialize} from 'redux-form';

const mapStateToProps = (state, props) => {
  const {form} = props;
  const formState = state.form[form];
  const isEditing = formState && formState.active === form;
  return {
    isEditing
  }
};

@connect(mapStateToProps)
export default class EditableContainer extends Component {
  static propTypes = {
    updateEditable: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      isEditing: false
    }
  }

  setEditing = () => {
    const {dispatch, form, initialValue} = this.props;
    this.setState({
      isEditing: true
    });
    if (initialValue) {
      dispatch(initialize(form, {[form]: initialValue}))
    }
  };

  unsetEditing = () => {
    this.setState({
      isEditing: false
    })
  };

  render() {
    const {updateEditable} = this.props;
    return (
      <Editable
        {...this.props}
        isEditing={this.state.isEditing}
        setEditing={this.setEditing}
        unsetEditing={this.unsetEditing}
        updateEditable={updateEditable}
      />
    );
  }
};
