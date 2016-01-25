import React, {PropTypes, Component} from 'react';
import cssModules from 'react-css-modules';
import styles from './UserInput.scss';

@cssModules(styles)
export default class UserInput extends Component {
  static propTypes = {
    active: PropTypes.bool.isRequired,
    activeLabelMessage: PropTypes.string.isRequired,
    onUserInputChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  }
  render() {
    const props = this.props;
    const inputClassName = props.active ? styles.inputActive : styles.input;
    const activeLabel = () => {
      if (props.active) {
        return (
          <div styleName="activeLabel">
            {props.activeLabelMessage}
          </div>
        );
      }
    };
    return (
      <div styleName="root">
        <input className={inputClassName}
               onChange={() => props.onUserInputChange()}
               placeholder={props.placeholder}
               type={props.type}
               value={props.value} />
        {activeLabel()}
      </div>
    );
  }
}
