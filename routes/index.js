var express = require('express');
var router = express.Router();
var Match = require('../models/match');
var StatsInstance = require('../models/statsinstance')
var User = require('../models/user');
var async = require('async');

/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('home');
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
    jack: function(callback) {
      StatsInstance.find({ 'user': 'Jack'})
      .sort([['match', 'ascending']])
      .exec(callback)
    },
    sean: function(callback) {
      StatsInstance.find({ 'user': 'Sean'})
      .sort([['match', 'ascending']])
      .exec(callback)
    },
    connor: function(callback) {
      StatsInstance.find({ 'user': 'Connor'})
      .sort([['match', 'ascending']])
      .exec(callback)
    },
  }, function (err, results) {
      if (err) {return next(err);}
      var matches = results.matches;
      var tim = results.tim.sort(function(a,b){return b.match-a.match;});
      var ryan = results.ryan.sort(function(a,b){return b.match-a.match;});
      var collin = results.collin.sort(function(a,b){return b.match-a.match;});
      var jack = results.jack.sort(function(a,b){return b.match-a.match;});
      var sean = results.sean.sort(function(a,b){return b.match-a.match;});
      var connor = results.connor.sort(function(a,b){return b.match-a.match;});
      matches.sort(function(a,b) {
        return new Date(b.date) - new Date(a.date);
      });
      var tim_configured = [];
      var ryan_configured = [];
      var collin_configured = [];
      var jack_configured = [];
      var sean_configured = [];
      var connor_configured = [];
      for (match in matches) {
        var match_id = matches[match]._id;
        var tim_instance = tim.find(instance => { return instance.match + '' == match_id + '';});
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
        var jack_instance = jack.find(instance => {return instance.match + '' == match_id + '';});
        if(typeof(jack_instance) != "undefined") {
          jack_configured.push(jack_instance);
        } else {
          jack_configured.push('');
        }
        var sean_instance = sean.find(instance => {return instance.match + '' == match_id + '';});
        if(typeof(sean_instance) != "undefined") {
          sean_configured.push(sean_instance);
        } else {
          sean_configured.push('');
        }
        var connor_instance = connor.find(instance => {return instance.match + '' == match_id + '';});
        if(typeof(connor_instance) != "undefined") {
          connor_configured.push(connor_instance);
        } else {
          connor_configured.push('');
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
          tim_configured.splice(i,1);
          ryan_configured.splice(i,1);
          collin_configured.splice(i,1);
          sean_configured.splice(i,1);
          jack_configured.splice(i,1);
          connor_configured.splice(i,1);
          i--;
        }
      }

      var player_list = [tim_configured, ryan_configured, collin_configured, sean_configured, jack_configured, connor_configured];
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

router.get('/rounds', function(req, res, next) {
  var maps_filter = req.query.map;
  var end_date = req.query.endDate;
  var start_date = req.query.startDate;
  var result_filter = req.query.result;
  Match.find()
    .sort([['date', 'ascending']])
    .exec(function(err, stats) {
      if (err) {return next(err);}
      stats.sort(function(a,b) {
        return new Date(b.date) - new Date(a.date);
      })

      if(maps_filter == undefined){
        maps_filter = ["Cache", "Cobblestone", "Dust II", "Inferno", "Mirage", "Nuke", "Overpass", "Train", "Vertigo"];
      }
      if(result_filter == undefined){
        result_filter = ['win', 'loss', 'draw'];
      }
      for(var i = 0; i < stats.length; i++){
        var match = stats[i];
        var result = match.score[0] != match.score[1] ? (match.score[0] > match.score[1] ? 'win' : 'loss') : 'draw';
        if(!maps_filter.includes(match.map) || new Date(match.date) > new Date(end_date) || new Date(match.date) < new Date(start_date) || !result_filter.includes(result)){
          stats.splice(i, 1);
          i--;
        }
      }

      var averages = {'Pistol': [0,0], 'Eco': [0,0], 'Anti-Eco': [0,0], 'Semi-Eco': [0,0], 'Force': [0,0], 'Normal': [0,0]};
      for(var i = 0; i < stats.length; i++) {
        averages['Pistol'][0] += stats[i]['wins_buy']['Pistol round'];
        averages['Eco'][0] += stats[i].wins_buy['Eco'];
        averages['Anti-Eco'][0] += stats[i].wins_buy['Anti-Eco'];
        averages['Semi-Eco'][0] += stats[i].wins_buy['Semi-Eco'];
        averages['Force'][0] += stats[i].wins_buy['Force buy'];
        averages['Normal'][0] += stats[i].wins_buy['Normal'];
        averages['Pistol'][1] += stats[i].loss_buy['Pistol round'];
        averages['Eco'][1] += stats[i].loss_buy['Eco'];
        averages['Anti-Eco'][1] += stats[i].loss_buy['Anti-Eco'];
        averages['Semi-Eco'][1] += stats[i].loss_buy['Semi-Eco'];
        averages['Force'][1] += stats[i].loss_buy['Force buy'];
        averages['Normal'][1] += stats[i].loss_buy['Normal'];
      }
      console.log(stats[1]['loss_buy']);
      res.render('round_wins', {title: 'Rounds', matches: stats, averages: averages});
    })
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
    jack: function(callback) {
      StatsInstance.find({ 'user': 'Jack'})
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
    connor: function(callback) {
      StatsInstance.find({ 'user': 'Connor'})
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
    averages['Jack'] = leaderboardsHelperFunction(results.jack, date_filter);
    averages['Connor'] = leaderboardsHelperFunction(results.connor, date_filter);
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
      date_string = months[match_date.getMonth()] + " " + match_date.getFullYear();
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

router.get('/hall-of-fame', function(req, res, next) {
  var maxes = {"Cache":[-1,""], "Cobblestone":[-1,""], "Dust II":[-1,""], "Inferno":[-1,""], "Mirage":[-1,""], "Nuke":[-1,""], "Overpass":[-1,""], "Train":[-1,""], "Vertigo":[-1,""]};
  var reverse_double = {"Tim":0 , "Ryan":0, "Collin":0, "Sean":0, "Jack":0, "Sharfin":0, "Connor":0};
  async.parallel({
      matches: function(callback) {
        Match.find()
        .exec(callback)
      },
      players: function(callback) {
        StatsInstance.find()
        .populate('match')
        .exec(callback)
      }
    }, function(err, results) {
      if (err) {return next(err);}
      var player_list = [];
      player_list = results.players;
      for(var i = 0; i < player_list.length; i++){
        var current_map = player_list[i].match.map;
        var current_kills = player_list[i].kills;
        if(maxes[current_map][0] < current_kills){
          maxes[current_map][0] = current_kills;
          maxes[current_map][1] = player_list[i].user;
        } else if (maxes[current_map][0] == current_kills) {
          maxes[current_map][1] += ", " + player_list[i].user;
        }
      }
      max_double = -1;
      max_double_player = "";
      for(var i = 0; i < player_list.length; i++) {
        instance = player_list[i];
        if(instance.reverse_double) {
          reverse_double[instance.user] += 1
        }
        if(reverse_double[instance.user] > max_double) {
          max_double = reverse_double[instance.user];
          max_double_player = instance.user;
        }
      }
      res.render('hall-of-fame', {title: 'Hall Of Fame', max: maxes, "reverse_player":max_double_player, "reverse_double": max_double});
  });
});

router.get('/hall-of-shame', function(req, res, next) {
  var maxes = {"Cache":[50,""], "Cobblestone":[50,""], "Dust II":[50,""], "Inferno":[50,""], "Mirage":[50,""], "Nuke":[50,""], "Overpass":[50,""], "Train":[50,""], "Vertigo":[50,""]};
  var double_0 = {"Tim":0 , "Ryan":0, "Collin":0, "Sean":0, "Jack":0, "Sharfin":0, "Connor":0};
  async.parallel({
      matches: function(callback) {
        Match.find()
        .exec(callback)
      },
      players: function(callback) {
        StatsInstance.find()
        .populate('match')
        .exec(callback)
      }
    }, function(err, results) {
      if (err) {return next(err);}
      var player_list = [];
      player_list = results.players;
      for(var i = 0; i < player_list.length; i++){
        var current_map = player_list[i].match.map;
        var current_kills = player_list[i].kills;
        if(maxes[current_map][0] > current_kills){
          maxes[current_map][0] = current_kills;
          maxes[current_map][1] = player_list[i].user;
        } else if (maxes[current_map][0] == current_kills) {
          maxes[current_map][1] += ", " + player_list[i].user;
        }
      }
      max_double = -1;
      max_double_player = "";
      for(var i = 0; i < player_list.length; i++) {
        instance = player_list[i];
        if(instance.double_0){
          double_0[instance.user] += 1;
        }
        if(double_0[instance.user] > max_double){
          max_double = double_0[instance.user];
          max_double_player = instance.user;
        }
      }
      res.render('hall-of-shame', {title: 'Hall Of Fame', max: maxes, "double_0": max_double, "double_player": max_double_player});
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
