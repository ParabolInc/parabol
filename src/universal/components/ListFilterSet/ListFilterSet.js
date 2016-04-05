import React, {Component} from 'react';
import cssModules from 'react-css-modules';
import styles from './ListFilterSet.scss';

@cssModules(styles)
export default class ListFilterSet extends Component {
  render() {
    return (
      <div styleName="main">
        <div styleName="checkboxBlock">
          <input type="checkbox" />
        </div>
        <div styleName="label">
          Filter by:
        </div>
        <div styleName="nav">
          {/* Bootstrap nav component */}
          <ul className="nav nav-pills">
            <li role="presentation" className="active">
              <a href="#" title="All Teams">All Teams</a>
            </li>
            <li role="presentation">
              <a href="#" title="Core">Core</a>
            </li>
            <li role="presentation">
              <a href="#" title="Design">Design</a>
            </li>
            <li role="presentation">
              <a href="#" title="Engineering">Engineering</a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
