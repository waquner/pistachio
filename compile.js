#!/usr/bin/env node

/*
** © 2012 by YOUSURE Tarifvergleich GmbH. Licensed under MIT License
*/

var debug = true;

var argv=require( 'argv' );
var fs=require('fs');
var path=require('path');
var pistachio=require('./index.js');

var args = argv.info('Pistachio Template Compiler').version('0.1.0').option([
  { name:'out', short:'o', type:'path', description:'The template is written to this file instead of STDOUT' },
  { name:'amd', type:'boolean', description:'wrap the result in an amd module define() (Not available with --common)' },
  { name:'common', type:'boolean', description:'make the result a valid CommonJS module (Not available with --amd)' },
  { name:'prepend', type:'string', description:'prepend the result with the string (Not available with --amd or --common)' },
  { name:'append', type:'string', description:'append the string to the end of the result (Not available with --amd or --common)' },
  { name:'jquery', type:'boolean', description:'output the jQuery client script instead of compiling a template.'},
  { name:'render', type:'path', description:'output the rendered template with data in this file'},
  { name:'root', type:'path', description:'the base path that is used for absoulte partials (default: /)' }
]).run();

if (args.options.jquery && args.targets.length) {
  argv.help();
  process.exit(1);
} else if (!args.options.jquery && (args.targets.length !== 1)) {
  argv.help();
  process.exit(1);
}

if (args.options.amd && (args.options.common || args.options.prepend || args.options.append)) {
  argv.help();
  process.exit(1);
}
if (args.options.common && (args.options.amd || args.options.prepend || args.options.append)) {
  argv.help();
  process.exit(1);
}
if (args.options.amd) {
  args.options.prepend='define(function() { return ';
  args.options.append='});';
}
if (args.options.common) {
  args.options.prepend='module.exports = ';
  args.options.append=';';
}
args.options.prepend=args.options.prepend||'';
args.options.append=args.options.append||'';
delete args.options.amd;
delete args.options.commmon;
args.options.partials = parseFile;

var result;
if (args.options.jquery) {
  if (args.options.common) args.options.prepend+='$["pistachio"];\n\n';
  result = args.options.prepend + fs.readFileSync(path.join(__dirname, 'clients', 'jquery.js'), 'utf-8') + args.options.append;
} else if (args.options.render) {
  var data,input,filename=args.targets.shift();
  try {
    data = JSON.parse(fs.readFileSync(args.options.render,'utf-8'));
  } catch(ex) {
    console.error('Bad Data JSON');
    process.exit(2);
  }
  try {
    input = fs.readFileSync(filename, 'utf-8');
  } catch(ex) {
    console.error('Bad Template File');
    process.exit(2);
  }
  try {
    if (input.substr(0,'(function'.length) === '(function') {
      input = eval(input);
    } else {
      args.options.file=filename;
      input = pistachio.compile(pistachio.parse(input, args.options));
      input = eval(input);
    }
  } catch(ex) {
    console.error(ex.message);
    if (debug) console.error(ex.stack);
    process.exit(2);
  }
  result = input(data);
} else {
  try {
    result = args.options.prepend+pistachio.compile(parseFile(args.targets.shift(), args.options))+args.options.append;
  } catch(ex) {
    console.error('Error Compiling: '+args.file);
    console.error(ex.message);
    if (debug) console.error(ex.stack);
    process.exit(3);
  }
}

if (args.options.out) {
  fs.writeFileSync(args.options.out, result, 'utf-8');
} else {
  process.stdout.write(result, 'utf-8');
}

function parseFile(file, opts) {
  var tpl, base = opts.file;
  if (file[0]==='/') file = path.resolve(opts.root || '/', file.substr(1));
  file = base ? path.resolve(path.dirname(base), file) : path.resolve(file);
  try {
    tpl = fs.readFileSync(file, 'utf-8');
  } catch(ex) {
    throw new Error('Could not open file: '+file);
  }
  opts.file = file;
  tpl = pistachio.parse(tpl, opts);
  opts.file = base;
  return tpl;
}
