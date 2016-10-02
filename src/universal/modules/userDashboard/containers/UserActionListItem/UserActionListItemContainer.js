import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import UserActionListItem from 'universal/modules/userDashboard/components/UserActionList/UserActionListItem';
import {cashay} from 'cashay';
import {reduxForm, initialize} from 'redux-form';

const mapStateToProps = (state, props) => {
  const form = state.form[props.form];
  return {
    isActive: form && form.active === props.actionId
  };
};

@reduxForm()
@connect(mapStateToProps)
export default class UserActionListItemContainer extends Component {
  static propTypes = {
    isActive: PropTypes.bool
  };

  componentWillMount() {
    const {content} = this.props;
    if (content) {
      this.initializeValues(content);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {content} = this.props;
    const nextContent = nextProps.content;
    if (nextContent !== content) {
      this.initializeValues(nextContent);
    }
  }

  initializeValues(content) {
    const {dispatch, form, actionId} = this.props;
    dispatch(initialize(form, {[actionId]: content}));
  }

  handleActionUpdate = (submittedData) => {
    const {actionId} = this.props;
    const submittedContent = submittedData[actionId];
    if (!submittedContent) {
      // delete blank cards
      cashay.mutate('deleteAction', {variables: {actionId}});
    } else {
      // TODO debounce for useless things like ctrl, shift, etc
      const options = {
        variables: {
          updatedAction: {
            id: actionId,
            content: submittedContent
          }
        }
      };
      cashay.mutate('updateAction', options);
    }
  };
  handleChecked = () => {
    const {actionId} = this.props;
    const options = {
      variables: {
        updatedAction: {
          id: actionId,
          isComplete: true
        }
      }
    };
    cashay.mutate('updateAction', options);
  };

  render() {
    return (
      <UserActionListItem
        {...this.props}
        handleChecked={this.handleChecked}
        handleActionUpdate={this.handleActionUpdate}
      />
    );
  }
};

export default connect(mapStateToProps)(UserActionListItemContainer);
