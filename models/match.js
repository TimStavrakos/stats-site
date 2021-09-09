var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;
var StatsInstance = require('./statsinstance').schema;

var MatchSchema = new Schema(
  {
    map: {type: String, required: true, max: 15},
    date: {type: Date, requied: true},
    score: [Number],
    result: String,
    players: [{type: String, required: true}],
    wins: [Number],
    losses: [Number],
    buys: [String],
    wins_buy: {
      'Pistol round': Number,
      'Anti-Eco': Number,
      'Semi-Eco': Number,
      'Eco': Number,
      'Force buy': Number,
      'Normal': Number
    },
    loss_buy: {
      'Pistol round': Number,
      'Anti-Eco': Number,
      'Semi-Eco': Number,
      'Eco': Number,
      'Force buy': Number,
      'Normal': Number
    },
    stats_instances: [{
      type: Schema.Types.ObjectId,
      ref: 'StatsInstance'
    }]
  }
);

MatchSchema
.virtual('formatted_date')
.get(function () {
  return moment(this.date).format('M/D/YYYY');
})

MatchSchema
.virtual('formatted_month')
.get(function () {
  return moment(this.date).format('M/YYYY');
})

MatchSchema
.virtual('results')
.get(function () {
  if(this.score[0] > this.score[1]) {
    return "win";
  } else if(this.score[0] == this.score[1]){
    return "tie";
  } else {
    return "loss";
  }
})

module.exports = mongoose.model('Match', MatchSchema);
