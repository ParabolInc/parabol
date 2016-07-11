
# Development Tips

## Disabling Persisted State

To ignore the persisted state (i.e. don't auto-login), comment out this line:

https://github.com/ParabolInc/action/blob/master/src/client/makeStore.js#L51

It's the equivalent of being cookie-free.
