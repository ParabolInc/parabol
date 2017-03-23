import React, {Component} from 'react';
import DragState from 'universal/dnd/DragState';

const withDragState = (WrappedComponent) => {
  return class WithDragState extends Component {
    componentWillMount() {
      this.dragState = new DragState();
    }

    render() {
      return <WrappedComponent dragState={this.dragState} {...this.props} />;
    }
  };
};

export default withDragState;
