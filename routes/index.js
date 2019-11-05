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
  var maps_filter = req.query.map;
  var end_date = req.query.endDate;
  var start_date = req.query.startDate;
  var result_filter = req.query.result;
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

      if(maps_filter == undefined){
        maps_filter = ["Cache", "Cobblestone", "Dust II", "Inferno", "Mirage", "Nuke", "Overpass", "Train", "Vertigo"];
      }
      if(result_filter == undefined){
        result_filter = ['win', 'loss', 'draw'];
      }
      for(var i = 0; i < matches.length; i++){
        var match = matches[i];
        var result = match.score[0] != match.score[1] ? (match.score[0] > match.score[1] ? 'win' : 'loss') : 'draw';
        if(!maps_filter.includes(match.map) || new Date(match.date) > new Date(end_date) || new Date(match.date) < new Date(start_date) || !result_filter.includes(result)){
          matches.splice(i, 1);
          i--;
          tim_configured.splice(i,1);
          ryan_configured.splice(i,1);
          collin_configured.splice(i,1);
          sean_configured.splice(i,1);
          cal_configured.splice(i,1);
          josh_configured.splice(i,1);
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

router.get('/leaderboards', function(req, res, next) {
  var date = req.query.month;
  async.parallel({
    matches: function(callback) {
      Match.find()
      .exec(callback)
    },
    tim: function(callback) {
      StatsInstance.find({ 'user': 'Tim'})
      .populate('match')
      .sort([['match', 'ascending']])
      .exec(callback)
    },
    ryan: function(callback) {
      StatsInstance.find({ 'user': 'Ryan'})
      .populate('match')
      .sort([['match', 'ascending']])
      .exec(callback)
    },
    collin: function(callback) {
      StatsInstance.find({ 'user': 'Collin'})
      .populate('match')
      .sort([['match', 'ascending']])
      .exec(callback)
    },
    cal: function(callback) {
      StatsInstance.find({ 'user': 'Cal'})
      .populate('match')
      .sort([['match', 'ascending']])
      .exec(callback)
    },
    sean: function(callback) {
      StatsInstance.find({ 'user': 'Sean'})
      .populate('match')
      .sort([['match', 'ascending']])
      .exec(callback)
    },
    josh: function(callback) {
      StatsInstance.find({ 'user': 'Josh'})
      .populate('match')
      .sort([['match', 'ascending']])
      .exec(callback)
    }
  }, function (err, results) {
    if (err) {return next(err);}
    var date_filter = new Date(date);
    if(date_filter == undefined){
      date_filter = new Date();
    }
    var averages = {};
    averages['Tim'] = leaderboardsHelperFunction(results.tim, date_filter);
    averages['Ryan'] = leaderboardsHelperFunction(results.ryan, date_filter);
    averages['Collin'] = leaderboardsHelperFunction(results.collin, date_filter);
    averages['Sean'] = leaderboardsHelperFunction(results.sean, date_filter);
    averages['Cal'] = leaderboardsHelperFunction(results.cal, date_filter);
    averages['Josh'] = leaderboardsHelperFunction(results.josh, date_filter);
    var ratings = [];
    var kdr  = [];
    var kda = [];
    var hs = [];
    var adr = [];
    var kpr = [];
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var month_years = [];
    var matches = results.matches;
    matches.sort(function(a,b) {
      return new Date(b.date) - new Date(a.date);
    });
    for (match in matches) {
      match_date = new Date(matches[match].date);
      console.log(match_date);
      date_string = months[match_date.getMonth()] + " " + match_date.getFullYear();
      console.log(date_string);
      if(!month_years.includes(date_string)){
        month_years.push(date_string);
      }
    }
    for (player in averages) {
      ratings.push({'player': player, 'stat': averages[player].rating});
      kdr.push({'player': player, 'stat': averages[player].kdr});
      kda.push({'player': player, 'stat': averages[player].kda});
      hs.push({'player': player, 'stat': averages[player].hs});
      adr.push({'player': player, 'stat': averages[player].adr});
      kpr.push({'player': player, 'stat': averages[player].kpr});
    }
    ratings.sort(compare_stats);
    kdr.sort(compare_stats);
    kda.sort(compare_stats);
    hs.sort(compare_stats);
    adr.sort(compare_stats);
    kpr.sort(compare_stats);

    res.render('leaderboards', { title: 'Leaderboards', ratings:ratings, kdr:kdr, kda:kda, hs:hs, adr:adr, kpr:kpr, months: month_years});
  });
});

function leaderboardsHelperFunction(statsObject, date) {
  var averages = {'rating':0, 'kdr':0, 'kda':0, 'hs':0, 'adr':0, 'kpr':0, 'count':0};
  for(var i = 0; i < statsObject.length; i++){
    var matchDate = new Date(statsObject[i].match.date);
    if((matchDate.getMonth() == date.getMonth()) && (matchDate.getFullYear() == date.getFullYear())) {
      averages.rating += statsObject[i].rating;
      averages.kdr += statsObject[i].kdr;
      averages.kda += statsObject[i].kda;
      averages.hs += statsObject[i].hs;
      averages.adr += statsObject[i].adr;
      averages.kpr += statsObject[i].kpr;
      averages.count += 1;
    }
  }
  for (stat in averages) {
    averages[stat] /= averages.count;
  }
  return averages;
}

function compare_stats(a,b) {
  if(isNaN(a.stat)) {
    if(isNaN(b.stat)) {
      return 0;
    }
    return 1;
  } else if(isNaN(b.stat)) {
    return -1;
  }
  return b.stat-a.stat;
}

module.exports = router;
