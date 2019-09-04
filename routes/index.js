var express = require('express');
var router = express.Router();
var Match = require('../models/match');
var StatsInstance = require('../models/statsinstance')
var User = require('../models/user');
var async = require('async');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/Shared', function(req, res, next) {
  StatsInstance.find()
    .populate('match')
    .sort([['match', 'ascending']])
    .exec(function (err, list_stats) {
      if (err) {return next(err);}
      list_stats.sort(function(a,b) {
        return new Date(b.match.date) - new Date(a.match.date);
      })
      console.log(list_stats);
      res.render('shared', { title: 'Shared'});
    });
});

module.exports = router;
