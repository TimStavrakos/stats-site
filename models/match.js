var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var MatchSchema = new Schema(
  {
    map: {type: String, required: true, max: 15},
    date: {type: Date, requied: true},
    score: [Number],
    players: [{type: String, required: true}]
  }
);

MatchSchema
.virtual('formatted_date')
.get(function () {
  return moment(this.date).format('M/D/YYYY');
})

module.exports = mongoose.model('Match', MatchSchema);
