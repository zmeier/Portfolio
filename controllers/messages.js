// grab the user model
var Note = require('../models/note');

'use strict';
const views = require('co-views');
const parse = require('co-body');
var messages = [];

Note.find(function (err, notes) {
  if (err) return console.error(err);
  messages = notes;
});

const render = views(__dirname + '/../views', {
  map: { html: 'swig' }
});

module.exports.home = function *home(ctx) {
  this.body = yield render('list', { 'messages': messages });
};

module.exports.list = function *list() {
  this.body = yield messages;
};

module.exports.fetch = function *fetch(id) {
  const message = messages[id];
  if (!message) {
    this.throw(404, 'message with id = ' + id + ' was not found');
  }
  this.body = message;
};

module.exports.create = function *create() {
  const message = yield parse(this);
  messages.push(message) - 1;

  // create a new note
  var newNote = new Note({
    title: "",
    body: message.body,
    active: true
  });

  // save the note
  newNote.save(function(err, newNote) {
    if (err) {
      throw err;
    }
  });

  this.redirect('/');
};

const asyncOperation = () => callback =>
  setTimeout(
    () => callback(null, 'this was loaded asynchronously and it took 2 seconds to complete'),
    2000);

const returnsPromise = () =>
  new Promise((resolve, reject) =>
    setTimeout(() => resolve('promise resolved after 2 seconds'), 2000));

module.exports.delay = function *delay() {
  this.body = yield asyncOperation();
};

module.exports.promise = function *promise() {
  this.body = yield returnsPromise();
};
