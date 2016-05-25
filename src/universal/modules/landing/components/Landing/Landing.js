import React, {PropTypes, Component} from 'react';
import look, { StyleSheet } from 'react-look';
import theme from 'universal/styles/theme';

// SVG images
import parabolLogoMark from './images/parabol-logo-mark.svg';
import actionLogo from './images/action-logo.svg';
import teamCheckIcon from './images/team-check-icon.svg';
import mapIcon from './images/map-icon.svg';
import megaphoneIcon from './images/megaphone-icon.svg';
import github from './images/github.svg';
// NOTE: The 4x PNG seems to hold up better as a background-image, opposed to the SVG
import parabolLogoColor from 'universal/styles/theme/images/brand/mark-color@4x.png';

let styles = {};
const combineStyles = StyleSheet.combineStyles;

// TODO break apart into 1 component per section

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class Landing extends Component {
  static propTypes = {
    // children included here for multi-part landing pages (FAQs, pricing, cha la la)
    // children: PropTypes.element,
    onMeetingCreateClick: PropTypes.func.isRequired
  };

  render() {
    const {onMeetingCreateClick} = this.props;

    return (
      <div className={styles.layout}>
        { /* Header */ }
        <div className={styles.header}>
          <div className={styles.container}>
            <a href="http://www.parabol.co/" title="Parabol, Inc.">
              <img className={styles.headerBrand} src={parabolLogoMark} />
            </a>
            <img className={styles.actionLogo} src={actionLogo} />
            <h1 className={styles.mainHeading}>Action</h1>
            <h2 className={styles.mainSubheading}>
              A rhythm for humans to enjoy <i>meaningful</i> work.
            </h2>
            <button
              className={styles.ctaButton}
              onClick={onMeetingCreateClick}
              title="Get Started"
            >
              Get Started
            </button>
            <br />
            { /* TODO: Add click handler for logging in */ }
            <a className={styles.headerLink} href="#" title="Log In">Or, log in</a>
          </div>
        </div>

        { /* Content */ }
        <div className={styles.content}>
          { /* How It Works */ }
          <div className={styles.section}>
            <div className={styles.container}>
              <h2 className={styles.sectionHeading}>How It Works</h2>
              <div className={styles.cardGroup}>

                <div className={styles.card}>
                  <div className={styles.cardBadge}>1</div>
                  <div className={styles.cardIconGroup}>
                    <img className={styles.cardIcon} src={teamCheckIcon} />
                  </div>
                  <div className={styles.cardCopy}>Check in with your team.</div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardBadge}>2</div>
                  <div className={styles.cardIconGroup}>
                    <img className={styles.cardIcon} src={mapIcon} />
                  </div>
                  <div className={styles.cardCopy}>Journey toward your next goals.</div>
                </div>

                <div className={combineStyles(styles.card, styles.cardIsLast)}>
                  <div className={styles.cardBadge}>3</div>
                  <div className={styles.cardIconGroup}>
                    <img className={styles.cardIcon} src={megaphoneIcon} />
                  </div>
                  <div className={styles.cardCopy}>Share your progress!</div>
                </div>
              </div>
            </div>
          </div>

          { /* Get Involved */ }
          <div className={combineStyles(styles.section, styles.sectionHasBorder)}>
            <div className={styles.container}>
              <h2 className={styles.sectionHeading}>Get Involved</h2>
              <img className={styles.githubIcon} src={github} />
              <br />
              <div className={styles.copyGroup}>
                <p className={styles.copyParagraph}>
                  Action is an open-source software solution crafted with
                  care by the folks at Parabol. We created this tool to make
                  work meaningful for agile business teams.
                </p>
                <p className={styles.copyParagraph}>
                  To get involved, <a href="https://github.com/ParabolInc/action/blob/master/CONTRIBUTING.md" title="Guidelines for contributing">see our guidelines for contributing on GitHub</a>.
                </p>
              </div>
            </div>
          </div>
        </div>

        { /* Footer */ }
        <div className={styles.footer}>
          <div className={styles.container}>
            <a href="http://www.parabol.co/" title="Parabol, Inc.">
              <img className={styles.footerBrand} src={parabolLogoMark} />
            </a>
            <div className={styles.footerCopy}>
              ©2016 <a className={styles.footerLink} href="http://www.parabol.co/" title="Parabol, Inc.">Parabol, Inc.</a> <br className={styles.footerBreak} />Made with care by friendly folks. <br className={styles.footerBreak} />Say hello: <a className={styles.footerLink} href="mailto:love@parabol.co" title="Say hello!">love@parabol.co</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Breakpoint constants
const layoutBreakpoint = '@media (min-width: 64rem)';
const headerBreakpoint = '@media (min-width: 48rem)';
const cardBreakpoint = '@media (min-width: 75rem)';

styles = StyleSheet.create({
  // Layout
  // -------

  layout: {
    // Define

    [layoutBreakpoint]: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }
  },

  header: {
    backgroundColor: theme.palette.warm,
    color: '#fff',
    textAlign: 'center',

    [headerBreakpoint]: {
      padding: '2rem 1rem'
    },

    [layoutBreakpoint]: {
      padding: 0
    }
  },

  headerBrand: {
    left: '1rem',
    position: 'absolute',
    top: '1rem',
    width: '2.75rem',

    ':hover': {
      opacity: '.65'
    },

    [headerBreakpoint]: {
      left: 0,
      top: 0,
      width: 'auto'
    },

    [layoutBreakpoint]: {
      left: '2rem',
      top: '2rem'
    }
  },

  content: {
    [layoutBreakpoint]: {
      flex: 1
    }
  },

  actionLogo: {
    display: 'inline-block',
    margin: '0 0 .5rem',
    width: '4rem',

    [headerBreakpoint]: {
      width: 'auto'
    }
  },

  mainHeading: {
    fontSize: '1.75rem',
    fontWeight: 700,
    margin: '0 0 1.125rem',

    [headerBreakpoint]: {
      fontSize: '3rem',
      margin: '0 0 1.875rem'
    }
  },

  mainSubheading: {
    fontSize: '1rem',
    fontWeight: 700,
    margin: '0 0 1rem',

    [headerBreakpoint]: {
      fontSize: theme.typography.fs6,
      fontWeight: 400,
      margin: '0 0 1.5rem'
    }
  },

  ctaButton: {
    backgroundColor: 'transparent',
    border: '1px solid currentColor',
    color: 'inherit',
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: '1.25rem',
    fontWeight: 700,
    margin: '.5rem 0 1rem',
    padding: '.75em 1.25em',
    textAlign: 'center',
    textDecoration: 'none',
    textTransform: 'uppercase',

    [headerBreakpoint]: {
      fontSize: '1.5rem',
      margin: '1rem 0'
    },

    // NOTE: Same styles for both :hover, :focus
    ':hover': {
      color: 'inherit',
      opacity: '.65',
      textDecoration: 'none'
    },
    ':focus': {
      color: 'inherit',
      opacity: '.65',
      textDecoration: 'none'
    }
  },

  headerLink: {
    color: 'inherit',
    display: 'inline-block',
    fontWeight: 700,

    // NOTE: Same styles for both :hover, :focus
    ':hover': {
      color: 'inherit',
      opacity: '.75'
    },
    ':focus': {
      color: 'inherit',
      opacity: '.75'
    }
  },

  section: {
    overflow: 'hidden',
    textAlign: 'center'
  },

  // Combine styles with section
  sectionHasBorder: {
    borderColor: theme.palette.tuBcA30a.bc,
    borderTopStyle: 'solid',
    borderTopWidth: '2px'
  },

  sectionHeading: {
    color: theme.palette.cool,
    fontSize: theme.typography.fs6,
    fontWeight: 700,
    margin: '0 0 2rem',
    textTransform: 'uppercase',

    [layoutBreakpoint]: {
      margin: '0 0 4rem'
    }
  },

  container: {
    margin: '0 auto',
    maxWidth: '80rem',
    padding: '2rem 1rem',
    position: 'relative',

    [layoutBreakpoint]: {
      padding: '4rem 2rem'
    }
  },

  cardGroup: {
    [layoutBreakpoint]: {
      // #shame use !important to force non-vendor prefix (TA)
      display: 'flex !important',
      justifyContent: 'center'
    }
  },

  // AL card
  // --------

  card: {
    borderColor: theme.palette.tuBcB30a.bc,
    borderRadius: '1rem',
    borderStyle: 'solid',
    borderWidth: '2px',
    margin: '0 auto 2rem',
    maxWidth: '30rem',
    padding: '2rem 1rem',
    position: 'relative',

    [layoutBreakpoint]: {
      flex: 1,
      margin: '0 1rem',
      maxWidth: 'none',
      padding: '4rem 1rem'
    }
  },

  // NOTE: Modifies card
  cardIsLast: {
    marginBottom: 0
  },

  cardBadge: {
    backgroundColor: theme.palette.warm,
    borderRadius: '100%',
    color: '#fff',
    fontSize: theme.typography.fs6,
    fontWeight: 700,
    height: '2rem',
    left: '50%',
    lineHeight: '2rem',
    marginLeft: '-1rem',
    position: 'absolute',
    textAlign: 'center',
    top: '-1rem',
    width: '2rem',

    [layoutBreakpoint]: {
      // NOTE: Breaks away from type scale, by design
      fontSize: '2rem',
      height: '2.75rem',
      lineHeight: '2.75rem',
      marginLeft: '-1.375rem',
      top: '-1.375rem',
      width: '2.75rem'
    }
  },

  cardIconGroup: {
    height: '4rem',
    lineHeight: '4rem',
    marginBottom: '.5rem'
  },

  cardIcon: {
    display: 'inline-block',
    verticalAlign: 'middle'
  },

  cardCopy: {
    color: theme.palette.dark,
    fontSize: theme.typography.fsBase,
    fontWeight: 700,

    [cardBreakpoint]: {
      fontSize: theme.typography.fs5
    }
  },

  // Copy
  // -----

  githubIcon: {
    display: 'inline-block',
    width: '4rem',

    [layoutBreakpoint]: {
      width: 'auto'
    }
  },

  copyGroup: {
    display: 'inline-block',
    fontSize: theme.typography.fsBase,
    margin: '0 auto',
    maxWidth: '30rem',
    textAlign: 'left',

    [layoutBreakpoint]: {
      fontSize: theme.typography.fs5,
      maxWidth: '40rem'
    }
  },

  copyParagraph: {
    margin: '1.5em 0 0'
  },

  // Footer
  // -------

  footer: {
    backgroundColor: theme.palette.dark,
    color: '#fff',
    fontSize: theme.typography.fs2,
    fontWeight: 700,
    lineHeight: '1.5',
    paddingBottom: '1rem',
    textAlign: 'center',

    [layoutBreakpoint]: {
      fontSize: theme.typography.fsBase,
      fontWeight: '400'
    }
  },

  footerBrand: {
    margin: '0 0 1rem',

    ':hover': {
      opacity: '.65'
    }
  },

  footerBreak: {
    display: 'block',

    [layoutBreakpoint]: {
      display: 'none'
    }
  },

  footerLink: {
    color: 'inherit',
    fontWeight: 700,

    // NOTE: Same styles for both :hover, :focus
    ':hover': {
      color: 'inherit',
      opacity: '.75'
    },
    ':focus': {
      color: 'inherit',
      opacity: '.75'
    }
  }
});

StyleSheet.addCSS({
  // auth0 lock customization
  // -------------------------
  // NOTE: https://auth0.com/docs/libraries/lock/ui-customization
  // NOTE: Beware what lies ahead, oh brave soul! #shame (TA)

  'body #a0-lock.a0-theme-default .a0-panel *': {
    fontFamily: theme.typography.actionUISansSerif
  },

  'body #a0-lock.a0-theme-default .a0-panel .a0-bg-gradient': {
    backgroundColor: theme.palette.tuBgC10o.bg,
    backgroundImage: 'none'
  },

  'body #a0-lock.a0-theme-default .a0-panel .a0-icon-container .a0-image': {
    backgroundImage: `url("${parabolLogoColor}")`,
    backgroundPosition: '0 14px',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '62px 56px',
    display: 'block',
    margin: '0 auto 12px',
    padding: 0,
    height: '70px',
    width: '62px'
  },

  'body #a0-lock.a0-theme-default .a0-panel .a0-icon-container .a0-image img': {
    display: 'none'
  },

  'body #a0-lock.a0-theme-default .a0-switch': {
    borderColor: theme.palette.dark
  },

  'body #a0-lock.a0-theme-default .a0-switch .a0-active': {
    backgroundColor: theme.palette.dark
  },

  'body #a0-lock.a0-theme-default .a0-switch span': {
    color: theme.palette.dark,
    fontWeight: 700
  },

  // eslint-disable-next-line max-len
  'body #a0-lock.a0-theme-default .a0-panel .a0-email .a0-input-box, body #a0-lock.a0-theme-default .a0-panel .a0-password .a0-input-box, body #a0-lock.a0-theme-default .a0-panel .a0-repeatPassword .a0-input-box, body #a0-lock.a0-theme-default .a0-panel .a0-username .a0-input-box': {
    backgroundColor: '#fff',
    borderColor: `transparent transparent ${theme.palette.tuBcC50o.bc}`,
    borderStyle: 'dashed',
    borderWidth: '1px 0'
  },

  'body #a0-lock.a0-theme-default .a0-panel button.a0-primary': {
    backgroundColor: `${theme.palette.warm} !important`
  }
});
