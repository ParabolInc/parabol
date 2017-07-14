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
  color: appTheme.palette.dark,
  fontSize: appTheme.typography.s3,
  fontWeight: 700,
  height: ui.dashSectionHeaderLineHeight,
  paddingTop: '1px',

  ':hover': {
    color: appTheme.palette.dark,
    opacity: '.5'
  },
  ':focus': {
    color: appTheme.palette.dark,
    opacity: '.5'
  }
};

export default link;
