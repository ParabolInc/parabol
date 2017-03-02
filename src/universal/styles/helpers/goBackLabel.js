import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const inlineBlockStyle = {
  display: 'inline-block',
  lineHeight: ui.dashSectionHeaderLineHeight,
  marginRight: '.5rem',
  verticalAlign: 'middle'
};

const link = {
  ...inlineBlockStyle,
  color: appTheme.palette.mid,
  fontSize: appTheme.typography.s3,
  fontWeight: 700,
  height: ui.dashSectionHeaderLineHeight,
  paddingTop: '1px',

  ':hover': {
    color: appTheme.palette.dark,
  },
  ':focus': {
    color: appTheme.palette.dark,
  },
  ':hover > div': {
    textDecoration: 'underline'
  },
  ':focus > div': {
    textDecoration: 'underline'
  },
};

export default link;
