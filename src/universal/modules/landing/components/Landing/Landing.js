import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import Button from 'universal/components/Button/Button';

// Images
import parabolLogoMark from 'universal/styles/theme/images/brand/parabol-lockup-h.svg';
import teamCheckIcon from './images/team-check-icon.svg';
import mapIcon from './images/map-icon.svg';
import megaphoneIcon from './images/megaphone-icon.svg';
import github from './images/github.svg';
import teamingPhoto from 'universal/styles/theme/images/banners/teaming.jpg';

const Landing = (props) => {
  const {handleLoginClick, styles} = props;
  return (
    <div className={css(styles.layout)}>
      {/* Header */}
      <div className={css(styles.header)}>
        <div className={css(styles.headerInner)}>
          <div className={css(styles.container)}>
            <a className={css(styles.brandLink)} href="http://www.parabol.co/" title="Parabol, Inc.">
              <img className={css(styles.brandLogo)} src={parabolLogoMark} />
            </a>
            <h1 className={css(styles.mainHeading)}>
              {'The Unified Dashboard for All Disciplines'}
            </h1>
            <h2 className={css(styles.mainSubheading)}>
              {'Today’s teams have many tools, but only one set of priorities.'}
              <br />
              {`PARABOL enables cross-functional collaboration and clarity by
                syncing teams in a single daily dashboard with a weekly ritual.`}
            </h2>
            <div className={css(styles.primaryButtonBlock)}>
              <Button
                buttonSize="large"
                buttonStyle="solid"
                colorPalette="warm"
                depth={1}
                isBlock
                label="Get Started"
                onClick={handleLoginClick}
                textTransform="uppercase"
              />
            </div>
            <Button
              buttonSize="small"
              buttonStyle="outlined"
              colorPalette="white"
              depth={1}
              label="Log In"
              onClick={handleLoginClick}
              textTransform="uppercase"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={css(styles.content)}>

        {/* Video */}
        <div className={css(styles.section)}>
          <div className={css(styles.container)}>
            <h2 className={css(styles.sectionHeading, styles.firstHeading)}>Parabol 101</h2>
            <p className={css(styles.copyGroup, styles.firstCopy)}>
              {'Curious about how Parabol works? Here’s a demo video of our beta software. '}
              {'Check back frequently for updates as our software evolves!'}
              <br />
              <br />
              <b>
                <a
                  href="https://docs.google.com/presentation/d/1bxpUB6hLSSZRnkPngZOPggEaQm5_qv5TmgLa9maiglc/edit?usp=sharing"
                  title="Learn More: The Theory Behind Parabol"
                >
                  {'Learn More: The Theory Behind Parabol'}
                </a>
              </b>
            </p>
            <div className="wistia_responsive_padding" style={{padding: '56.25% 0 0 0', position: 'relative'}}>
              <div className="wistia_responsive_wrapper" style={{height: '100%', left: 0, position: 'absolute', top: 0, width: '100%'}}>
                <div className="wistia_embed wistia_async_zoyitx0tkh videoFoam=true" style={{height: '100%', width: '100%'}}>&nbsp;</div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className={css(styles.section)} style={{display: 'none'}}>
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
                {'The “Action” codebase by Parabol is an open-source software solution.'}
                <br />
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
            {'©2017 Crafted with care by '}
            <br className={css(styles.footerBreak)} />
            {'the friendly folks at '}
            <a
              className={css(styles.footerLink)}
              href="http://www.parabol.co/"
              title="Parabol, Inc."
            >
              Parabol, Inc.
            </a>{' '}
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
  styles: PropTypes.object
};

// Breakpoint constants
const layoutBreakpoint = '@media (min-width: 64rem)';
const headerBreakpoint = '@media (min-width: 48rem)';
const cardBreakpoint = '@media (min-width: 75rem)';
const textShadow = '0 1px 0 rgba(0, 0, 0, .5)';

const styleThunk = () => ({
  // Layout
  // -------

  layout: {
    lineHeight: 1.5,

    [layoutBreakpoint]: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }
  },

  header: {
    alignItems: 'center',
    backgroundColor: appTheme.palette.warm,
    backgroundImage: `url(${teamingPhoto})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: 'calc(100vw * .35)',
    position: 'relative',
    textAlign: 'center',
    width: '100%',

    [headerBreakpoint]: {
      padding: '2rem 1rem'
    },

    [layoutBreakpoint]: {
      padding: 0
    },

    '::after': {
      backgroundColor: appTheme.palette.dark,
      bottom: 0,
      content: '""',
      left: 0,
      opacity: '.65',
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 100
    }
  },

  headerInner: {
    position: 'relative',
    zIndex: 200
  },

  brandLink: {
    cursor: 'pointer',
    display: 'block',
    margin: '0 auto 2rem',
    opacity: '.65',

    ':hover': {
      opacity: '1'
    },
    ':focus': {
      opacity: '1'
    }
  },

  brandLogo: {
    width: '12rem'
  },

  content: {
    [layoutBreakpoint]: {
      flex: 1
    }
  },

  mainHeading: {
    fontSize: '1.75rem',
    fontWeight: 700,
    margin: '0 0 .25em',
    textShadow,

    [headerBreakpoint]: {
      fontSize: '3rem'
    }
  },

  firstCopy: {
    margin: '0 0 2rem'
  },

  mainSubheading: {
    fontSize: '1rem',
    fontWeight: 700,
    margin: '0 auto 1rem',
    maxWidth: '52rem',
    textShadow,

    [headerBreakpoint]: {
      fontSize: appTheme.typography.s6,
      fontWeight: 400,
      margin: '0 auto 1.5rem'
    }
  },

  primaryButtonBlock: {
    margin: '0 auto 1.5rem',
    maxWidth: '13rem',
    width: '100%'
  },

  section: {
    overflow: 'hidden',
    textAlign: 'center'
  },

  // Combine styles with section
  sectionHasBorder: {
    borderColor: appTheme.palette.mid30a,
    borderTopStyle: 'solid',
    borderTopWidth: '2px'
  },

  sectionHeading: {
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s6,
    fontWeight: 700,
    margin: '0 0 2rem',
    textTransform: 'uppercase',

    [layoutBreakpoint]: {
      margin: '0 0 4rem'
    }
  },

  firstHeading: {
    margin: '0 0 1rem !important'
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
    textAlign: 'center',

    [layoutBreakpoint]: {
      fontSize: appTheme.typography.s5,
      maxWidth: '48rem'
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
