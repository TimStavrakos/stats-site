var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var MatchSchema = new Schema(
  {
    map: {type: String, required: true, max: 15},
    date: {type: Date, requied: true},
    score: [Number],
    players: [{type: String, required: true}],
    wins: [Number],
    losses: [Number],
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
    }
  }
);

MatchSchema
.virtual('formatted_date')
.get(function () {
  return moment(this.date).format('M/D/YYYY');
})

module.exports = mongoose.model('Match', MatchSchema);
