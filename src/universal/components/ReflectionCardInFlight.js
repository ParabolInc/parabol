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

type Props = {|
  content: string
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
    this.editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(this.props.content)))
  }

  state = {
    x: 0,
    y: 0
  }

  componentDidMount() {
    window.addEventListener('drag', this.setDragState)
  }

  componentWillUnmount() {
    window.removeEventListener('drag', this.setDragState)
  }

  setDragState = (e) => {
    const xDiff = e.x - this.initialCursorOffset.x;
    const yDiff = e.y - this.initialCursorOffset.y;
    const x = this.initialComponentOffset.x + xDiff;
    const y = this.initialComponentOffset.y + yDiff;
    if (x !== this.state.x || y !== this.state.y) {
      this.setState({
        x,
        y
      })
    }
  }

  render() {
    const {x, y} = this.state;
    if (!x || !y) return null;
    const transform = `translate3d(${x}px, ${y}px, 0px)`;
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

export default ReflectionCardInFlight;
