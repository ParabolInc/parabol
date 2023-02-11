# Easily deploy Parabol on Dokku

Upstream parabol have some issue that makes end user can’t deploy to their self hosted dokku instance or simply running `docker-compose up -d` on their local

Some of the problems are the outdated Dockerfile and miss configured env. Most of the script are in root project that

- Either need dependencies or devDependencies that most of the time being available only at sub packages package.json instead of root package.json
- Require available and fully migrated database (including yarn build process)
  So if either there is no connection to database or we prune the devDependencies the process will fail. Even on runtime, some of the packages need dependencies (like dotenv) that only available on other packages

> Feature:
>
> - Enterprise org by default

---

There are two way to deploy the app:

## The docker-compose way

The easiest way, you just need to clone this repo and then you should be able to `cp .env.example .env` and run `docker-compose up -d` that should be the bare minimum to run it

Then you can config the other .env value later. Please refer to upstream repo for available .env config https://github.com/ParabolInc/parabol

> You might wanna run
> `docker-compose -f docker-compose.yml -f ./docker/docker-compose.selfHosted.yml up -d`
> instead to make the storage persistance

## Dokku Deployment

The most preferred way if you want to deploy it on server

> Pre-req to using this guideline:
>
> - You need to have Dokku (https://github.com/dokku/dokku) installed on your server and you need to understand Dokku
> - Better if a domain already pointed to your server and you already config it as global domain in dokku
> - Your local computer SSH public key already registered on your dokku server (so you can deploy 🚀)

### 1. Create Parabol app

```
sudo dokku apps:create parabol
sudo dokku proxy:ports-set parabol http:80:80
sudo dokku storage:ensure-directory parabol-data
sudo dokku storage:mount parabol /var/lib/dokku/data/storage/parabol-data:/parabol/self-hosted
```

That will create the app and mount the self hosted directory

### 2. You need to install 3 plugins: `redis`, `postgres`, `rethinkdb` 

```
sudo dokku plugin:install https://github.com/dokku/dokku-postgres.git postgres
sudo dokku plugin:install https://github.com/dokku/dokku-rethinkdb.git rethinkdb
sudo dokku plugin:install https://github.com/dokku/dokku-redis.git redis
```

### 3. Then create DB

```
sudo dokku postgres:create pb-pg --image-version 12.10
sudo dokku rethinkdb:create pb-db
sudo dokku redis:create pb-redis
```

This time you might need to save `postgres` and `rethinkDb` DSN that printed after creation, something like `postgres://username:thepassword@the-db-host:5432/pb_pg` we will need it later

### 4. Link created DB

```
sudo dokku postgres:link pb-pg parabol -a "POSTGRES_URL"
sudo dokku rethinkdb:link pb-db parabol -a “RETHINKDB_URL"
sudo dokku redis:link pb-redis parabol
```

### 5. Submit ENV

For postgres we need to manually set this value first, because by default it’s not using DSN
Based value that you’re copied on step 3, for example: `postgres://username:thepassword@the-db-host:5432/pb_pg` then you can run

```
sudo dokku config:set parabol POSTGRES_DB=pb_pg —no-restart
sudo dokku config:set parabol POSTGRES_HOST=the-db-host —no-restart
sudo dokku config:set parabol POSTGRES_PASSWORD=thepassword —no-restart
sudo dokku config:set parabol POSTGRES_USER=username —no-restart
```

For RethinkDb we need to change DB name to `actionDevelopment`

For example if your DSN is `rethinkdb://dokku-rethinkdb-pb-db:28015/pb-db` then change it with:

```
dokku config:set parabol RETHINKDB_URL="rethinkdb://dokku-rethinkdb-pb-db:28015/actionDevelopment"
```

By default heroku buildpack will pruning devDependencies and as I mention earlier, that could be a problem. NPM/Yarn might use cache as well which make the process longer and we don't need anyway. then you can disable it by:

```
sudo dokku config:set parabol NPM_CONFIG_PRODUCTION=false --no-restart
sudo dokku config:set parabol YARN_PRODUCTION=false --no-restart
sudo dokku config:set parabol YARN2_SKIP_PRUNING=true --no-restart
sudo dokku config:set parabol USE_YARN_CACHE=false --no-restart
sudo dokku config:set parabol NODE_MODULES_CACHE=true --no-restart
```

Then excluding:

- `POSTGRES_DB`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_USER`
- `RETHINKDB_URL` and
- `REDIS_URL`

You can copy the rest of environments on `.env.example`

Then using nano editor to paste it to dokku ENV file (instead of set up one by one like above)

```
sudo nano /home/dokku/parabol/ENV
```

Paste the environment variable there and `Ctrl + X` >>>> `Y` >>>> `Enter` to save

This should give you bare minimum to run the app, you can config it again later (Refer to https://github.com/ParabolInc/parabol
for more config)

### 6. Installing letsencrypt to activate SSL

```
sudo dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git
sudo dokku letsencrypt:set --global <your@email.address>
sudo dokku letsencrypt:enable parabol
sudo dokku letsencrypt:cron-job --add
```

### 7. Decide using Heroku buildpack / Dockerfile

You can actually skip this step if you want to use Heroku buildpack

> But I'm not tested it again since it's just too slow

If you choose to use Heroku buildpacks, then go straight to step 8, otherwise 👇🏻

So the other option is try to use dockerfile instead heroku buildpack (dockerfile is faster as well)

```
sudo dokku builder-dockerfile:set parabol dockerfile-path docker/Dockerfile.prod
```

But the trade off are the migration process and build will happens AFTER the container is up, because as i mention earlier even the build process need to be connected to fully migrated database, and the Dockerfile build process is not connected yet to database and not exposed to ENV
 Probably need to skip check as well

> 🔥 BEWARE 🔥 This will disable zero downtime deployment, you might need to wait up to 10 mins after deployment until the migration finish successfully and the app will unaccessible during that time

```
sudo dokku checks:skip parabol
```

### 8. Deploy the app

Assuming your SSH key already setted up on pre-req

First you need to clone this repo on your local computer

```
git remote add dokku@<your-server-domain-or-ip>:parabol
```

then

```
git push dokku master
```

After push success, go to your server console, then monitor it using

```
sudo dokku logs parabol -t
```

Until you saw something like

```
2023-02-10T02:45:26.698581809Z app[web.1]: 🔥🔥🔥 Server ID: 1. Ready for Sockets: Port 80 🔥🔥🔥
2023-02-10T02:45:30.390679700Z app[web.1]: 💧💧💧 Server ID: 11. Ready for GraphQL Execution 💧💧💧
2023-02-10T02:45:31.257729102Z app[web.1]: 💧💧💧 Server ID: 1. Ready for GraphQL Execution 💧💧💧
```

then try to open it on your browser, for example if your domain is `foo.com` then by default it should be

```
https://parabol.foo.com
```

This isn’t ideal, but the easiest way. You could actually use CI/CD to spin up temporary database, migrate it, and building all the assets before actually pushing it to dokku, feel free to refer to circle ci `config.yaml` if you want to do that.

# FAQ

If you get no output during `pgtyped -c ./packages/server/postgres/pgtypedConfig.js` try to check your postgres log

```
sudo dokku postgres:logs pb-pg -t
```

If you find something like on the last line

```
2023-02-09 14:40:12.969 UTC [7225] FATAL:  canceling authentication due to timeout
```

Then probably you run wrong postgres version. make sure to install v12.10

# Another known config

## Update invitation link

For example if your parabol domain is `parabol.foo.com` then on your server run:

```
sudo dokku config:set parabol INVITATION_SHORTLINK=parabol.foo.com/invitation-link
```

## If something goes wrong, you might need to set this as well

```
sudo dokku config:set parabol PROTO=http --no-restart
sudo dokku config:set parabol HOST=<you.domain> --no-restart
sudo dokku config:set parabol PORT=80 --no-restart
sudo dokku ps:restart parabol
```

## Enable Google Sign In

```
sudo dokku config:set parabol GOOGLE_OAUTH_CLIENT_ID='client_id' --no-restart
sudo dokku config:set parabol GOOGLE_OAUTH_CLIENT_SECRET='secret' --no-restart
sudo dokku config:set parabol PROTO=https --no-restart
sudo dokku config:set parabol HOST=<your.domain>
sudo dokku config:set parabol PORT=443 --no-restart
sudo dokku ps:restart parabol
```

The value of `client id` and `secret` can be gather on google cloud console https://developers.google.com/identity/protocols/oauth2. You don't need to pay anything to enable it

You need to set Authorized redirect URI's to `https://<your.domain>/auth/google` on google cloud console

> Make sure to correctly set vaalue for `PROTO` `HOST` and `PORT`, since it'll be used on `packages/server/appOrigin.ts` to construct app origin and later will be use to construct google callback URL. If you find `Invalid Code` during google login you might wanna check these setting or the callback url you set on google cloud console

## Enable JIRA integration

You need to create account on developer.atlassian.com https://developer.atlassian.com/cloud/confluence/oauth-2-3lo-apps/
set auth callback url to `https://<your.domain>/auth/callback`
and set `OAUTH2_REDIRECT` env

```
sudo dokku config:set parabol OAUTH2_REDIRECT=https://<your.domain>/auth/callback
```

from attlasian developer console you can receive `client_id` and `secret`. Then on your server run:

```
sudo dokku config:set parabol ATLASSIAN_CLIENT_ID="your_client_id" --no-restart
sudo dokku config:set parabol ATLASSIAN_CLIENT_SECRET="your_secret" --no-restart
sudo dokku ps:restart parabol
```

## Other things?

Other things please refer to the upstream repo https://github.com/ParabolInc/parabol, The change in here probably will breaking to upstream so it's not possible to merge it there, will try keep maintain to be up to date with upstream.
