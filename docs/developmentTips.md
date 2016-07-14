
# Development Tips

## Disabling Persisted State

To ignore the persisted state (i.e. don't auto-login), comment out this line:

https://github.com/ParabolInc/action/blob/210489c7a50d5f4476e0ce626f0a72d2ed213da6/src/client/makeStore.js#L51

It's the equivalent of being cookie-free.
