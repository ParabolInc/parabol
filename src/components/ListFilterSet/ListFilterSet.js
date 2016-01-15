import React, {Component} from 'react';

export default class ListFilterSet extends Component {
  render() {
    const styles = require('./ListFilterSet.scss');
    return (
      <div className={styles.main}>
        <div className={styles.checkboxBlock}>
          <input type="checkbox" />
        </div>
        <div className={styles.label}>
          Filter by:
        </div>
        <div className={styles.nav}>
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
