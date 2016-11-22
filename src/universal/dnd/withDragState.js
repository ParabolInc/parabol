import React, {Component, PropTypes} from 'react';
import {StyleSheet} from 'aphrodite-local-styles/no-important';
import DragState from 'universal/dnd/DragState';

const withDragState = (WrappedComponent) => {
  return class WithDragState extends Component {
    constructor(props) {
      super(props);
    }

    componentWillMount() {
      this.dragState = new DragState();
    }

    render() {
      return <WrappedComponent dragState={this.dragState} {...this.props}/>;
    }
  };
};

export default withDragState;
