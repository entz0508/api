var express = require('express');
var session = require('express-session');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var errorHandler = require('express-error-handler');
var methodOverride = require('method-override');
var http = require('http');
var path = require('path');

var app = express();
var md = require('node-markdown').Markdown;
var fs = require('fs');

// all environments
var listenPort = 8078;

app.set('port', listenPort);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(methodOverride());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.json());


//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
/*
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
*/

app.get('/favicon.ico', function(req, res) {
	res.writeHead(200, {'Content-Type': 'image/x-icon'} );
	res.end();
	return;
});

app.get('/dora_api?', function(req, res) {
	if(req.query.pass=='ehfkfpqakstp!1')
	{
		var html = md(fs.readFileSync('apiDLA.txt','utf8'),
			false,	// allow only HTML default sets
			"a|img",
			{
				"*":"title|style"		// 'title' and 'style' for all
			}
		);
		var errorhtml = md(fs.readFileSync('apiErrorCode.txt','utf8'),
			false,	// allow only HTML default sets
			"a|img",
			{
				"*":"title|style"		// 'title' and 'style' for all
			}
		);
		html = html.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
		errorhtml = errorhtml.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
		//html = html.replace(/<code>/gi,'<code class="">');
		res.send(
			"<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>\n" +
			"<html xmlns='http://www.w3.org/1999/xhtml'>\n" +
			"<head>\n" +
			"	<meta http-equiv='Content-Type' content='text/html; charset=utf-8'/>\n" +
			"	<link type='text/css' rel='stylesheet' href='stylesheets/markdown.css'/>\n" +
			"	<link type='text/css' rel='stylesheet' href='stylesheets/prettify.css'/>\n" +
			"	<link rel='shortcut icon' href='/favicon.ico' type='image/x-icon'/>\n" +
			"	<title>dora API 일람</title>\n" +
			"	<script type='text/javascript' src='javascripts/json2.js'></script>\n" +
			"	<script type='text/javascript' src='javascripts/jquery.js'></script>\n" +
			"	<script type='text/javascript' src='javascripts/prettify.js'></script>\n" +
			"	<script type='text/javascript'>\n" +
			"	</script>\n" +
			"</head>\n" +
			"<body onload='prettyPrint()'>\n" +
			html + errorhtml +
			+ "</body>\n"
			+ "</html>\n"
		)
		//res.render(
		//	'Api',
		//	{
		//		layout : false,
		//		pretty : true,
		//	}
		//);
	} else {
		res.send('잘못된 접근입니다.');
	}
});

app.get('/slp_platform_api?', function(req, res) {
	if(req.query.pass=='ehfkfpqakstp!1')
	{
		var html = md(fs.readFileSync('SLP_Platform_api.txt','utf8'),
			false,	// allow only HTML default sets
			"a|img",
			{
				"*":"title|style"		// 'title' and 'style' for all
			}
		);

		html = html.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
		var errorhtml = md(fs.readFileSync('SLP_Platform_api_ErrorCode.txt','utf8'),
			false,	// allow only HTML default sets
			"a|img",
			{
				"*":"title|style"		// 'title' and 'style' for all
			}
		);
		html = html.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
		errorhtml = errorhtml.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
		//html = html.replace(/<code>/gi,'<code class="">');

		res.send(
			"<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>\n" +
			"<html xmlns='http://www.w3.org/1999/xhtml'>\n" +
			"<head>\n" +
			"	<meta http-equiv='Content-Type' content='text/html; charset=utf-8'/>\n" +
			"	<link type='text/css' rel='stylesheet' href='stylesheets/markdown.css'/>\n" +
			"	<link type='text/css' rel='stylesheet' href='stylesheets/prettify.css'/>\n" +
			"	<link rel='shortcut icon' href='/favicon.ico' type='image/x-icon'/>\n" +
			"	<title>SLP Platform API 일람</title>\n" +
			"	<script type='text/javascript' src='javascripts/json2.js'></script>\n" +
			"	<script type='text/javascript' src='javascripts/jquery.js'></script>\n" +
			"	<script type='text/javascript' src='javascripts/prettify.js'></script>\n" +
			"	<script type='text/javascript'>\n" +
			"	</script>\n" +
			"</head>\n" +
			"<body onload='prettyPrint()'>\n" +
			html + errorhtml +
			+ "</body>\n"
			+ "</html>\n"
		);
		//res.render(
		//	'Api',
		//	{
		//		layout : false,
		//		pretty : true,
		//	}
		//);
	} else {
		res.send('잘못된 접근입니다.');
	}
});

app.get('/slp_dla_api?', function(req, res) {
	if(req.query.pass=='ehfkfpqakstp!1')
	{
		var html = md(fs.readFileSync('SLP_DLA_api.txt','utf8'),
			false,	// allow only HTML default sets
			"a|img",
			{
				"*":"title|style"		// 'title' and 'style' for all
			}
		);

		html = html.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
		var errorhtml = md(fs.readFileSync('SLP_Platform_api_ErrorCode.txt','utf8'),
			false,	// allow only HTML default sets
			"a|img",
			{
				"*":"title|style"		// 'title' and 'style' for all
			}
		);
		html = html.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
		errorhtml = errorhtml.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
		//html = html.replace(/<code>/gi,'<code class="">');

		res.send(
			"<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>\n" +
			"<html xmlns='http://www.w3.org/1999/xhtml'>\n" +
			"<head>\n" +
			"	<meta http-equiv='Content-Type' content='text/html; charset=utf-8'/>\n" +
			"	<link type='text/css' rel='stylesheet' href='stylesheets/markdown.css'/>\n" +
			"	<link type='text/css' rel='stylesheet' href='stylesheets/prettify.css'/>\n" +
			"	<link rel='shortcut icon' href='/favicon.ico' type='image/x-icon'/>\n" +
			"	<title>SLP DLA API 일람</title>\n" +
			"	<script type='text/javascript' src='javascripts/json2.js'></script>\n" +
			"	<script type='text/javascript' src='javascripts/jquery.js'></script>\n" +
			"	<script type='text/javascript' src='javascripts/prettify.js'></script>\n" +
			"	<script type='text/javascript'>\n" +
			"	</script>\n" +
			"</head>\n" +
			"<body onload='prettyPrint()'>\n" +
			html + errorhtml +
			+ "</body>\n"
			+ "</html>\n"
		);
		//res.render(
		//	'Api',
		//	{
		//		layout : false,
		//		pretty : true,
		//	}
		//);
	} else {
		res.send('잘못된 접근입니다.');
	}
});

app.get('/slp_kw_api?', function(req, res) {
	if(req.query.pass=='ehfkfpqakstp!1')
	{
		var html = md(fs.readFileSync('SLP_KW_api.txt','utf8'),
			false,	// allow only HTML default sets
			"a|img",
			{
				"*":"title|style"		// 'title' and 'style' for all
			}
		);

		html = html.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
		var errorhtml = md(fs.readFileSync('SLP_Platform_api_ErrorCode.txt','utf8'),
			false,	// allow only HTML default sets
			"a|img",
			{
				"*":"title|style"		// 'title' and 'style' for all
			}
		);
		html = html.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
		errorhtml = errorhtml.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
		//html = html.replace(/<code>/gi,'<code class="">');

		res.send(
			"<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>\n" +
			"<html xmlns='http://www.w3.org/1999/xhtml'>\n" +
			"<head>\n" +
			"	<meta http-equiv='Content-Type' content='text/html; charset=utf-8'/>\n" +
			"	<link type='text/css' rel='stylesheet' href='stylesheets/markdown.css'/>\n" +
			"	<link type='text/css' rel='stylesheet' href='stylesheets/prettify.css'/>\n" +
			"	<link rel='shortcut icon' href='/favicon.ico' type='image/x-icon'/>\n" +
			"	<title>SLP Kidswatts API 일람</title>\n" +
			"	<script type='text/javascript' src='javascripts/json2.js'></script>\n" +
			"	<script type='text/javascript' src='javascripts/jquery.js'></script>\n" +
			"	<script type='text/javascript' src='javascripts/prettify.js'></script>\n" +
			"	<script type='text/javascript'>\n" +
			"	</script>\n" +
			"</head>\n" +
			"<body onload='prettyPrint()'>\n" +
			html + errorhtml +
			+ "</body>\n"
			+ "</html>\n"
		);
		//res.render(
		//	'Api',
		//	{
		//		layout : false,
		//		pretty : true,
		//	}
		//);
	} else {
		res.send('잘못된 접근입니다.');
	}
});

app.get('/kidswell_api?', function (req, res) {
    if (req.query.pass == 'ehfkfpqakstp!1') {
        var html = md(fs.readFileSync('apiKidswell.txt', 'utf8'),
            false,	// allow only HTML default sets
            "a|img",
            {
                "*": "title|style"		// 'title' and 'style' for all
            }
        );

        html = html.replace(/<pre>/gi, '<pre class="prettyprint linenums">');
        var errorhtml = md(fs.readFileSync('apiErrorCode.txt', 'utf8'),
            false,	// allow only HTML default sets
            "a|img",
            {
                "*": "title|style"		// 'title' and 'style' for all
            }
        );
        html = html.replace(/<pre>/gi, '<pre class="prettyprint linenums">');
        errorhtml = errorhtml.replace(/<pre>/gi, '<pre class="prettyprint linenums">');
        //html = html.replace(/<code>/gi,'<code class="">');

        res.send(
            "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>\n" +
            "<html xmlns='http://www.w3.org/1999/xhtml'>\n" +
            "<head>\n" +
            "	<meta http-equiv='Content-Type' content='text/html; charset=utf-8'/>\n" +
            "	<link type='text/css' rel='stylesheet' href='stylesheets/markdown.css'/>\n" +
            "	<link type='text/css' rel='stylesheet' href='stylesheets/prettify.css'/>\n" +
            "	<link rel='shortcut icon' href='/favicon.ico' type='image/x-icon'/>\n" +
            "	<title>Kidswell API 일람</title>\n" +
            "	<script type='text/javascript' src='javascripts/json2.js'></script>\n" +
            "	<script type='text/javascript' src='javascripts/jquery.js'></script>\n" +
            "	<script type='text/javascript' src='javascripts/prettify.js'></script>\n" +
            "	<script type='text/javascript'>\n" +
            "	</script>\n" +
            "</head>\n" +
            "<body onload='prettyPrint()'>\n" +
            html + errorhtml +
            + "</body>\n"
            + "</html>\n"
        );
        //res.render(
        //	'Api',
        //	{
        //		layout : false,
        //		pretty : true,
        //	}
        //);
    } else {
        res.send('잘못된 접근입니다.');
    }
});

app.get('/slp_en_api?', function(req, res) {
	if(req.query.pass=='ehfkfpqakstp!1')
	{
		var html = md(fs.readFileSync('SLP_EN_api.txt','utf8'),
			false,	// allow only HTML default sets
			"a|img",
			{
				"*":"title|style"		// 'title' and 'style' for all
			}
		);

		html = html.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
		var errorhtml = md(fs.readFileSync('SLP_Platform_api_ErrorCode.txt','utf8'),
			false,	// allow only HTML default sets
			"a|img",
			{
				"*":"title|style"		// 'title' and 'style' for all
			}
		);
		html = html.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
		errorhtml = errorhtml.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
		//html = html.replace(/<code>/gi,'<code class="">');

		res.send(
			"<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>\n" +
			"<html xmlns='http://www.w3.org/1999/xhtml'>\n" +
			"<head>\n" +
			"	<meta http-equiv='Content-Type' content='text/html; charset=utf-8'/>\n" +
			"	<link type='text/css' rel='stylesheet' href='stylesheets/markdown.css'/>\n" +
			"	<link type='text/css' rel='stylesheet' href='stylesheets/prettify.css'/>\n" +
			"	<link rel='shortcut icon' href='/favicon.ico' type='image/x-icon'/>\n" +
			"	<title>SLP EN(영어) API 일람</title>\n" +
			"	<script type='text/javascript' src='javascripts/json2.js'></script>\n" +
			"	<script type='text/javascript' src='javascripts/jquery.js'></script>\n" +
			"	<script type='text/javascript' src='javascripts/prettify.js'></script>\n" +
			"	<script type='text/javascript'>\n" +
			"	</script>\n" +
			"</head>\n" +
			"<body onload='prettyPrint()'>\n" +
			html + errorhtml +
			+ "</body>\n"
			+ "</html>\n"
		);
		//res.render(
		//	'Api',
		//	{
		//		layout : false,
		//		pretty : true,
		//	}
		//);
	} else {
		res.send('잘못된 접근입니다.');
	}
});

app.get('/slp_nde_api?', function(req, res) {
    if(req.query.pass=='ehfkfpqakstp!1')
    {
        var html = md(fs.readFileSync('SLP_NDE_api.txt','utf8'),
            false,	// allow only HTML default sets
            "a|img",
            {
                "*":"title|style"		// 'title' and 'style' for all
            }
        );

        html = html.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
        var errorhtml = md(fs.readFileSync('apiErrorCode.txt','utf8'),
            false,	// allow only HTML default sets
            "a|img",
            {
                "*":"title|style"		// 'title' and 'style' for all
            }
        );
        html = html.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
        errorhtml = errorhtml.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
        //html = html.replace(/<code>/gi,'<code class="">');

        res.send(
            "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>\n" +
            "<html xmlns='http://www.w3.org/1999/xhtml'>\n" +
            "<head>\n" +
            "	<meta http-equiv='Content-Type' content='text/html; charset=utf-8'/>\n" +
            "	<link type='text/css' rel='stylesheet' href='stylesheets/markdown.css'/>\n" +
            "	<link type='text/css' rel='stylesheet' href='stylesheets/prettify.css'/>\n" +
            "	<link rel='shortcut icon' href='/favicon.ico' type='image/x-icon'/>\n" +
            "	<title>SLP NDE(도라도라) API 일람</title>\n" +
            "	<script type='text/javascript' src='javascripts/json2.js'></script>\n" +
            "	<script type='text/javascript' src='javascripts/jquery.js'></script>\n" +
            "	<script type='text/javascript' src='javascripts/prettify.js'></script>\n" +
            "	<script type='text/javascript'>\n" +
            "	</script>\n" +
            "</head>\n" +
            "<body onload='prettyPrint()'>\n" +
            html + errorhtml +
            + "</body>\n"
            + "</html>\n"
        );
        //res.render(
        //	'Api',
        //	{
        //		layout : false,
        //		pretty : true,
        //	}
        //);
    } else {
        res.send('잘못된 접근입니다.');
    }
});

app.get('/api_ADB?', function (req, res) {
    if (req.query.pass == 'dpdlelql!') {
        var html = md(fs.readFileSync('adb.txt', 'utf8'),
            false,	// allow only HTML default sets
            "a|img",
            {
                "*": "title|style"		// 'title' and 'style' for all
            }
        );

        html = html.replace(/<pre>/gi, '<pre class="prettyprint linenums">');
        var errorhtml = md(fs.readFileSync('apiErrorCode.txt', 'utf8'),
            false,	// allow only HTML default sets
            "a|img",
            {
                "*": "title|style"		// 'title' and 'style' for all
            }
        );
        html = html.replace(/<pre>/gi, '<pre class="prettyprint linenums">');
        errorhtml = errorhtml.replace(/<pre>/gi, '<pre class="prettyprint linenums">');
        //html = html.replace(/<code>/gi,'<code class="">');
        errorhtml = "";
        res.send(
            "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>\n" +
            "<html xmlns='http://www.w3.org/1999/xhtml'>\n" +
            "<head>\n" +
            "	<meta http-equiv='Content-Type' content='text/html; charset=utf-8'/>\n" +
            "	<link type='text/css' rel='stylesheet' href='stylesheets/markdown.css'/>\n" +
            "	<link type='text/css' rel='stylesheet' href='stylesheets/prettify.css'/>\n" +
            "	<link rel='shortcut icon' href='/favicon.ico' type='image/x-icon'/>\n" +
            "	<title>ADB API 일람</title>\n" +
            "	<script type='text/javascript' src='javascripts/json2.js'></script>\n" +
            "	<script type='text/javascript' src='javascripts/jquery.js'></script>\n" +
            "	<script type='text/javascript' src='javascripts/prettify.js'></script>\n" +
            "	<script type='text/javascript'>\n" +
            "	</script>\n" +
            "</head>\n" +
            "<body onload='prettyPrint()'>\n" +
            html + errorhtml +
            + "</body>\n"
            + "</html>\n"
        );
        //res.render(
        //	'Api',
        //	{
        //		layout : false,
        //		pretty : true,
        //	}
        //);
    } else {
        res.send('잘못된 접근입니다.');
    }
});

app.get('/slp_jsu_api?', function(req, res) {
    if(req.query.pass=='ehfkfpqakstp!1')
    {
        var html = md(fs.readFileSync('JSU_api.txt','utf8'),
            false,	// allow only HTML default sets
            "a|img",
            {
                "*":"title|style"		// 'title' and 'style' for all
            }
        );

        html = html.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
        var errorhtml = md(fs.readFileSync('apiErrorCode.txt','utf8'),
            false,	// allow only HTML default sets
            "a|img",
            {
                "*":"title|style"		// 'title' and 'style' for all
            }
        );
        html = html.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
        errorhtml = errorhtml.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
        //html = html.replace(/<code>/gi,'<code class="">');

        res.send(
            "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>\n" +
            "<html xmlns='http://www.w3.org/1999/xhtml'>\n" +
            "<head>\n" +
            "	<meta http-equiv='Content-Type' content='text/html; charset=utf-8'/>\n" +
            "	<link type='text/css' rel='stylesheet' href='stylesheets/markdown.css'/>\n" +
            "	<link type='text/css' rel='stylesheet' href='stylesheets/prettify.css'/>\n" +
            "	<link rel='shortcut icon' href='/favicon.ico' type='image/x-icon'/>\n" +
            "	<title>JSU (Just Show Up) API 일람</title>\n" +
            "	<script type='text/javascript' src='javascripts/json2.js'></script>\n" +
            "	<script type='text/javascript' src='javascripts/jquery.js'></script>\n" +
            "	<script type='text/javascript' src='javascripts/prettify.js'></script>\n" +
            "	<script type='text/javascript'>\n" +
            "	</script>\n" +
            "</head>\n" +
            "<body onload='prettyPrint()'>\n" +
            html + errorhtml +
            + "</body>\n"
            + "</html>\n"
        );
        //res.render(
        //	'Api',
        //	{
        //		layout : false,
        //		pretty : true,
        //	}
        //);
    } else {
        res.send('잘못된 접근입니다.');
    }
});

app.get('/fit_ada?', function(req, res) {
    if(req.query.pass=='fitadavmfhwprxm!1')
    {
        var html = md(fs.readFileSync('ada_api.txt','utf8'),
            false,	// allow only HTML default sets
            "a|img",
            {
                "*":"title|style"		// 'title' and 'style' for all
            }
        );

        html = html.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
        var errorhtml = md(fs.readFileSync('apiErrorCode.txt','utf8'),
            false,	// allow only HTML default sets
            "a|img",
            {
                "*":"title|style"		// 'title' and 'style' for all
            }
        );
        html = html.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
        errorhtml = errorhtml.replace(/<pre>/gi,'<pre class="prettyprint linenums">');
        //html = html.replace(/<code>/gi,'<code class="">');

        res.send(
            "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>\n" +
            "<html xmlns='http://www.w3.org/1999/xhtml'>\n" +
            "<head>\n" +
            "	<meta http-equiv='Content-Type' content='text/html; charset=utf-8'/>\n" +
            "	<link type='text/css' rel='stylesheet' href='stylesheets/markdown.css'/>\n" +
            "	<link type='text/css' rel='stylesheet' href='stylesheets/prettify.css'/>\n" +
            "	<link rel='shortcut icon' href='/favicon.ico' type='image/x-icon'/>\n" +
            "	<title>ADA API 일람</title>\n" +
            "	<script type='text/javascript' src='javascripts/json2.js'></script>\n" +
            "	<script type='text/javascript' src='javascripts/jquery.js'></script>\n" +
            "	<script type='text/javascript' src='javascripts/prettify.js'></script>\n" +
            "	<script type='text/javascript'>\n" +
            "	</script>\n" +
            "</head>\n" +
            "<body onload='prettyPrint()'>\n" +
            html + errorhtml +
            + "</body>\n"
            + "</html>\n"
        );
        //res.render(
        //	'Api',
        //	{
        //		layout : false,
        //		pretty : true,
        //	}
        //);
    } else {
        res.send('잘못된 접근입니다.');
    }
});



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
