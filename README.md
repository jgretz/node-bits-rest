# node-bits-rest
node-bits-rest provides a rest api for all schema objects defined by other bits in the loadSchema step.

## Install
```
npm install node-bits-rest --save
```

or

```
yarn add node-bits-rest
```

## Configuration
The configuration for the node-bits-rest bit is pretty simple - just the root you want all of the rest endpoints to reside.

```
nodeBitsRest({prefix: 'api'}),
```

## Example
To complete the circle. Let's say in you include the [node-bits-code ](https://github.com/jgretz/node-bits-code) bit and define an order schema object like:

```
export const address = {
  street: String,
  city: String,
  state: String,
  country: String,
  postal: String,
};
```

node-bits-rest will expose a route at ```/api/address``` which will accept the following verbs. ```GET, POST, PUT, DELETE```. It will then connect to the database included in the node-bits runtime to expose the following functionality.

##### GET
* GET with no parameters will return an array of all documents.
* GET with an id will return that object if found.

##### POST
* POST expects the model to be in the body. Technically POST should only be used for inserts, but node-bits-rest will look for the existence of an id in the data submited and appropriately call insert or update.

##### PUT
* PUT expects a model in the body with an id. It will call update.

#### DELETE
* DELETE expects an id to specified. It will call delete.
