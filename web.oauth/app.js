/**
 * Created by kkuris on 2017-12-19.
 */

var express = require('express');
var app = express();


app.enable('trust proxy');

app.set('views', './views_file');
app.set('view engine', 'jade');


app.get('/oauth', function (req, res) {
    res.send('test page');
});


app.listen(19001, function () {
    console.log('19001port open');
});
