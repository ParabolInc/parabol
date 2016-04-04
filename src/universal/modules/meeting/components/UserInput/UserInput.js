import React, { Component, PropTypes } from 'react';
import cssModules from 'react-css-modules';
import styles from './UserInput.scss';

@cssModules(styles)
export default class UserInput extends Component {
  static propTypes = {
    active: PropTypes.bool.isRequired,
    activeLabelMessage: PropTypes.string.isRequired,
    onUserInputChange: PropTypes.func.isRequired,
    onUserInputFocus: PropTypes.func,
    onUserInputBlur: PropTypes.func,
    placeholder: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  }
  render() {
    const { props } = this;
    const inputClassName = props.active ? styles.inputActive : styles.input;
    const activeLabel = () => {
      return (
        <div styleName="activeLabel">
          {props.activeLabelMessage}
        </div>
      );
    };
    return (
      <div styleName="root">
        <input className={inputClassName}
               onChange={props.onUserInputChange}
               onFocus={props.onUserInputFocus}
               onBlur={props.onUserInputBlur}
               placeholder={props.placeholder}
               type={props.type}
               value={props.value} />
        {props.active && activeLabel()}
      </div>
    );
  }
}
