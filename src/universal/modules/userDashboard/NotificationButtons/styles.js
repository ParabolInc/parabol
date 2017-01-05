import appTheme from 'universal/styles/theme/appTheme';

export default {
  row: {
    alignItems: 'center',
    borderBottom: `1px solid ${appTheme.palette.mid20l}`,
    display: 'flex',
    padding: '.5rem'
  },
  message: {
    flex: 1,
    margin: '.5rem'
  },
  messageVar: {
    color: appTheme.palette.cool,
    fontWeight: 700
  },
  button: {
    marginLeft: '.5rem'
  },
  buttonGroup: {
    display: 'flex'
  }
};
