---
id: 5e47f786-eddb-4570-bda9-60d6427282af
slug: proxy-an-external-api-in-a-custom-endpoint-extension
title: Proxy an External API in a Custom Endpoint Extension
authors:
  - name: Tim Butterfield
    title: Guest Author
description: Learn how to make external APIs available via Directus in a custom endpoint.
---
Endpoints are used in the API to perform certain functions.

Accessing a 3rd party API via a proxy in Directus has many advantages such as allowing multiple Directus users to access
a service via a single 3rd party auth token, simplifying front-end extensions by accessing 3rd party APIs using the
local API endpoint and credentials, and eliminating Cross-Origin issues.

As an example, this guide will proxy the PokéAPI, but the same approach can be used for any API.

::callout{icon="material-symbols:warning-outline-rounded"}

This guide will show you how to proxy an API that does not require authentication. In production, you should consider
requiring authentication in your proxy endpoints to avoid abuse, especially if the target API performs write operations
or costs money to use.

::

## Install Dependencies

Open a console to your preferred working directory and initialize a new extension, which will create the boilerplate
code for your operation.

```shell
npx create-directus-extension@latest
```

A list of options will appear (choose endpoint), and type a name for your extension (for example,
`directus-endpoint-pokeapi`). For this guide, select JavaScript.

Now the boilerplate has been created, open the directory in your code editor.

## Build the Endpoint

In the `src` directory open `index.js`. By default, the endpoint root will be the name of the extensions folder which
would be `/directus-endpoint-pokeapi/`. To change this, replace the code with the following:

```js
export default {
  id: 'pokeapi',
  handler: (router, {services}) => {
    // Router config goes here
  },
};
```

The `id` becomes the root and must be a unique identifier between all other endpoints.

The standard way to create an API route is to specify the method and the path. Rather than recreate every possible
endpoint that the PokéAPI has, use a wildcard (\*) to run this function for every route for each supported method.

```js
router.get('/*', async (req, res) => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/${req.url}`);

    if (response.ok) {
      res.json(await response.json());
    } else {
      res.status(response.status);
      res.send(response.statusText);
    }
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
});
```

The route includes the request (`req`) and response (`res`). The request has useful information that was provided by the
user or application such as the URL, method, authentication and other HTTP headers. In this case, the URL needs to be
combined with the base URL to perform an API query.

## Adding Authentication

You should also require authentication for your endpoint. Without this, any person on the internet could use it.

Use the `ItemsService` to query the `directus_users` system collection to see if the `req.accountability?.user` UUID is a valid one.

Define a schema for querying at the top of the file:

```js

const schema = {
  collections: {
    directus_users: {
      collection: 'directus_users',
      primary: 'id',
      singleton: false,
      accountability: 'all',
      fields: {
        id: {
          field: 'id',
          defaultValue: null,
          nullable: false,
          generated: false,
          type: 'uuid',
          dbType: 'uuid',
          special: [],
          alias: false
        }
      }
    }
  }
};
```

Then, change the API route to perform this validation:

```js
router.get('/*', async (req, res) => {
  try {
    const user = req.accountability?.user;
    const { ItemsService } = services;
    const users = new ItemsService("directus_users", {schema});
    const authenticatedUser = await users.readOne(user);
    if ( authenticatedUser == null) {
      res.status(403);
      return res.send(`You don't have permission to access this.`);
    }

    const response = await fetch(`https://pokeapi.co/api/v2/${req.url}`);

    if (response.ok) {
      res.json(await response.json());
    } else {
      res.status(response.status);
      res.send(response.statusText);
    }
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
});
```


This is now complete and ready for testing. Build the endpoint with the latest changes.

```
npm run build
```

## Add Endpoint to Directus

When Directus starts, it will look in the `extensions` directory for any subdirectory starting with
`directus-extension-`, and attempt to load them.

To install an extension, copy the entire directory with all source code, the `package.json` file, and the `dist`
directory into the Directus `extensions` directory. Make sure the directory with your extension has a name that starts
with `directus-extension`. In this case, you may choose to use `directus-extension-endpoint-pokeapi`.

Restart Directus to load the extension.

::callout{icon="material-symbols:info-outline"}

Only the `package.json` and `dist` directory are required inside of your extension directory. However, adding the source
code has no negative effect.

::

## Use the Endpoint

Using an application such as Postman, create a new request. The URL will be: `https://example.directus.app/pokeapi/` (be
sure that you change the URL for your project's URL)

Visit the PokéAPI docs and find an endpoint - for example [Request a Pokémon](https://pokeapi.co/docs/v2#pokemon).

Make sure to select CURL as the coding language and this will output the URL to use. Copy the URL without the host and
paste it to the end of your Directus endpoint. It will look something like:

`https://example.directus.app/pokeapi/pokemon/25`

You should receive the direct response from PokéAPI.

## Summary

With this endpoint, you now have access to the PokéAPI within Directus. Now that you know how to create a proxy to an
API, you can create proxies for other 3rd party services and simplify your other extensions.

## Complete Code

`index.js`

```js

const schema = {
  collections: {
    directus_users: {
      collection: 'directus_users',
      primary: 'id',
      singleton: false,
      accountability: 'all',
      fields: {
        id: {
          field: 'id',
          defaultValue: null,
          nullable: false,
          generated: false,
          type: 'uuid',
          dbType: 'uuid',
          special: [],
          alias: false
        }
      }
    }
  }
};
export default {
  id: 'pokeapi',
  handler: (router, {services}) => {
    router.get('/*', async (req, res) => {
      try {
        const user = req.accountability?.user;
        const { ItemsService } = services;
        const users = new ItemsService("directus_users", {schema});
        const authenticatedUser = await users.readOne(user);
        if ( authenticatedUser == null) {
          res.status(403);
          return res.send(`You don't have permission to access this.`);
        }

        const response = await fetch(`https://pokeapi.co/api/v2/${req.url}`);

        if (response.ok) {
          res.json(await response.json());
        } else {
          res.status(response.status);
          res.send(response.statusText);
        }
      } catch (error) {
        res.status(500);
        res.send(error.message);
      }
    });
  },
};
```
