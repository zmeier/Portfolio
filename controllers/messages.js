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
  this.body = yield render('list', { 'messages': messages, 'showActive': true });
};

module.exports.list = function *list() {
  this.body = yield render('list', { 'messages': messages, 'showActive': true, 'showDeleted': true });
};

module.exports.trash = function *trash() {
  this.body = yield render('list', { 'messages': messages, 'showActive': false, 'showDeleted': true });
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
    messages.push(newNote) - 1;
  });
  this.redirect('/');
};

module.exports.del = function *del(id) {
  var i,notes;

  Note.findById(id, function (err, note) {
    if (err) {
      throw err;
    }
    note.active = false;
    note.save();
  });

  for(i = 0; i < messages.length; i++) {
    var note = messages[i];

    if(note.id === id) {
      note.active = false;
      note.updated_at = new Date();
    } 
  }  
  
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
