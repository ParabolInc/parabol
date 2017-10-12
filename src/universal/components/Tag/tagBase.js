import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

export const tagBase = {
  backgroundColor: 'transparent',
  borderRadius: '4em',
  boxShadow: ui.shadow[0],
  color: appTheme.palette.dark,
  display: 'inline-block',
  fontSize: ui.tagFontSize,
  fontWeight: ui.tagFontWeight,
  height: ui.tagHeight,
  lineHeight: ui.tagHeight,
  marginLeft: ui.tagGutter,
  padding: ui.tagPadding,
  textAlign: 'center',
  textTransform: 'uppercase',
  verticalAlign: 'middle'
};

export const tagBlock = {
  display: 'inline-block',
  height: ui.tagHeight,
  lineHeight: ui.tagHeight,
  verticalAlign: 'middle'
};
