# Pistachio Template Usage

> ***In order to use a pistachio template you have to compile it first. When this documentation speaks of a template, it refers to the compiled state of the template.***

## Plain JavaScript

The compiled templates are plain JavaScript function expressions. You can load and use them in multiple ways. Either you copy & paste them into your code directly, or you ask the compiler to create an AMD or CommonJS module for you. Alternatively you can load them from a file and eval the contents.

**Copy & Paste Example:**

    var template=(function... // Copy & Paste

**AMD Example:**

    requirejs('mytemplate',function(template {
      var html = template(data);
    }));

**CommonJS Example:**

    var template = require('mytemplate');
    var html = template(data);

**Eval Example**

    <script type="text/pistachio" id="mytemplate">(function...</script>

    <script type="text/javascript">
      var template = eval(document.getElementById('#mytemplate').text);
      var html = template(data);
    </script>

## jQuery

In addition to the generic methods above there is a jQuery Plugin. You can ask the compiler to produce the file for you by calling:

    pistachio --jquery --out /path/to/the/place/where/you/want/the/file/pistachio.js

Of course you can also render the jQuery plugin as an AMD or CommonJS module. Alternatively you can simply use the *jquery.js* in this directory.

Once the plugin is included you can use it via:

    $pistachio(template-url, data).done(function(html) {
      …
    });
    $pistachio(template-text, data).done(function(html) {
      …
    });
    $pistachio(template-function, data)..done(function(html) {
      …
    });

if you simply want a template object that you want to reuse, then don't pass in *data*

    var template = $pistachio(template-url).done(function(html) {
      ...
    }).ready(function() {
      // Now your template is ready
      template.render(data); // Will call your done handler (or fail handler) for every time you call render
    });

of course this also works with a template text or or a template function and not just a URL.

## Node.JS

To use the templates in Node.JS you can always use the generic ways. However you can also do:

    var pistachio = require('pistachio');

    pistachio(filename, data, function(err, result) {
      …
    });

alternatively you can do:

    var pistachio = require('pistachio');
    pistachio.loadFile(filename, function(err, template) {
      // Cache Template Here (for example)
      pistachio.render(template, data, function(err, result) {
        …
      });
    });

or one more option:

    var pistachio = require('pistachio');
    fs.readFile(filename, function(err, text) {
      pistachio.loadText(text, function(err, template) {
        // Cache Template Here (for example)
        pistachio.render(template, data, function(err, result) {
          …
        });
      });
    }, 'utf-8');

So basically whatever your style it is supported.

## Express

If you want to be less raw than the generic NodeJS stuff and you want to use pistachio with the [Express Framework](http://expressjs.com), pistachio provides a renderer middleware.

    var express = require('express');
    var app = express();

    app.engine('pistachio', require('../../index.js').express);
    app.set('view engine', 'pistachio');
    app.set('views', __dirname);
    app.set('cachePistachios', true);

    app.get('/', function(req, res, next) {
      res.render('sample', { 'title':'Pistachio Express', 'product':'Pistachio', 'engine':'Express with dynamic data' }, function(err, html) {
        if (err) return next(err);
        res.send(html);
      });
    });

    app.listen(8000);

