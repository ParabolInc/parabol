/**
 * The reflection card presentational component.
 *
 * @flow
 */
// $FlowFixMe
import React, {Component} from 'react';
import ReflectionEditorWrapper from 'universal/components/ReflectionEditorWrapper';
import {ReflectionCardRoot} from 'universal/components/ReflectionCard/ReflectionCard';
import {convertFromRaw, EditorState} from 'draft-js';
import styled from 'react-emotion';
import ui from 'universal/styles/ui';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {commitLocalUpdate, createFragmentContainer} from 'react-relay';
import type {ReflectionCardInFlight_reflection as Reflection} from './__generated__/ReflectionCardInFlight_reflection.graphql';

type Coords = {
  x: number,
  y: number
};

type Props = {|
  atmosphere: Object,
  initialComponentOffset: Coords,
  initialCursorOffset: Coords,
  reflection: Reflection
|}

const ModalBlock = styled('div')({
  top: 0,
  left: 0,
  padding: '.25rem .5rem',
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: ui.ziTooltip
});

class ReflectionCardInFlight extends Component<Props> {
  constructor(props) {
    super(props);
    this.initialComponentOffset = props.initialComponentOffset;
    this.initialCursorOffset = props.initialCursorOffset;
    this.editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(this.props.reflection.content)));
  }

  componentDidMount() {
    window.addEventListener('drag', this.setDragState);
  }

  componentWillUnmount() {
    window.removeEventListener('drag', this.setDragState);
  }

  setDragState = (e) => {
    const {atmosphere, reflection: {reflectionId, dragX, dragY}} = this.props;
    const xDiff = e.x - this.initialCursorOffset.x;
    const yDiff = e.y - this.initialCursorOffset.y;
    const x = this.initialComponentOffset.x + xDiff;
    const y = this.initialComponentOffset.y + yDiff;
    if (x !== dragX || y !== dragY) {
      commitLocalUpdate(atmosphere, (store) => {
        const reflection = store.get(reflectionId);
        reflection.setValue(x, 'dragX');
        reflection.setValue(y, 'dragY');
      });
    }
  }

  render() {
    const {reflection: {dragX, dragY}} = this.props;
    if (!dragX || !dragY) return null;
    const transform = `translate3d(${dragX}px, ${dragY}px, 0px)`;
    return (
      <ModalBlock style={{transform}}>
        <ReflectionCardRoot>
          <ReflectionEditorWrapper
            editorState={this.editorState}
            readOnly
          />
        </ReflectionCardRoot>
      </ModalBlock>
    );
  }
}

export default createFragmentContainer(
  withAtmosphere(ReflectionCardInFlight),
  graphql`
    fragment ReflectionCardInFlight_reflection on RetroReflection {
      reflectionId: id
      content
      dragX
      dragY
    }
  `
);
