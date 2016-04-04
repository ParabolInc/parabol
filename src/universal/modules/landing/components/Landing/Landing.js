import React, {PropTypes, Component} from 'react';
import mapStyles from 'universal/utils/mapStyles';
import styles from './Landing.scss';
import parabolLogoMark from './images/parabol-logo-mark.svg';
import actionClapper from './images/action-clapper.svg';
import teamCheck from './images/team-check.svg';
import starredList from './images/starred-list.svg';
import editPencil from './images/edit-pencil.svg';
import target from './images/target.svg';
import userInterface from './images/user-interface.svg';
import dashboardGauge from './images/dashboard-gauge.svg';
import stopwatch from './images/stopwatch.svg';
import glasses from './images/glasses.svg';
import forwardSign from './images/forward-sign.svg';
import github from './images/github.svg';

// TODO break apart into 1 component per section
// TODO get rid of mapStyles
export default class Landing extends Component {
  static propTypes = {
    // children included here for multi-part landing pages (FAQs, pricing, cha la la)
    // children: PropTypes.element,
    onMeetingCreateClick: PropTypes.func.isRequired
  };
  render() {

    const {onMeetingCreateClick} = this.props;

    return (
      <div>
        { /* Header */ }
        <div className={mapStyles(styles, 'header tu-bg-b text-white tc pvm pvl-m pvxl-l pos-rel')} >
          <img className={mapStyles(styles, 'pos-abs top-2 left-2 dn db-m db-l')} src={parabolLogoMark} />
          <div className={mapStyles(styles, 'mw8 dib w-100')}>
            <div className={styles['action-landing-logo']}>
              <img src={actionClapper} />
            </div>
            <h1 className={mapStyles(styles, 'lh-title action-landing-heading normal mvs mvm-l')}>Action</h1>
            <h2 className={mapStyles(styles, 'lh-title normal mvs mvm-l f4 f2-l')}>
              Team-focused. <br className={mapStyles(styles, 'dn-m dn-l')} />
              Time-friendly. <br className={mapStyles(styles, 'dn-m dn-l')} />
              Meaningful take-aways.
            </h2>
            <button className={mapStyles(styles, 'action-landing-cta-button')}
                    onClick={onMeetingCreateClick}
                    title="Start a Meeting">
              Start a Meeting
            </button>
          </div>
        </div>

        { /* How It Works */ }
        <div className={mapStyles(styles, 'tc pam pal-l')}>
          <div className={mapStyles(styles, 'mw9 dib w-100 cf')}>
            { /* <h2 className={mapStyles(styles, 'lh-title b f2 tu-color-a ttu mbs mbm-m mbl-l mtn')}>How It Works</h2> */ }
            <h2 className={mapStyles(styles, 'lh-title b f2 tu-color-a ttu mbs mbm-m mbl-l mtn')}>How It Works</h2>
            <div className={mapStyles(styles, 'w-33-l fl-l pvxs pvs-m phm-l mtl mtn-l')}>
              <div className={mapStyles(styles, 'tu-bc-b-30a ba bw1 br4 pal pvxl-l pos-rel')}>
                <div className={mapStyles(styles, 'action-landing-hiw-badge')}>1</div>
                <div className={mapStyles(styles, 'dib h3')}>
                  <img className={mapStyles(styles, 'dib v-mid')} src={teamCheck} />
                </div>
                <div className={mapStyles(styles, 'db f4 f2-l')}>Check in with your team.</div>
              </div>
            </div>
            <div className={mapStyles(styles, 'w-33-l fl-l pvxs pvs-m phm-l mtl mtn-l')}>
              <div className={mapStyles(styles, 'tu-bc-b-30a ba bw1 br4 pal pvxl-l pos-rel')}>
                <div className={mapStyles(styles, 'action-landing-hiw-badge')}>2</div>
                <div className={mapStyles(styles, 'dib h3')}>
                  <img className={mapStyles(styles, 'dib v-mid')} src={starredList} />
                </div>
                <div className={mapStyles(styles, 'db f4 f2-l')}>Check the status of projects.</div>
              </div>
            </div>
            <div className={mapStyles(styles, 'w-33-l fl-l pvxs pvs-m phm-l mtl mtn-l')}>
              <div className={mapStyles(styles, 'tu-bc-b-30a ba bw1 br4 pal pvxl-l pos-rel')}>
                <div className={mapStyles(styles, 'action-landing-hiw-badge')}>3</div>
                <div className={mapStyles(styles, 'dib h3')}>
                  <img className={mapStyles(styles, 'dib v-mid')} src={editPencil} />
                </div>
                <div className={mapStyles(styles, 'db f4 f2-l')}>Set an agenda for new work.</div>
              </div>
            </div>
          </div>
        </div>

        { /* Features */ }
        <div className={mapStyles(styles, 'tc bt bw1 tu-bc-a-30a pam pal-l')}>
          <div className={mapStyles(styles, 'mw7 dib')}>
            <h2 className={mapStyles(styles, 'lh-title b f2 tu-color-a ttu mbs mbm-m mbl-l mtn')}>Features</h2>
            <div className={mapStyles(styles, 'mvl mvxl-l tl-l')}>
              <img className={mapStyles(styles, 'dib v-mid mbs mbn-l mrl-l')} src={target} />
              <p className={mapStyles(styles, 'db dib-l v-mid f4 f3-m f2-l tl-l man')}>
                A razor-focused UX with real-time updates.
              </p>
            </div>
            <div className={mapStyles(styles, 'mvl mvxl-l tl-l')}>
              <img className={mapStyles(styles, 'dib v-mid mbs mbn-l mrl-l')} src={userInterface} />
              <p className={mapStyles(styles, 'db dib-l v-mid f4 f3-m f2-l tl-l man')}>
                A clean, minimal UI with friendly keyboard shortcuts.
              </p>
            </div>
            <div className={mapStyles(styles, 'mvl mvxl-l tl-l')}>
              <img className={mapStyles(styles, 'dib v-mid mbs mbn-l mrl-l')} src={dashboardGauge} />
              <p className={mapStyles(styles, 'db dib-l v-mid f4 f3-m f2-l tl-l man')}>
                A dashboard to keep up with teams, projects and tasks.
              </p>
            </div>
          </div>
        </div>

        { /* We Believe… */ }
        <div className={mapStyles(styles, 'tc bt bw1 tu-bc-a-30a pam pal-l')}>
          <div className={mapStyles(styles, 'mw8 dib w-100')}>
            <h2 className={mapStyles(styles, 'lh-title b f2 tu-color-a ttu mbs mbm-m mbl-l mtn')}>We Believe…</h2>
            <div className={mapStyles(styles, 'pvl pvxl-l mw7 dib')}>
              <img className={mapStyles(styles, 'dib mw3 mw-none-l')} src={stopwatch} />
              <h3 className={mapStyles(styles, 'f3 f2-m f1-l tu-color-a mvs mvm-l lh-title b')}>Time is valuable.</h3>
              <p className={mapStyles(styles, 'f4 f2-l mvs mvm-l lh-copy')}>Meetings should be as short as possible, on-topic, and result in team members knowing how to move forward.</p>
            </div>
            <div className={mapStyles(styles, 'pvl pvxl-l mw7 dib tu-bc-b-30a bt bw1')}>
              <img className={mapStyles(styles, 'dib mw3 mw-none-l')} src={glasses} />
              <h3 className={mapStyles(styles, 'f3 f2-m f1-l tu-color-a mvs mvm-l lh-title b')}>Transparency is essential.</h3>
              <p className={mapStyles(styles, 'f4 f2-l mvs mvm-l lh-copy')}>Every team member has a chance to speak to how they are doing and how they have made progress.</p>
            </div>
            <div className={mapStyles(styles, 'pvl pvxl-l mw7 dib tu-bc-b-30a bt bw1')}>
              <img className={mapStyles(styles, 'dib mw3 mw-none-l')} src={forwardSign} />
              <h3 className={mapStyles(styles, 'f3 f2-m f1-l tu-color-a mvs mvm-l lh-title b')}>Momentum is imperative.</h3>
              <p className={mapStyles(styles, 'f4 f2-l mvs mvm-l lh-copy')}>Meetings should resolve tensions and friction so that you can focus on solving your organization’s real problems.</p>
            </div>
          </div>
        </div>

        { /* Get Involved */ }
        <div className={mapStyles(styles, 'tc bt bw1 tu-bc-a-30a pam pal-l')}>
          <div className={mapStyles(styles, 'mw8 dib w-100')}>
            <h2 className={mapStyles(styles, 'lh-title b f2 tu-color-a ttu mbs mbm-m mbl-l mtn')}>Get Involved</h2>
            <img className={mapStyles(styles, 'dib mw3 mw-none-l')} src={github} />
            <br />
            <p className={mapStyles(styles, 'f4 f3-m f2-l mw7 dib tl mvs mvm-l')}>
              Action is an <b>open-source software solution</b> crafted with
              care by the folks at Parabol. We created this tool to help teams
              have more productive meetings, so they can make progress on the
              real work. To get involved, <a href="#" title="Guidelines for contributing">see our guidelines for forking and creating a pull request on GitHub</a>.
            </p>
          </div>
        </div>

        { /* Footer */ }
        <div className={mapStyles(styles, 'tc tu-bg-c pvm pvl-m pvxl-l')}>
          <div className={mapStyles(styles, 'mw8 dib w-100 text-white')}>
            <img className={mapStyles(styles, 'dib mbm-l')} src={parabolLogoMark} />
            <p className={mapStyles(styles, 'man')}>
              ©2016 Parabol, Inc.
              <span className={mapStyles(styles, 'dn di-m di-l')}> — </span>
              <br className={mapStyles(styles, 'dn-m dn-l')} />
              Made with care in NY, SC &amp; TX
            </p>
          </div>
        </div>

      </div>
    );
  }
}
