import React, {Component, lazy, Suspense} from 'react'
import withHotkey from 'react-hotkey-hoc'
import LoadableFreeModal from '../../components/LoadableFreeModal'

const EditorHelpModal = lazy(() =>
  import(/* webpackChunkName: 'EditorHelpModal' */ 'universal/components/EditorHelpModal/EditorHelpModal')
)

interface Props {
  bindHotkey: any
}

interface State {
  isOpen: boolean
}

class EditorHelpModalContainer extends Component<Props, State> {
  state = {
    isOpen: false
  }

  componentDidMount() {
    const {bindHotkey} = this.props
    bindHotkey('?', this.toggleModal)
    bindHotkey('escape', this.closeModal)
  }

  toggleModal = () => {
    this.setState({isOpen: !this.state.isOpen})
  }

  closeModal = () => {
    this.setState({isOpen: false})
  }

  render() {
    return (
      <Suspense fallback={''}>
        <LoadableFreeModal
          LoadableComponent={EditorHelpModal}
          queryVars={{handleCloseModal: this.closeModal}}
          isModalOpen={this.state.isOpen}
          closeModal={this.closeModal}
        />
      </Suspense>
    )
  }
}

export default withHotkey(EditorHelpModalContainer)
