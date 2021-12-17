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

router.get('/Match/:id', function(req, res, next){
  var id = req.params.id;
  Match.find({'match_id': id})
    .exec(function (err, list_stats){
      res.render('match', {});
    })
});

router.get('/Fives', function(req, res, next){
  var players = req.query.array.split(',');
  console.log(players);
  Match.find({'players': {$all: players}})
    .sort([['date', 'descending']])
    .populate('stats_instances')
    .exec(function (err, list_stats){
      var formatted_rows = [];
      for (match in list_stats){
        console.log('\nLineBreak\n');
        //console.log(list_stats[match]);
        var temp_row = [list_stats[match].formatted_date, list_stats[match].map, list_stats[match].score];
        for (player in players){
          for (player_stats in list_stats[match].stats_instances) {
            var instance = list_stats[match].stats_instances[player_stats];
            //console.log(instance.user);
            if (instance.user == players[player]) {
              temp_row.push(instance.rating);
              temp_row.push(instance.adr);
              temp_row.push(instance.kda);
            }
            console.log(temp_row);
          }
        }
        formatted_rows.push(temp_row);
        console.log(formatted_rows);
      }
      res.render('fives', {players: players, formatted_rows: formatted_rows});
    })
});

router.get('/Shared', function(req, res, next) {
  var maps_filter = req.query.map;
  var end_date = req.query.endDate;
  var start_date = req.query.startDate;
  var result_filter = req.query.result;
  if(maps_filter == undefined){
    maps_filter = ["Cache", "Cobblestone", "Dust II", "Inferno", "Mirage", "Nuke", "Overpass", "Train", "Vertigo"];
  }
  if(result_filter == undefined){
    result_filter = ['win', 'loss', 'draw'];
  }
  if(start_date == undefined) {
    start_date = new Date();
    start_date = start_date.setFullYear(start_date.getFullYear()-1);
  }
  if(end_date == undefined) {
    end_date = new Date();
  }
  Match.find({'map': {$in: maps_filter}, 'result': {$in: result_filter},
              'date': {$gte: start_date, $lte: end_date}})
    .sort([['date', 'descending']])
    .populate('stats_instances')
    .exec(function (err, results) {
      if (err) {return next(err);}
      var tim_configured = [];
      var ryan_configured = [];
      var collin_configured = [];
      var jack_configured = [];
      var sean_configured = [];
      var connor_configured = [];
      var wins = 0;
      var losses = 0;
      var ties = 0;
      var matches = results;
      for (match in matches) {
        var match_id = matches[match]._id;
        if (matches[match].score[0] > matches[match].score[1]) {
          wins += 1;
        } else if (matches[match].score[0] < matches[match].score[1]) {
          losses += 1;
        } else {
          ties += 1;
        }

        if(matches[match].players.includes("Tim")) {
          tim_configured.push(matches[match].stats_instances[matches[match].players.indexOf("Tim")]);
        } else {
          tim_configured.push('');
        }

        if(matches[match].players.includes("Ryan")) {
          ryan_configured.push(matches[match].stats_instances[matches[match].players.indexOf("Ryan")]);
        } else {
          ryan_configured.push('');
        }

        if(matches[match].players.includes("Collin")) {
          collin_configured.push(matches[match].stats_instances[matches[match].players.indexOf("Collin")]);
        } else {
          collin_configured.push('');
        }

        if(matches[match].players.includes("Jack")) {
          jack_configured.push(matches[match].stats_instances[matches[match].players.indexOf("Jack")]);
        } else {
          jack_configured.push('');
        }

        if(matches[match].players.includes("Sean")) {
          sean_configured.push(matches[match].stats_instances[matches[match].players.indexOf("Sean")]);
        } else {
          sean_configured.push('');
        }

        if(matches[match].players.includes("Connor")) {
          connor_configured.push(matches[match].stats_instances[matches[match].players.indexOf("Connor")]);
        } else {
          connor_configured.push('');
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
      var variances = [{'rating': 0, 'adr':0, 'kda':0, 'count':0},{'rating': 0, 'adr':0, 'kda':0, 'count':0},{'rating': 0, 'adr':0, 'kda':0, 'count':0},{'rating': 0, 'adr':0, 'kda':0, 'count':0},{'rating': 0, 'adr':0, 'kda':0, 'count':0},{'rating': 0, 'adr':0, 'kda':0, 'count':0}];
      for(var i = 0; i < player_list.length; i++) {
        for(match in player_list[i]) {
          if(player_list[i][match] != '') {
            variances[i].rating += (player_list[i][match].rating - (averages[i].rating/averages[i].count)) ** 2;
            variances[i].adr += (player_list[i][match].adr - (averages[i].adr/averages[i].count)) ** 2;
            variances[i].kda += (player_list[i][match].kda - (averages[i].kda/averages[i].count)) ** 2;
            variances[i].count += 1;
          }
        }
      }
      for(var i = 0; i < player_list.length; i++) {
        variances[i].rating = Math.sqrt(variances[i].rating/(variances[i].count-1));
        variances[i].adr = Math.sqrt(variances[i].adr/(variances[i].count-1));
        variances[i].kda = Math.sqrt(variances[i].kda/(variances[i].count-1));
      }
      console.log(variances);
      res.render('shared', { title: 'Shared', matches: matches, list: player_list, averages:averages, variances: variances, wins:wins, losses:losses, ties:ties, start_date: start_date});

  });
});

router.get('/rounds', function(req, res, next) {
  var maps_filter = req.query.map;
  var end_date = req.query.endDate;
  var start_date = req.query.startDate;
  var result_filter = req.query.result;
  Match.find()
    .sort([['date', 'descending']])
    .exec(function(err, stats) {
      if (err) {return next(err);}

      if(maps_filter == undefined){
        maps_filter = ["Cache", "Cobblestone", "Dust II", "Inferno", "Mirage", "Nuke", "Overpass", "Train", "Vertigo"];
      }
      if(result_filter == undefined){
        result_filter = ['win', 'loss', 'draw'];
      }
      for(var i = 0; i < stats.length; i++){
        var match = stats[i];
        var result = match.result;
        if(!maps_filter.includes(match.map) || new Date(match.date) > new Date(end_date) || new Date(match.date) < new Date(start_date) || !result_filter.includes(result)){
          stats.splice(i, 1);
          i--;
        }
      }

      var buys = {};

      for(match in stats){
        for(buy in stats[match].buys){
          if(!(stats[match].buys[buy] in buys)){
            buys[stats[match].buys[buy]] = 1;
          } else {
            buys[stats[match].buys[buy]] += 1;
          }
        }
      }

      /*var averages = {'Pistol': [0,0], 'Eco': [0,0], 'Anti-Eco': [0,0], 'Semi-Eco': [0,0], 'Force': [0,0], 'Normal': [0,0]};
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
      }*/
      console.log(stats);
      res.render('round_wins', {title: 'Rounds', matches: stats, averages: buys});
    })
});

router.get('/leaderboards', function(req, res, next) {
  if(req.query.startDate == undefined) {
    var start_date = new Date();
    start_date.setFullYear(start_date.getFullYear()-1);
  } else {
    var start_date = new Date(req.query.startDate);
  }
  if(req.query.endDate == undefined) {
    var end_date = new Date();
  } else {
    var end_date = new Date(req.query.endDate);
  }
  Match.find({'players': {$in: ['Tim', 'Ryan', 'Collin', 'Sean', 'Jack', 'Connor']},
              'date': {$gte: start_date, $lt: end_date}})
    .populate('stats_instances')
    .exec(function (err, results) {
    if (err) {return next(err);}

    var averages = {'Tim': {'rating': 0, 'kdr': 0, 'kda': 0, 'hs': 0, 'adr': 0, 'kpr': 0, 'count': 0},
                    'Ryan': {'rating': 0, 'kdr': 0, 'kda': 0, 'hs': 0, 'adr': 0, 'kpr': 0, 'count': 0},
                    'Collin': {'rating': 0, 'kdr': 0, 'kda': 0, 'hs': 0, 'adr': 0, 'kpr': 0, 'count': 0},
                    'Sean': {'rating': 0, 'kdr': 0, 'kda': 0, 'hs': 0, 'adr': 0, 'kpr': 0, 'count': 0},
                    'Jack': {'rating': 0, 'kdr': 0, 'kda': 0, 'hs': 0, 'adr': 0, 'kpr': 0, 'count': 0},
                    'Connor': {'rating': 0, 'kdr': 0, 'kda': 0, 'hs': 0, 'adr': 0, 'kpr': 0, 'count': 0},
                    'Gil': {'rating': 0, 'kdr': 0, 'kda': 0, 'hs': 0, 'adr': 0, 'kpr': 0, 'count': 0}};

    for(match in results) {
      var current_match = results[match]
      for(player in results[match].players){
        if(['Tim','Ryan','Collin','Sean','Jack','Connor','Gil'].includes(current_match.players[player])){
          averages[current_match.players[player]].rating += current_match.stats_instances[player].rating;
          averages[current_match.players[player]].kdr += current_match.stats_instances[player].kdr;
          averages[current_match.players[player]].kda += current_match.stats_instances[player].kda;
          averages[current_match.players[player]].hs += current_match.stats_instances[player].hs;
          averages[current_match.players[player]].adr += current_match.stats_instances[player].adr;
          averages[current_match.players[player]].kpr += current_match.stats_instances[player].kpr;
          averages[current_match.players[player]].count += 1;
        }
      }
    }

    for(player in averages) {
      for(stat in averages[player]) {
        if(stat != 'count') {
          averages[player][stat] = averages[player][stat] / averages[player]['count'];
        }
      }
    }

    var ratings = [];
    var kdr  = [];
    var kda = [];
    var hs = [];
    var adr = [];
    var kpr = [];

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

    res.render('leaderboards', { title: 'Leaderboards', ratings:ratings, kdr:kdr, kda:kda, hs:hs, adr:adr, kpr:kpr, start_date: start_date.toISOString().substring(0, 10), end_date: end_date.toISOString().substring(0, 10)});
  });
});

router.get('/hall-of-fame', function(req, res, next) {
  var maxes = {"Cache":[-1,""], "Cobblestone":[-1,""], "Dust II":[-1,""], "Inferno":[-1,""], "Mirage":[-1,""], "Nuke":[-1,""], "Overpass":[-1,""], "Train":[-1,""], "Vertigo":[-1,""]};
  var reverse_double = {"Tim":0 , "Ryan":0, "Collin":0, "Sean":0, "Jack":0, "Sharfin":0, "Connor":0};
  Match.find()
    .populate('stats_instances')
    .exec(function(err, results) {
      if (err) {return next(err);}
      for(var i = 0; i < results.length; i++){
        var current_map = results[i].map;
        for(var j = 0; j < results[i].stats_instances.length; j++){
          var current_kills = results[i].stats_instances[j].kills;
          if(maxes[current_map][0] < current_kills){
            maxes[current_map][0] = current_kills;
            maxes[current_map][1] = results[i].stats_instances[j].user;
          } else if (maxes[current_map][0] == current_kills) {
            maxes[current_map][1] += ", " + results[i].stats_instances[j].user;
          }
        }
      }
      max_double = -1;
      max_double_player = "";
      for(var i = 0; i < results.length; i++) {
        for(var j = 0; j < results[i].stats_instances.length; j++){
          instance = results[i].stats_instances[j];
          if(instance.reverse_double) {
            reverse_double[instance.user] += 1
          }
          if(reverse_double[instance.user] > max_double) {
            max_double = reverse_double[instance.user];
            max_double_player = instance.user;
          }
        }
      }
      res.render('hall-of-fame', {title: 'Hall Of Fame', max: maxes, "reverse_player":max_double_player, "reverse_double": max_double});
  });
});

router.get('/hall-of-shame', function(req, res, next) {
  var maxes = {"Cache":[50,""], "Cobblestone":[50,""], "Dust II":[50,""], "Inferno":[50,""], "Mirage":[50,""], "Nuke":[50,""], "Overpass":[50,""], "Train":[50,""], "Vertigo":[50,""]};
  var double_0 = {"Tim":0 , "Ryan":0, "Collin":0, "Sean":0, "Jack":0, "Sharfin":0, "Connor":0};
    Match.find()
    .populate('stats_instances')
    .exec(function(err, results) {
      if (err) {return next(err);}
      for(var i = 0; i < results.length; i++){
        for(var j = 0; j < results[i].stats_instances.length; j++){
          var current_map = results[i].map;
          var current_kills = results[i].stats_instances[j].kills;
          if(maxes[current_map][0] > current_kills){
            maxes[current_map][0] = current_kills;
            maxes[current_map][1] = results[i].stats_instances[j].user;
          } else if (maxes[current_map][0] == current_kills) {
            maxes[current_map][1] += ", " + results[i].stats_instances[j].user;
          }
        }
      }
      max_double = -1;
      max_double_player = "";
      for(var i = 0; i < results.length; i++) {
        for(var j = 0; j < results[i].stats_instances.length; j++){
          instance = results[i].stats_instances[j];
          if(instance.double_0){
            double_0[instance.user] += 1;
          }
          if(double_0[instance.user] > max_double){
            max_double = double_0[instance.user];
            max_double_player = instance.user;
          }
        }
      }
      res.render('hall-of-shame', {title: 'Hall Of Fame', max: maxes, "double_0": max_double, "double_player": max_double_player});
  });
});

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
