import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

export default {
  message: {
    color: appTheme.palette.dark,
    flex: 1,
    fontSize: appTheme.typography.s3,
    lineHeight: '1.375rem',
    marginLeft: ui.rowCompactGutter
  },
  messageVar: {
    color: appTheme.palette.cool,
    fontWeight: 700
  },
  messageSub: {
    color: appTheme.palette.dark10d,
    fontSize: appTheme.typography.s2,
    marginTop: '.25rem'
  },
  notifLink: {
    cursor: 'pointer',
    ':hover': {
      color: appTheme.palette.cool50d
    }
  },
  button: {
    marginLeft: ui.rowCompactGutter,
    minWidth: '5.125rem'
  },
  iconButton: {
    marginLeft: ui.rowCompactGutter,
    minWidth: '2rem'
  },
  widerButton: {
    marginLeft: ui.rowCompactGutter,
    minWidth: '8.25rem'
  },
  widestButton: {
    marginLeft: ui.rowCompactGutter,
    minWidth: '11rem'
  },
  buttonGroup: {
    display: 'flex'
  }
};
