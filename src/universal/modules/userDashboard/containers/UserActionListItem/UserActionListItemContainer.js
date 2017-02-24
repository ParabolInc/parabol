import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import UserActionListItem from 'universal/modules/userDashboard/components/UserActionList/UserActionListItem';
import {cashay} from 'cashay';
import {reduxForm, initialize} from 'redux-form';
import {ACTION} from 'universal/utils/constants';
import {DragSource as dragSource} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';
import ActionDragLayer from 'universal/modules/userDashboard/components/UserActionList/ActionDragLayer';

const actionSource = {
  beginDrag(props) {
    return {
      id: props.actionId
    };
  }
};

const mapStateToProps = (state, props) => {
  const form = state.form[props.form];
  return {
    isActive: form && form.active === props.actionId
  };
};

const dragSourceCb = (connectSource, monitor) => ({
  connectDragSource: connectSource.dragSource(),
  connectDragPreview: connectSource.dragPreview(),
  isDragging: monitor.isDragging()
});

@reduxForm()
@connect(mapStateToProps)
@dragSource(ACTION, actionSource, dragSourceCb)
export default class UserActionListItemContainer extends Component {
  static propTypes = {
    actionId: PropTypes.string,
    content: PropTypes.string,
    dispatch: PropTypes.func,
    form: PropTypes.string,
    isActive: PropTypes.bool,
    isDragging: PropTypes.bool,
    isPreview: PropTypes.bool,
    connectDragSource: PropTypes.func,
    connectDragPreview: PropTypes.func,
  };

  componentWillMount() {
    const {content} = this.props;
    if (content) {
      this.initializeValues(content);
    }
  }

  componentDidMount() {
    const {connectDragPreview, isPreview} = this.props;
    if (!isPreview) {
      connectDragPreview(getEmptyImage());
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
        ops: {},
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
      ops: {},
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
    const {connectDragSource, isDragging} = this.props;
    return connectDragSource(
      <div>
        {isDragging && <ActionDragLayer {...this.props}/>}
        <UserActionListItem
          {...this.props}
          handleChecked={this.handleChecked}
          handleActionUpdate={this.handleActionUpdate}
        />
      </div>
    );
  }
}
