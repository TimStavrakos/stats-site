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
  StatsInstance.find({'user': req.params.id})
    .populate('match')
    .sort([['match.date', 'ascending']])
    .exec(function (err, list_stats) {
      if (err) {return next(err);}
      list_stats.sort(function(a,b) {
        return new Date(b.match.date) - new Date(a.match.date);
      })

      if(maps_filter == undefined){
        maps_filter = ["Cache", "Cobblestone", "Dust II", "Inferno", "Mirage", "Nuke", "Overpass", "Train", "Vertigo"];
      }
      if(result_filter == undefined){
        result_filter = ['win', 'loss', 'draw'];
      }
      for(var i = 0; i < list_stats.length; i++){
        var match = list_stats[i].match;
        var result = match.score[0] != match.score[1] ? (match.score[0] > match.score[1] ? 'win' : 'loss') : 'draw';
        if(!maps_filter.includes(match.map) || new Date(match.date) > new Date(end_date) || new Date(match.date) < new Date(start_date) || !result_filter.includes(result)){
          list_stats.splice(i, 1);
          i--;
        }
      }

      var averages = {'rating': 0, 'adr':0, 'kdd':0, 'kpr':0, 'kpr_t':0, 'kpr_ct':0, 'trades':0, 'hs':0, 'kills':0, 'assists':0, 'deaths':0, 'clutches':0};
      var maps = {'Cache':0, 'Cobblestone':0, 'Train':0, 'Mirage':0, 'Nuke':0, 'Overpass':0, 'Vertigo':0, 'Inferno':0, 'Dust II':0};
      for(var i = 0; i < list_stats.length; i++) {
        averages['rating'] += list_stats[i].rating;
        averages['adr'] += list_stats[i].adr;
        averages['kdd'] += list_stats[i].kdd;
        averages['kpr'] += list_stats[i].kpr;
        averages['kpr_t'] += list_stats[i].kpr_t;
        averages['kpr_ct'] += list_stats[i].kpr_ct;
        averages['trades'] += list_stats[i].trades;
        averages['hs'] += list_stats[i].hs;
        averages['kills'] += list_stats[i].kills;
        averages['assists'] += list_stats[i].assists;
        averages['deaths'] += list_stats[i].deaths;
        averages['clutches'] += list_stats[i].clutches;
        maps[list_stats[i].match.map] += 1;
      }

      averages['rating'] /= list_stats.length;
      averages['adr'] /= list_stats.length;
      averages['kdd'] /= list_stats.length;
      averages['kpr'] /= list_stats.length;
      averages['kpr_t'] /= list_stats.length;
      averages['kpr_ct'] /= list_stats.length;
      averages['trades'] /= list_stats.length;
      averages['hs'] /= list_stats.length;
      averages['kills'] /= list_stats.length;
      averages['assists'] /= list_stats.length;
      averages['deaths'] /= list_stats.length;
      averages['clutches'] /= list_stats.length;
      res.render('user', {title: ' Stats', user: req.params.id, stats_list: list_stats, averages: averages, maps: [maps['Cache'], maps['Cobblestone'], maps['Train'], maps['Nuke'], maps['Mirage'], maps['Vertigo'], maps['Overpass'], maps['Dust II'], maps['Inferno']]});
  });
});

module.exports = router;
