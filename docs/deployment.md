# Deployment

Our developer experience is oriented around git. We want any
authorized developer to be able to push to the `development`,
`staging`, or `production` branches and have the code be deployed
to the respective infrastructure with a minimum of fuss.

To achieve this Parabol's environments are
deployed using [CircleCI](https://circleci.com) and
[dokku](https://github.com/dokku/dokku).

# Dokku Setup and Requirements

Install dokku onto a server of your choice. On your dokku host,
you'll need to install plugins for backend services required by
the Parabol application, or provide environment variables that
allow the Parabol application to connect to these services if you
have them hosted elsewhere.

## Service Requirements

   * [dokku-redis](https://github.com/dokku/dokku-redis)
   * [dokku-rethinkdb](https://github.com/dokku/dokku-rethinkdb)
   * *optional:* [dokku-letsencrypt](https://github.com/dokku/dokku-letsencrypt)

## Dokku app creation

Create your application using `dokku apps:create`, link services, and
optionally configure _letsencrypt_.

```sh
$ dokku apps:create parabol-action
$ dokku redis:link <redis-service> parabol-action
$ dokku rethinkdb:link <rethinkdb-service> parabol-action
$ dokku letsencrypt parabol-action
```

## Setup environment variables

For each environment variable defined in [.env.example](../.env.example),
define the variable with the appropriate value for the environment by
using `dokku config:set <app>`. For example:

```sh
$ dokku config:set parabol-action --no-restart FOO="bar"
```

## Add remote to your git environment:

```sh
$ git remote add dokku dokku@host:parabol-action
```

## Test deployment:

To deploy the application, all you need to do is push your
branch to the remote:

```sh
$ git push dokku master
```

# CircleCI setup and deployment

This bit of setup is going to be fussy. If you attempt setting up
CircleCI with with our [circle.yml](../circle.yml), please help us
by enhancing this section of the documentation.

## Outline

Our CircleCI configuration looks for certain branch names. Namely,
`development`, `staging`, or `production` and deploys to the
appropriate infrastructure. If the current branch does not match
one of these names (e.g. `master`), then only tests will be
performed.

At a high level, this is what our CircleCI configuration does:

1. An ssh key is added by its fingerprint id from the CircleCI web configuration
2. A Slack message is posted using a webhook
3. Automated tests are run
4. If this is a deployment, a special devops deployment repository is checked-out and the appropriate server environment variables are used
5. If this is a deployment, the dokku deployment is automated using
a custom github user
