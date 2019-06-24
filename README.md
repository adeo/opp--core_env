# @core/env
This module transform environment variables into JSON hierarchical
structures. Usage is very simple, just require it in top of you application.
You can create .env file in root of you application for development and debug.
Don't do it in production.

#### Example

Environment:
```
array_deep=(json)[]
array_deep_0=(boolean)0
array_deep_1=(boolean)1
```
Code:
```javascript
const env = require('@core/env');
console.log(env);
```
Result:
```json
{
    "array": {
        "deep": [
            false,
            true
        ]
    }
}
```

#### Supported types
Environment:
```
string=(string)text
number=(number)1
boolean=(boolean)false
json=(json){"json":true}
regexp=(regexp)/\d.test?/
symbol=(symbol)mySymbol
null=(null)
NaN=(NaN)
undefined=(undefined)
Infinity=(Infinity)1
-Infinity=(Infinity)-1
file_buff=(file)/path/to/file
file_utf8=(file-utf8)/path/to/file
```
Result:
```json
{
  string:      'text',
  number:      1,
  boolean:     false,
  json:        { json: true },
  regexp:      /\d.test?/,
  symbol:      Symbol(mySymbol),
  null:        null,
  NaN:         NaN,
  undefined:   undefined,
  Infinity:    Infinity,
  '-Infinity': -Infinity,
  file: { 
     buff: <Buffer 73 74 72 69 6e 67 3d ... >,
     utf8: 'string=(string)...',
  }
}
```