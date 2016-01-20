import React, {PropTypes, Component} from 'react';

export default class TaskListItem extends Component {
  static propTypes = {
    checked: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    onCheckboxChanged: PropTypes.func.isRequired,
    team: PropTypes.string.isRequired,
    timePassed: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
  }
  render() {
    const styles = require('./TaskListItem.scss');
    const props = this.props;
    const itemClassName = props.checked ? styles.itemSelected : styles.item;
    return (
      <div className={itemClassName}>
        <input type="checkbox"
               checked={props.checked ? 'checked' : false}
               onChange={props.onCheckboxChanged} />
        <div className={styles.tag}>
          {props.label}
        </div>
        <div className={styles.team}>
          {props.team}
        </div>
        <div className={styles.title}>
          {props.title}
        </div>
        <div className={styles.timePassed}>
          {props.timePassed}
        </div>
      </div>
    );
  }
}
