
// LandingStyles.js

// Note: This is just a temporary file, making it easier to port the Sass.
//       TODO: Make this a proper style object in the react-look way. (TA)
//       TODO: Need to figure out how to use tinycolor.mix() against theme palette (TA)

/////////////
// Variables
/////////////

const layoutBreakpoint = '@media (min-width: 64rem)';
const headerBreakpoint = '@media (min-width: 48rem)';
const cardBreakpoint = '@media (min-width: 75rem)';

//////////////
// Components
//////////////

// Global
// -------

'html, body': {
  // TODO: Use tinycolor.mix() for Sass mix(theme.palette.c, #000, 20%),
  fontFamily: theme.typography.actionUISansSerif,
  // TODO: fontSmoothing: will transform to vendor prefixes? (TA)
  '-moz-osx-font-smoothing': 'grayscale',
  '-webkit-font-smoothing': 'antialiased',
  fontSize: '16px',
  margin: 0,
  padding: 0
},

'a': {
  color: theme.palette.b,

  // TODO: Is there an elegant way to target both :hover and :focus
  //       without having to duplicate code? (TA)
  ':hover': {
    color: tinycolor(theme.palette.b).darken(15).toString(),
    textDecoration: 'underline'
  },
  ':focus': {
    color: tinycolor(theme.palette.b).darken(15).toString(),
    textDecoration: 'underline'
  }
},

// Layout
// -------

layout: {
  // Define

  [layoutBreakpoint]: {
    display: 'flex',
    flexDirection: 'column'
  }
},

header: {
  backgroundColor: theme.palette.b,
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
  // TODO: Is there an elegant way to target :link and/or :visited
  //       without having to duplicate code? (TA)
  backgroundColor: 'transparent',
  border: '1px solid currentColor',
  color: 'inherit',
  cursor: 'pointer',
  display: 'inline-block',
  fontSize: '1.25rem',
  fontWeight: 700,
  margin: '.5rem 0',
  padding: '.75em 1.25em',
  textAlign: 'center',
  textDecoration: 'none',
  textTransform: 'uppercase',

  [headerBreakpoint]: {
    fontSize: '1.5rem',
    margin: '1rem 0'
  },

  // TODO: Is there an elegant way to target both :hover and :focus
  //       without having to duplicate code? (TA)
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

  // TODO: Is there an elegant way to target both :hover and :focus
  //       without having to duplicate code? (TA)
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
  // TODO: @extend .tu-bc-a-30a,
  borderTopStyle: 'solid',
  borderTopWidth: '2px'
},

sectionHeading: {
  color: theme.palette.a,
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
    display: 'flex',
    justifyContent: 'center'
  }
},

// AL card
// --------

card: {
  // TODO @extend .tu-bc-b-30a,
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
  },

  [cardBreakpoint]: {
    padding: '4rem 2rem'
  }
},

// Combine styles with card
cardIsLast {
  marginBottom: 0
},

cardBadge: {
  backgroundColor: theme.palette.b,
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
    fontSize: '2rem', // Breaks away from type scale, by design
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
  color: theme.palette.c,
  fontSize: theme.typography.fsBase,
  fontWeight: 700,

  [cardBreakpoint]: {
    fontSize: theme.typography.fs5
  }
},

// AL copy
// --------

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

// AL footer
// ----------

footer: {
  backgroundColor: theme.palette.c,
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
  margin: '0 0 1rem'
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

  // TODO: Is there an elegant way to target both :hover and :focus
  //       without having to duplicate code? (TA)
  ':hover': {
    color: 'inherit',
    opacity: '.75'
  },
  ':focus': {
    color: 'inherit',
    opacity: '.75'
  }
}
