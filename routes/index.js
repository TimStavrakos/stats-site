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
  async.parallel({
    matches: function(callback) {
      Match.find()
      .exec(callback)
    },
    tim: function(callback) {
      StatsInstance.find({ 'user': 'Tim'})
      .sort([['match', 'ascending']])
      .exec(callback)
    },
    ryan: function(callback) {
      StatsInstance.find({ 'user': 'Ryan'})
      .sort([['match', 'ascending']])
      .exec(callback)
    },
    collin: function(callback) {
      StatsInstance.find({ 'user': 'Collin'})
      .sort([['match', 'ascending']])
      .exec(callback)
    },
    cal: function(callback) {
      StatsInstance.find({ 'user': 'Cal'})
      .sort([['match', 'ascending']])
      .exec(callback)
    },
    sean: function(callback) {
      StatsInstance.find({ 'user': 'Sean'})
      .sort([['match', 'ascending']])
      .exec(callback)
    },
    josh: function(callback) {
      StatsInstance.find({ 'user': 'Josh'})
      .sort([['match', 'ascending']])
      .exec(callback)
    },
  }, function (err, results) {
      if (err) {return next(err);}
      var matches = results.matches;
      var tim = results.tim.sort(function(a,b){return b.match-a.match;});
      var ryan = results.ryan.sort(function(a,b){return b.match-a.match;});
      var collin = results.collin.sort(function(a,b){return b.match-a.match;});
      var cal = results.cal.sort(function(a,b){return b.match-a.match;});
      var sean = results.sean.sort(function(a,b){return b.match-a.match;});
      var josh = results.josh.sort(function(a,b){return b.match-a.match;});
      matches.sort(function(a,b) {
        return new Date(b.date) - new Date(a.date);
      });
      var tim_configured = [];
      var ryan_configured = [];
      var collin_configured = [];
      var cal_configured = [];
      var sean_configured = [];
      var josh_configured = [];
      for (match in matches) {
        var match_id = matches[match]._id;
        var tim_instance = tim.find(instance => {return instance.match + '' == match_id + '';});
        if(typeof(tim_instance) != "undefined") {
          tim_configured.push(tim_instance);
        } else {
          tim_configured.push('');
        }
        var ryan_instance = ryan.find(instance => {return instance.match + '' == match_id + '';});
        if(typeof(ryan_instance) != "undefined") {
          ryan_configured.push(ryan_instance);
        } else {
          ryan_configured.push('');
        }
        var collin_instance = collin.find(instance => {return instance.match + '' == match_id + '';});
        if(typeof(collin_instance) != "undefined") {
          collin_configured.push(collin_instance);
        } else {
          collin_configured.push('');
        }
        var cal_instance = cal.find(instance => {return instance.match + '' == match_id + '';});
        if(typeof(cal_instance) != "undefined") {
          cal_configured.push(cal_instance);
        } else {
          cal_configured.push('');
        }
        var sean_instance = sean.find(instance => {return instance.match + '' == match_id + '';});
        if(typeof(sean_instance) != "undefined") {
          sean_configured.push(sean_instance);
        } else {
          sean_configured.push('');
        }
        var josh_instance = josh.find(instance => {return instance.match + '' == match_id + '';});
        if(typeof(josh_instance) != "undefined") {
          josh_configured.push(josh_instance);
        } else {
          josh_configured.push('');
        }
      }
      var player_list = [tim_configured, ryan_configured, collin_configured, sean_configured, cal_configured, josh_configured];
      var averages = [{'rating': 0, 'adr':0, 'kda':0, 'count':0},{'rating': 0, 'adr':0, 'kda':0, 'count':0},{'rating': 0, 'adr':0, 'kda':0, 'count':0},{'rating': 0, 'adr':0, 'kda':0, 'count':0},{'rating': 0, 'adr':0, 'kda':0, 'count':0},{'rating': 0, 'adr':0, 'kda':0, 'count':0}];
      for(var i = 0; i < player_list.length; i++){
        for(match in player_list[i]){
          if(player_list[i][match] != '') {
            averages[i].rating += player_list[i][match].rating;
            averages[i].adr += player_list[i][match].adr;
            averages[i].kda += player_list[i][match].kda;
            averages[i].count += 1;
          }
        }
      }
      
      res.render('shared', { title: 'Shared', matches: matches, list: player_list, averages:averages});

  });
});

module.exports = router;
