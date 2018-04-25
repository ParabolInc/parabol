/**
 * The reflection card presentational component.
 *
 * @flow
 */
// $FlowFixMe
import React, {Component} from 'react';
import reactLifecyclesCompat from 'react-lifecycles-compat';
import ReflectionEditorWrapper from 'universal/components/ReflectionEditorWrapper';
import {ReflectionCardRoot} from 'universal/components/ReflectionCard/ReflectionCard';
import {convertFromRaw, EditorState} from 'draft-js';

type Props = {|
  content: string
|}

class ReflectionCardInFlight extends Component<Props> {
  state = {
    editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(this.props.content)))
  }

  render() {
    return (
      <ReflectionCardRoot>
        <ReflectionEditorWrapper
          editorState={this.state.editorState}
          readOnly
        />
      </ReflectionCardRoot>
    );
  }
}

reactLifecyclesCompat(ReflectionCardInFlight);

export default ReflectionCardInFlight;
