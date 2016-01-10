import React, { Component } from 'react';

export default class Landing extends Component {
  render() {
    const styles = require('./Landing.scss');
    const parabolLogoMark = require('./images/parabol-logo-mark.svg');
    const actionClapper = require('./images/action-clapper.svg');

    return (
      <div className="header tu-bg-b text-white tc pvm pvl-m pvxl-l pos-rel">
        <img className="pos-abs top-2 left-2 dn db-m db-l" src={parabolLogoMark} />
        <div className="mw8 dib w-100">
          <div className={styles['action-landing-logo']}>
            <img src={actionClapper} />
          </div>
          <h1 className="action-landing-heading normal mvs mvm-l">Action</h1>
          <h2 className="normal mvs mvm-l f4 f2-l">
            Team-focused.<br className="dn-m dn-l" />
            Time-friendly.<br className="dn-m dn-l" />
            Meaningful take-aways.
          </h2>
          <a className="action-landing-cta-button" href="#" title="Start a Meeting">Start a Meeting</a>
        </div>
      </div>

    );
  }
}
