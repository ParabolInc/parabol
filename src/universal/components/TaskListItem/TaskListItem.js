import React, {PropTypes, Component} from 'react';
import cssModules from 'react-css-modules';
import styles from './TaskListItem.scss';

@cssModules(styles)
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
    const props = this.props;
    const itemClassName = props.checked ? styles.itemSelected : styles.item;
    return (
      <div className={itemClassName}>
        <input type="checkbox"
               checked={props.checked ? 'checked' : false}
               onChange={props.onCheckboxChanged} />
        <div styleName="tag">
          {props.label}
        </div>
        <div styleName="team">
          {props.team}
        </div>
        <div styleName="title">
          {props.title}
        </div>
        <div styleName="timePassed">
          {props.timePassed}
        </div>
      </div>
    );
  }
}
