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

## GET
* GET with no parameters will return an array of all documents.
* GET with an id will return that object if found.

### Query, Limit, Order, ...
node-bits-rest exposes the ability to control the results via parameters passed as the query string. It exposes a simple querying syntax for simple needs, but also implements much of OData to handle the complicated scenarios. It will automatically detect which strategy you are using based on the syntax of the parameters and appropriately apply the correct strategy.

* note on using select - right now only the fields of the root model are supported. If you want to include a 1:M object use the id, if you want to include a M:1 object use the collection name.

#### Simple
The simple query syntax supports select, expand, orderby, start, max, and filters. Here is a brief description each:

* select: a comma delimited list of field names to include in the results
* expand: a comma delimited of related entities to include in the results
* orderby: a comma delimited list of field name to sort by. To specify the direction use the following format: ```name:dir```, for example: ```price:desc```
* start: the index of the result set to start from
* max: the number of records to return in the results
* filter: any entry in the querystring that is not one of the other key words is treated as part of the where clause. the simple syntax only supports equality. the syntax is ```name=value```, for example: ```price=5.00```

#### OData
node-bits-rest supports select, expand, orderby, top, skip, and filter from the OData standard. You can read more about this standard on the [OData Documentation page](http://www.odata.org/documentation/).

For filter, node-bits-rest supports the following operators: eq, ne, gt, ge, lt, le, and, or. In addition, it supports the contains, startswith, and endswith functions for filtering.

node-bits-rest will return all queries that use OData in the format ```{value: [<rows>], @odata.count: <total row count for where clause>}```

## POST
* POST expects the model to be in the body. Technically POST should only be used for inserts, but node-bits-rest will look for the existence of an id in the data submitted and appropriately call insert or update.

## PUT
* PUT expects a model in the body with an id. It will call update.

## DELETE
* DELETE expects an id to specified. It will call delete.
