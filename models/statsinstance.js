var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var StatsInstanceSchema = new Schema(
  {
    user: {type: String, required: true},
    match: {type: Schema.Types.ObjectId, ref: 'Match'},
    rating: {type: Number, required: true},
    trades: {type: Number, required: true},
    adr: {type: Number, required: true},
    hs: {type: Number, required: true},
    kpr: {type: Number, required: true},
    kills: {type: Number, required: true},
    assists: {type: Number, required: true},
    deaths: {type: Number, required: true},
    kpr_t: {type: Number, required: true},
    kpr_ct: {type: Number, required: true},
    fiveK: {type: Number},
    fourK: {type: Number},
    threeK: {type: Number},
    twoK: {type: Number},
    oneK: {type: Number},
    clutch1v1: {type: Number},
    clutch1v2: {type: Number},
    clutch1v3: {type: Number},
    clutch1v4: {type: Number},
    clutch1v5: {type: Number}
  }
);

StatsInstanceSchema
.virtual('kdd')
.get(function () {
  return (this.kills - this.deaths);
});

StatsInstanceSchema
.virtual('kdr')
.get(function () {
  return (this.kills/this.deaths);
});

StatsInstanceSchema
.virtual('kda')
.get(function () {
  return ((this.kills + .5*this.assists)/this.deaths);
});

StatsInstanceSchema
.virtual('clutches')
.get(function () {
  return (this.clutch1v1 + this.clutch1v2 + this.clutch1v3 + this.clutch1v4 + this.clutch1v5);
})

module.exports = mongoose.model('StatsInstance', StatsInstanceSchema);
