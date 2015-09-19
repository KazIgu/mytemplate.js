#!/usr/bin/env node

var program = require('commander');
var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');
var glob = require("glob");
var rimraf = require("rimraf");

var home = process.env["HOME"]
var local = home + "/.mytemplate/"

program
  .version('0.0.1');

// new
program
  .command('new <name> [project]')
  .description('Create project from template')
  .action(function(name, pathName){
    create(name, pathName);
  });

// add
program
  .command('add <name>')
  .description('add your template')
  .action(function(name){
    add(name);
  });

// remove
program
  .command('rm <name>')
  .description('Remove your template')
  .action(function(name){
    remove(name);
  });


// list
program
  .command('list')
  .description('List your templates')
  .action(function(){
    list();
  });

program.parse(process.argv);


// new
function create(name, pathName) {
  var pathName = pathName || name;
  pathName = path.join(fs.realpathSync('./'), pathName)
  mkdir(pathName);

  glob(local + name + "/**/*", {dot:true},function(err, files){
    if (err) throw err;
    fileList = files;

    for(var i = 0; i < fileList.length; i++){
      var file = fileList[i];
      var dirName = path.dirname(file);
      var dirName = dirName.replace(local + name, "")
      mkdir(pathName + dirName);
    }

    glob(local + name + "/**/*", {dot:true, nodir: true},function(err, files){
      if (err) throw err;
      fileList = files;

      for(var i = 0; i < fileList.length; i++){
        var file = fileList[i];
        var target = file.replace(local + name, "")
        write(pathName + target, loadLocalTemplate(file));
      }
    });

  console.log('   \x1b[36mCreate\x1b[0m : ' + name);

  });
}


// add
function add(name) {
  var fileList = [];
  var template = local + name + "/"
  mkdir(local);
  mkdir(template);

  glob('**/*', {dot:true}, function(err, files){
    if (err) throw err;
    fileList = files;

    for(var i = 0; i < fileList.length; i++){
      var file = fileList[i];
      var dirName = path.dirname(file);
      mkdir(template + dirName);
    }

    glob('**/*', {dot:true, nodir: true},function(err, files){
      if (err) throw err;
      fileList = files;

      for(var i = 0; i < fileList.length; i++){
        var file = fileList[i];
        var body = loadTemplate(file);
        write(template + file, body);
      }
    });

  console.log('   \x1b[36mSave As\x1b[0m : ' + name);

  });
}



// list
function list() {
  glob(local + "*", function(err, files){
    if (err) throw err;
    var fileList = files;

    for(var i = 0; i < fileList.length; i++){
      var file = fileList[i];
      console.log( path.basename(file) );
    }
  });
}

// remove
function remove(name) {
  console.log(local + name);
  rimraf(local + name, function(err){
    if (err) throw err;
  });
}

/**
 * mkdir
 *
 * @param {String} path
 * @param {Function} cb
 */
function mkdir(path, cb) {
  mkdirp(path, 0755, function(err){
    if (err) throw err;
    cb && cb();
  });
}

/**
 * write
 *
 * @param {String} path
 * @param {String} str
 */

function write(path, str, mode) {
  fs.writeFileSync(path, str, { mode: mode || 0666 });
}

/**
 * loadTemplate
 *
 * @param {String} name
 */
function loadTemplate(name) {
  return fs.readFileSync(path.join(fs.realpathSync('./'), name), 'utf-8');
}

function loadLocalTemplate(name) {
  return fs.readFileSync(name, 'utf-8');
}