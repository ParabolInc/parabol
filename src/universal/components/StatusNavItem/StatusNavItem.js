import React, {PropTypes, Component} from 'react';
import cssModules from 'react-css-modules';
import styles from './StatusNavItem.scss';

@cssModules(styles)
export default class StatusNavItem extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    alerts: PropTypes.string,
    icon: PropTypes.string
  }
  render() {
    const props = this.props;
    const itemStyles = props.active ? styles.itemActive : styles. item;
    const icon = () => {
      if (props.icon) {
        switch (props.icon) {
          case 'trash':
            return (
              <div styleName="icon">
                <i className="fa fa-trash-o"></i>
              </div>
            );
          default:
            return null;
        }
      }
    };
    const badge = () => {
      if (props.alerts) {
        return (
          <div styleName="badge">
            {props.alerts}
          </div>
        );
      }
    };
    return (
      <div className={itemStyles}>
        {icon()}
        {props.label}
        {badge()}
      </div>
    );
  }
}
