import decorateComponentWithProps from 'decorate-component-with-props';
import Link from './Link';
//import styles from './styles.css';
import LinkEditor from './LinkEditor/LinkEditor';
import linkStrategy from './linkStrategy';

//const defaultTheme = {
//  link: styles.link
//};

const isDiff = (oldState, newState) => {
  const newKeys = Object.keys(newState);
  for (let i = 0; i < newKeys.length; i++) {
    const newKey = newKeys[i];
    if (oldState[newKey] !== newState[newKey]) {
      return true;
    }
  }
  return false;
};

class ReactiveDict {
  constructor(props) {
    this.state = props;
  }

  setComponent = (component) => {
    this.component = component;
  }

  unsetComponent = () => {
    this.component = null;
  }

  set = (setState) => {
    if (this.component) {
      const updatedState = setState(this.state);
      if (isDiff(this.state, updatedState)) {
        this.state = {
          ...this.state,
          ...updatedState
        };
        this.component.forceUpdate();
      }
    }
  }
}

export default (config = {}) => {
  // Styles are overwritten instead of merged as merging causes a lot of confusion.

  // Why? Because when merging a developer needs to know all of the underlying
  // styles which needs a deep dive into the code. Merging also makes it prone to
  // errors when upgrading as basically every styling change would become a major
  // breaking change. 1px of an increased padding can break a whole layout.

  const {
    component,
    theme = {},
    target = '_self'
  } = config;
  //
  const store = new ReactiveDict({isOpen: false});

  const modalProps = {
    getEditorState: undefined,
    setEditorState: undefined,
    store
    //theme
  };

  return {
    initialize: ({getEditorState, setEditorState}) => {
      modalProps.getEditorState = getEditorState;
      modalProps.setEditorState = setEditorState;
    },
    // Re-Render the text-toolbar on selection change
    onChange: (editorState) => {
      const selection = editorState.getSelection();
      if (selection.getHasFocus() && selection.isCollapsed()) {
        console.log('selection', selection);
        console.log('edstate', editorState);
        const currentContent = editorState.getCurrentContent();
        const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
        console.log('curBlock', currentBlock);
        const startOffset = selection.getStartOffset();
        console.log('off', startOffset);
        const blockwithlink = currentBlock.getEntityAt(startOffset);
        console.log('link block', blockwithlink)
        store.set(() => ({
          isOpen: true,
          modal: 'hover'
        }));
      } else {
        store.set(() => ({
          isOpen: false,
          modal: undefined
        }));
      }
      return editorState;
    },
    LinkEditor: decorateComponentWithProps(LinkEditor, modalProps),
    decorators: [
      {
        strategy: linkStrategy,
        component: decorateComponentWithProps(Link, {theme, target, component})
      }
    ]
  };
};
