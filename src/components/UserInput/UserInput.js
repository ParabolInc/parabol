import React, {PropTypes, Component} from 'react';

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
    const styles = require('./UserInput.scss');
    const props = this.props;
    const inputClassName = props.active ? styles.inputActive : styles.input;
    const activeLabel = () => {
      if (props.active) {
        return (
          <div className={styles.activeLabel}>
            {props.activeLabelMessage}
          </div>
        );
      }
    };
    return (
      <div className={styles.root}>
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
