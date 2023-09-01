## Certs

This directory is the preferred place for TLS certs.
The certs that are checked into version control are self-signed and safe to share.

### Env Vars

All env vars should correspond with the vars in the redis instance.
In development, that means vars in .env should match the vars in dev.yml.
Any changes to dev.yml require running `yarn db:start`

REDIS_PASSWORD: Use this if you'd like our app to connect to redis using a password
REDIS_TLS_CERT_FILE: The cert file used to authorize clients. Not available in GCP
REDIS_TLS_KEY_FILE: The key file used to authorize clients. Not available in GCP
REDIS_TLS_CA_FILE: The CA file that proves our redis instance is who it says it is
REDIS_TLS_REJECT_UNAUTHORIZED: Set to false if you're using a self-signed CA file
