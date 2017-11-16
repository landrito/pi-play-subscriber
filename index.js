'use strict';

const jsonFile = require('jsonfile');
const pubsub = require('@google-cloud/pubsub')();
const Player = require('player');
const player = new Player();
const PlayMusic = require('playmusic');
const pm = new PlayMusic();
const {promisify} = require('util');


const pmInit = promisify(pm.init.bind(pm));
const pmSearch = promisify(pm.search.bind(pm));
const pmGetStreamUrl = promisify(pm.getStreamUrl.bind(pm));

async function main() {
  const creds = jsonFile.readFileSync('/tmp/google-propose-token.json');
  await pmInit(creds);
  const topic = pubsub.topic('pi-songs');
  const subscriptionName = 'landrito-pi';
  let subscription = topic.subscription(subscriptionName);
  const [exists] = await subscription.exists();
  if (!exists) {
    subscription = await topic.createSubscription(subscriptionName);
  }
  let latest = null;
  subscription.on('message', (message) => {
    message.ack();
    const searchTerm = message.data.toString();
    console.log(searchTerm);
    latest = message;
    searchAndPlay(searchTerm);
  });
}
main();

async function searchAndPlay(searchTerm) {
  const searchResults = await pmSearch(searchTerm, 5);

  const song = searchResults.entries
    .filter((e) => (true && e.track && e.track.storeId))
    .sort(function(a, b) {
      return a.score < b.score;
    }).shift();

  let streamUrl = null;
  try {
    streamUrl = await pmGetStreamUrl(song.track.storeId);
    console.log(streamUrl);
  } catch (err) {
    console.log("Could not find a song to stream for: " + searchTerm);
  }
  if (streamUrl) {
    player.add(streamUrl);
    if (player.playing) {
      player.pause();
    }
    player.play(player.list.length - 1);
  }
}

