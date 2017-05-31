import React, {Children, Component} from 'react';

const mentionModal = (ComposedComponent) => {
  class MentionWrapper extends Component {
    state = {
      options: [],
      lastQuery: undefined
    };

    componentWillReceiveProps(nextProps) {
      const {query, resolve} = nextProps;
      if (this.props.query !== query) {
        this.makeOptions(query, resolve);
      }
    }

    makeOptions = async (query, resolve) => {
      const options = await resolve(query);
      if (options.length > 0) {
        this.setState({
          options,
          //lastQuery: query
        });
      } else {
        this.closeMenu();
      }
    };

    //maybeMention() {
    //  const textBeforeCaret = this.ref.value.slice(0, this.ref.selectionStart);
    //  const triggerIdx = textBeforeCaret.lastIndexOf(' ') + 1;
    //  const maybeTrigger = textBeforeCaret[triggerIdx];
    //  const keystrokeTriggered = this.triggers.indexOf(maybeTrigger);
    //  if (keystrokeTriggered !== -1) {
    //    const query = textBeforeCaret.slice(triggerIdx + 1);
    //    const coords = getCaretCoords(this.ref, this.ref.selectionStart);
    //    const {top, left} = this.ref.getBoundingClientRect();
    //    const child = getMenuProps(keystrokeTriggered, this.props.children);
    //    const {replace, resolve} = child;
    //    this.replace = replace || defaultReplace;
    //    this.makeOptions(query, resolve);
    //    // that stupid bug where the caret moves to the end happens unless we do it next tick
    //    setTimeout(() => {
    //      this.setState({
    //        active: 0,
    //        child,
    //        left: coords.left + left + this.ref.scrollLeft,
    //        triggerIdx,
    //        top: coords.top + top + coords.height - this.ref.scrollTop
    //      })
    //    }, 0)
    //  } else {
    //    this.closeMenu();
    //  }
    //}

    closeMenu() {
      //setTimeout(() => {
      this.setState({
        options: [],
        //lastQuery: undefined,
        triggerIdx: undefined
      })
      //}, 0)
    }

    handleInput = (e) => {
      this.maybeMention();
      const {onInput} = this.props;
      if (onInput) {
        onInput(e);
      }
    };

    inputRef = (c) => {
      this.ref = c;
      const {getRef} = this.props;
      if (getRef) {
        getRef(c);
      }
    };

    handleBlur = (e) => {
      // if the menu is open, don't treat a click as a blur (required for the click handler)
      const {onBlur} = this.props;
      if (onBlur && !this.state.top) {
        onBlur(e);
      }
    };

    handleKeyDown = (e) => {
      const {options, active, triggerIdx} = this.state;
      let keyCaught;
      if (triggerIdx !== undefined) {
        if (e.key === 'ArrowDown') {
          this.setState({
            active: Math.min(active + 1, options.length - 1)
          })
          keyCaught = true;
        } else if (e.key === 'ArrowUp') {
          this.setState({
            active: Math.max(active - 1, 0)
          })
          keyCaught = true;
        } else if (e.key === 'Tab' || e.key === 'Enter') {
          this.selectItem(active)(e);
          keyCaught = true;
        }
      }
      const {onKeyDown} = this.props;
      if (keyCaught) {
        e.preventDefault();
      } else if (onKeyDown) {
        // only call the passed in keyDown handler if the key wasn't one of ours
        onKeyDown(e);
      }
    };

    selectItem = (active) => (e) => {
      const {options, triggerIdx} = this.state;
      const preMention = this.ref.value.substr(0, triggerIdx);
      const option = options[active];
      const mention = this.replace(option, this.ref.value[triggerIdx]);
      const postMention = this.ref.value.substr(this.ref.selectionStart);
      const newValue = `${preMention}${mention}${postMention}`;
      this.ref.value = newValue;
      const {onChange} = this.props;
      if (onChange) {
        onChange(e, newValue);
      }
      const caretPosition = this.ref.value.length - postMention.length;
      this.ref.setSelectionRange(caretPosition, caretPosition);
      this.closeMenu();
      this.ref.focus();
    }

    render() {
      const {children, component, getRef, ...inputProps} = this.props;
      const {active, child, left, top, options} = this.state;
      const {item, className, style} = child;
      if (top === undefined) return null;
      return (
        <ComposedComponent
          active={active}
          className={className}
          left={left}
          isOpen={options.length > 0}
          item={item}
          options={options}
          selectItem={this.selectItem}
          style={style}
          top={top}
        />
      );
    }
  }
  return MentionWrapper;
}

export default mentionModal;