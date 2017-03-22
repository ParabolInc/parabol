import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';

// SVG images
import parabolLogoMark from './images/parabol-logo-mark.svg';
import actionLogo from './images/action-logo.svg';
import teamCheckIcon from './images/team-check-icon.svg';
import mapIcon from './images/map-icon.svg';
import megaphoneIcon from './images/megaphone-icon.svg';
import github from './images/github.svg';

const Landing = (props) => {
  const {handleLoginClick, styles} = props;
  return (
    <div className={css(styles.layout)}>
      {/* Header */}
      <div className={css(styles.header)}>
        <div className={css(styles.container)}>
          <a href="http://www.parabol.co/" title="Parabol, Inc.">
            <img className={css(styles.headerBrand)} src={parabolLogoMark} />
          </a>
          <img className={css(styles.actionLogo)} src={actionLogo} />
          <h1 className={css(styles.mainHeading)}>Action</h1>
          <h2 className={css(styles.mainSubheading)}>
            An open-source tool for adaptive teams.
          </h2>
          <button
            className={css(styles.ctaButton)}
            onClick={handleLoginClick}
            title="Get Started"
          >
            Get Started
          </button>
          <br />
          {/* TODO: Add click handler for logging in */}
          <a
            className={css(styles.headerLink)}
            href="#"
            title="Log In"
            onClick={handleLoginClick}
          >
            Or, log in
          </a>
        </div>
      </div>

      {/* Content */}
      <div className={css(styles.content)}>
        {/* How It Works */}
        <div className={css(styles.section)}>
          <div className={css(styles.container)}>
            <h2 className={css(styles.sectionHeading)}>How It Works</h2>
            <div className={css(styles.cardGroup)}>

              <div className={css(styles.card)}>
                <div className={css(styles.cardBadge)}>1</div>
                <div className={css(styles.cardIconGroup)}>
                  <img className={css(styles.cardIcon)} src={teamCheckIcon} />
                </div>
                <div className={css(styles.cardCopy)}>Check in with your team.</div>
              </div>

              <div className={css(styles.card)}>
                <div className={css(styles.cardBadge)}>2</div>
                <div className={css(styles.cardIconGroup)}>
                  <img className={css(styles.cardIcon)} src={mapIcon} />
                </div>
                <div className={css(styles.cardCopy)}>Journey toward your next goals.</div>
              </div>

              <div className={css(styles.card, styles.cardIsLast)}>
                <div className={css(styles.cardBadge)}>3</div>
                <div className={css(styles.cardIconGroup)}>
                  <img className={css(styles.cardIcon)} src={megaphoneIcon} />
                </div>
                <div className={css(styles.cardCopy)}>Share your progress!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Get Involved */}
        <div className={css(styles.section, styles.sectionHasBorder)}>
          <div className={css(styles.container)}>
            <h2 className={css(styles.sectionHeading)}>Get Involved</h2>
            <img className={css(styles.githubIcon)} src={github} />
            <br />
            <div className={css(styles.copyGroup)}>
              <p className={css(styles.copyParagraph)}>
                Action is an open-source software solution crafted with
                care by the folks at Parabol. We created this tool to make
                work meaningful for agile business teams.
              </p>
              <p className={css(styles.copyParagraph)}>
                To get involved,{' '}
                <a
                  href="https://github.com/ParabolInc/action/blob/master/CONTRIBUTING.md"
                  title="Guidelines for contributing"
                >
                  see our guidelines for contributing on GitHub
                </a>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={css(styles.footer)}>
        <div className={css(styles.container)}>
          <a href="http://www.parabol.co/" title="Parabol, Inc.">
            <img className={css(styles.footerBrand)} src={parabolLogoMark} />
          </a>
          <div className={css(styles.footerCopy)}>
            ©2016{' '}
            <a
              className={css(styles.footerLink)}
              href="http://www.parabol.co/"
              title="Parabol, Inc."
            >
              Parabol, Inc.
            </a>{' '}
            <br className={css(styles.footerBreak)} />
            Made with care by friendly folks.{' '}
            <br className={css(styles.footerBreak)} />
            Say hello:{' '}
            <a
              className={css(styles.footerLink)}
              href="mailto:love@parabol.co"
              title="Say hello!"
            >
              love@parabol.co
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

Landing.propTypes = {
  // children included here for multi-part landing pages (FAQs, pricing, cha la la)
  // children: PropTypes.element,
  handleLoginClick: PropTypes.func.isRequired,
  styles: PropTypes.object,
};

// Breakpoint constants
const layoutBreakpoint = '@media (min-width: 64rem)';
const headerBreakpoint = '@media (min-width: 48rem)';
const cardBreakpoint = '@media (min-width: 75rem)';

const styleThunk = () => ({
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
    backgroundColor: appTheme.palette.warm,
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
      fontSize: appTheme.typography.s6,
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
    borderColor: appTheme.palette.cool30a,
    borderTopStyle: 'solid',
    borderTopWidth: '2px'
  },

  sectionHeading: {
    color: appTheme.palette.cool,
    fontSize: appTheme.typography.s6,
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
    borderColor: appTheme.palette.warm30a,
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
    backgroundColor: appTheme.palette.warm,
    borderRadius: '100%',
    color: '#fff',
    fontSize: appTheme.typography.s6,
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
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.sBase,
    fontWeight: 700,

    [cardBreakpoint]: {
      fontSize: appTheme.typography.s5
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
    fontSize: appTheme.typography.sBase,
    margin: '0 auto',
    maxWidth: '30rem',
    textAlign: 'left',

    [layoutBreakpoint]: {
      fontSize: appTheme.typography.s5,
      maxWidth: '40rem'
    }
  },

  copyParagraph: {
    margin: '1.5em 0 0'
  },

  // Footer
  // -------

  footer: {
    backgroundColor: appTheme.palette.dark,
    color: '#fff',
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: '1.5',
    paddingBottom: '1rem',
    textAlign: 'center',

    [layoutBreakpoint]: {
      fontSize: appTheme.typography.sBase,
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

// injectGlobals(auth0Overrides);
export default withStyles(styleThunk)(Landing);
