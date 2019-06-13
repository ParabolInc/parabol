# Deployment

If you'd like to run Parabol for a local production instance, it can be done so
easily using Docker and Docker Compose.

## Overview

You need to:

   1. Build the Parabol Docker image
   2. Run the Docker image in a container, along with its service dependencies

Read on to see how.

## Prerequisites

You'll need a valid `.env` file that contains the environment variables Parabol
needs to use 3rd-party services and specify its configation.

## Building the Parabol Docker Image

Run:

```bash
$ docker-compose build web
```

## Running Parabol Within a Container

Start the image in its own container, along with its services dependencies:

```bash
$ docker-compose up
```

Then, connect to the application:

https://localhost:3000

