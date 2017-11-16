'use strict';

let prompt = require('prompt');
let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var jsonfile = require('jsonfile');
var PlayMusic = require('playmusic');
var pm = new PlayMusic();

let schema = {
  properties: {
    email: {
      pattern: emailRegex,
      message: 'Email must be of the correct form.',
      required: true
    },
    password: {
      hidden: true
    }
  }
};

// Start the prompt
prompt.start();

// Get two properties from the user: email, password
prompt.get(schema, function (err, result) {
  // Log the results.
  console.log('Command-line input received:');

  pm.login({email: result.email, password: result.password}, (err, creds) => {
    if(err) console.error(err);
    jsonfile.writeFile('/tmp/google-propose-token.json', creds, (err) => {
      if (err) console.error(err);
      console.log('Credential tokens saved.')
    });
  });
});
