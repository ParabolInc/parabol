import {ContentState, EditorState} from 'draft-js'
import {Component, ReactNode} from 'react'

interface Props {
  contentState: ContentState
  offsetkey: string
  entityKey: string
  children: ReactNode
}

const TruncatedEllipsis = (setEditorState?: (editorState: EditorState) => void) =>
  class TruncatedEllipsisClass extends Component<Props> {
    onClick = () => {
      const {contentState, entityKey} = this.props
      const {value} = contentState.getEntity(entityKey).getData()
      setEditorState && setEditorState(value)
    }

    render() {
      const {offsetkey, children} = this.props
      return (
        <span data-offset-key={offsetkey} style={{cursor: 'pointer'}} onClick={this.onClick}>
          {children}
        </span>
      )
    }
  }

export default TruncatedEllipsis
