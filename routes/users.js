var express = require('express');
var router = express.Router();
var Match = require('../models/match');
var StatsInstance = require('../models/statsinstance')
var User = require('../models/user');
var async = require('async');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:id', function(req, res) {
  //query = req.query;
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
  var assisters = {"Tim":[0,0], "Ryan":[0,0], "Collin":[0,0],"Cal":[0,0], "Sean":[0,0], "Josh":[0,0], "Sharfin":[0,0], "Yip":[0,0], "Cole":[0,0], "Jack":[0,0], "Connor":[0,0], "Gil":[0,0], "Tim-Smurf":[0,0]};
  var assisted = {"Tim":[0,0], "Ryan":[0,0], "Collin":[0,0],"Cal":[0,0], "Sean":[0,0], "Josh":[0,0], "Sharfin":[0,0], "Yip":[0,0], "Cole":[0,0], "Jack":[0,0], "Connor":[0,0], "Gil":[0,0], "Tim-Smurf":[0,0]};
  Match.find({'players': req.params.id, 'map': {$in: maps_filter}, 'result': {$in: result_filter},
              'date': {$gte: start_date, $lte: end_date}})
    .sort([['date', 'descending']])
    .populate('stats_instances')
    .exec(function (err, list_stats) {
      if (err) {return next(err);}
      
      for(var i = 0; i < list_stats.length; i++){
        var match = list_stats[i];
        var result = match.score[0] != match.score[1] ? (match.score[0] > match.score[1] ? 'win' : 'loss') : 'draw';
      }

      var averages = {'rating': 0, 'rating_t': 0, 'rating_ct': 0, 'adr':0, 'adr_t':0, 'adr_ct':0, 'kdd':0, 'kpr':0, 'kpr_t':0, 'kpr_ct':0, 'trades':0, 'trade_deaths':0, 'hs':0, 'kills':0, 'assists':0, 'deaths':0, 'clutches':0, 'fiveK':0};
      var maps = {'Cache':0, 'Cobblestone':0, 'Train':0, 'Mirage':0, 'Nuke':0, 'Overpass':0, 'Vertigo':0, 'Inferno':0, 'Dust II':0};
      var aces = 0;
      var k_40 = 0;
      var k_30 = 0;
      var sub_10 = 0;
      var wins = 0;
      var losses = 0;
      var ties = 0;
      for(var i = 0; i < list_stats.length; i++) {
        if (list_stats[i].score[0] > list_stats[i].score[1]) {
          wins += 1;
        } else if (list_stats[i].score[0] < list_stats[i].score[1]) {
          losses += 1;
        } else {
          ties += 1;
        }
        var player_index = list_stats[i].players.indexOf(req.params.id);
        averages['rating'] += list_stats[i].stats_instances[player_index].rating;
        averages['rating_t'] += list_stats[i].stats_instances[player_index].rating_t;
        averages['rating_ct'] += list_stats[i].stats_instances[player_index].rating_ct;
        averages['adr'] += list_stats[i].stats_instances[player_index].adr;
        averages['adr_t'] += list_stats[i].stats_instances[player_index].adr_t;
        averages['adr_ct'] += list_stats[i].stats_instances[player_index].adr_ct;
        averages['kdd'] += list_stats[i].stats_instances[player_index].kdd;
        averages['kpr'] += list_stats[i].stats_instances[player_index].kpr;
        averages['kpr_t'] += list_stats[i].stats_instances[player_index].kpr_t;
        averages['kpr_ct'] += list_stats[i].stats_instances[player_index].kpr_ct;
        averages['trades'] += list_stats[i].stats_instances[player_index].trade_kills;
        averages['trade_deaths'] += list_stats[i].stats_instances[player_index].trade_deaths;
        averages['hs'] += list_stats[i].stats_instances[player_index].hs;
        averages['kills'] += list_stats[i].stats_instances[player_index].kills;
        averages['assists'] += list_stats[i].stats_instances[player_index].assists;
        averages['deaths'] += list_stats[i].stats_instances[player_index].deaths;
        averages['clutches'] += list_stats[i].stats_instances[player_index].clutches;
        averages['fiveK'] += list_stats[i].stats_instances[player_index].fiveK;
        aces += list_stats[i].stats_instances[player_index].fiveK;
        list_stats[i].stats_instances[player_index].assisters.forEach(function(value, key) {
          if(list_stats[i].players.includes(key)) {
            assisters[key][0] += value;
            assisters[key][1] += 1;
          }
        });
        list_stats[i].stats_instances[player_index].assisted.forEach(function(value, key) {
          //console.log(value +', '+key);
          if(list_stats[i].players.includes(key)) {
            assisted[key][0] += value;
            assisted[key][1] += 1;
          }
        });
        maps[list_stats[i].map] += 1;
        if(list_stats[i].stats_instances[player_index].kills >= 40) {
          k_40 += 1;
        } else if(list_stats[i].stats_instances[player_index].kills >= 30) {
          k_30 += 1;
        } else if(list_stats[i].stats_instances[player_index].kills < 10) {
          sub_10 += 1;
        }
      }

      var variations = {'rating': 0, 'rating_t': 0, 'rating_ct': 0, 'adr':0, 'adr_t':0, 'adr_ct':0, 'kdd':0, 'kpr':0, 'kpr_t':0, 'kpr_ct':0, 'trades':0, 'trade_deaths':0, 'hs':0, 'kills':0, 'assists':0, 'deaths':0, 'clutches':0, 'fiveK':0};
      for(var i = 0; i < list_stats.length; i++) {
        var player_index = list_stats[i].players.indexOf(req.params.id);
        variations['rating'] += (list_stats[i].stats_instances[player_index].rating-(averages['rating']/list_stats.length)) ** 2;
        variations['rating_t'] += (list_stats[i].stats_instances[player_index].rating_t-(averages['rating_t']/list_stats.length)) ** 2;
        variations['rating_ct'] += (list_stats[i].stats_instances[player_index].rating_ct-(averages['rating_ct']/list_stats.length)) ** 2;
        variations['adr'] += (list_stats[i].stats_instances[player_index].adr-(averages['adr']/list_stats.length)) ** 2;
        variations['adr_t'] += (list_stats[i].stats_instances[player_index].adr_t-(averages['adr_t']/list_stats.length)) ** 2;
        variations['adr_ct'] += (list_stats[i].stats_instances[player_index].adr_ct-(averages['adr_ct']/list_stats.length)) ** 2;
        variations['kdd'] += (list_stats[i].stats_instances[player_index].kdd-(averages['kdd']/list_stats.length)) ** 2;
        variations['kpr'] += (list_stats[i].stats_instances[player_index].kpr-(averages['kpr']/list_stats.length)) ** 2;
        variations['kpr_t'] += (list_stats[i].stats_instances[player_index].kpr_t-(averages['kpr_t']/list_stats.length)) ** 2;
        variations['kpr_ct'] += (list_stats[i].stats_instances[player_index].kpr_ct-(averages['kpr_ct']/list_stats.length)) ** 2;
        variations['trades'] += (list_stats[i].stats_instances[player_index].trade_kills-(averages['trades']/list_stats.length)) ** 2;
        variations['trade_deaths'] += (list_stats[i].stats_instances[player_index].trade_deaths-(averages['trade_deaths']/list_stats.length)) ** 2;
        variations['hs'] += (list_stats[i].stats_instances[player_index].hs-(averages['hs']/list_stats.length)) ** 2;
        variations['kills'] += (list_stats[i].stats_instances[player_index].kills-(averages['kills']/list_stats.length)) ** 2;
        variations['assists'] += (list_stats[i].stats_instances[player_index].assists-(averages['assists']/list_stats.length)) ** 2;
        variations['deaths'] += (list_stats[i].stats_instances[player_index].deaths-(averages['deaths']/list_stats.length)) ** 2;
        variations['clutches'] += (list_stats[i].stats_instances[player_index].clutches-(averages['clutches']/list_stats.length)) ** 2;
        variations['fiveK'] += (list_stats[i].stats_instances[player_index].fiveK-(averages['fiveK']/list_stats.length)) ** 2;
      }

      for(stat in variations) {
        variations[stat] = Math.sqrt(variations[stat]/(list_stats.length-1));
      }

      var max_assister = "";
      var max = -1;
      for (assister in assisters){
        assisters[assister][0] /= assisters[assister][1];
        if(assisters[assister][0] > max) {
          max = assisters[assister][0];
          max_assister = assister;
        }
      }
      var max_assisted = "";
      max = -1;
      for (assister in assisted){
        assisted[assister][0] /= assisted[assister][1];
        if(assisted[assister][0] > max) {
          max = assisted[assister][0];
          max_assisted = assister;
        }
      }

      averages['rating']   /= list_stats.length;
      averages['rating_t']   /= list_stats.length;
      averages['rating_ct']   /= list_stats.length;
      averages['adr']      /= list_stats.length;
      averages['adr_t']      /= list_stats.length;
      averages['adr_ct']      /= list_stats.length;
      averages['kdd']      /= list_stats.length;
      averages['kpr']      /= list_stats.length;
      averages['kpr_t']    /= list_stats.length;
      averages['kpr_ct']   /= list_stats.length;
      averages['trades']   /= list_stats.length;
      averages['trade_deaths']   /= list_stats.length;
      averages['hs']       /= list_stats.length;
      averages['kills']    /= list_stats.length;
      averages['assists']  /= list_stats.length;
      averages['deaths']   /= list_stats.length;
      averages['clutches'] /= list_stats.length;
      averages['fiveK'] /= list_stats.length;
      res.render('user', {title: ' Stats', user: req.params.id, stats_list: list_stats, averages: averages, variations: variations, maps: [maps['Cache'], maps['Cobblestone'], maps['Train'], maps['Nuke'], maps['Mirage'], maps['Vertigo'], maps['Overpass'], maps['Dust II'], maps['Inferno']], "assister": max_assister, "assists_num": assisters[max_assister][0].toFixed(2), "assisted": max_assisted, "assisted_num": assisted[max_assisted][0].toFixed(2), "k_30": k_30, "k_40": k_40, "sub_10": sub_10, win_per: (wins/list_stats.length).toFixed(3)*100, loss_per: (losses/list_stats.length).toFixed(3)*100, tie_per: (ties/list_stats.length).toFixed(3)*100, aces:aces, start_date: start_date} );
  });
});

module.exports = router;
