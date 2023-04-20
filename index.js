const express = require('express');
const component = require('./component.js');
const react = require('react');
const reactDomServer = require('react-dom/server');

function convertJSObjectUsingReactToJson(someObject, result) {
    for (let key in someObject) {
      if (typeof someObject[key] === "object") {
        if (react.isValidElement(someObject[key])) {
          // this is a react element - so just save it, and don't recurse it
          result[key] = reactDomServer.renderToStaticMarkup(someObject[key]);
        } else {
          // this is some other object and not a react element, so recursively go down
          result[key] = {};
          convertJSObjectUsingReactToJson(someObject[key], result[key]);
        }
      } else {
        // this is not an object (so can't be a react element also) its likely a JS primitive
        result[key] = someObject[key];
      }
    }
   }

const data = {}; 
convertJSObjectUsingReactToJson(component, data);


const app = express();


// Define the route that accepts the requested path
app.get('/api/*', (req, res) => {
  // Split the requested path into an array of keys
  const keys = req.params[0].split('/');
  if(keys[0] === '' && keys.length === 1) {  // tricky. 
    res.json(data);
    return;
  }

  // Traverse the nested JSON object to get the requested value
  let value = data;
  for (const key of keys) {
    value = value[key];
    if (!value) break;
  }

  // Return the value as JSON
  res.json(value);
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});