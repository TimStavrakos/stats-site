var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var StatsInstanceSchema = new Schema(
  {
    user: {type: String, required: true},
    match: {type: Schema.Types.ObjectId, ref: 'Match'},
    rating: {type: Number, required: true},
    rating_t: {type: Number, required: true},
    rating_ct: {type: Number, required: true},
    trade_kills: {type: Number, required: true},
    trade_deaths: {type: Number, required: true},
    adr: {type: Number, required: true},
    adr_t: {type: Number, required: true},
    adr_ct: {type: Number, required: true},
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
    clutch1v5: {type: Number},
    double_0: {type: Boolean},
    reverse_double: {type: Boolean},
    assisters: {
      type: Map,
      of: Number
    },
    assisted: {
      type: Map,
      of: Number
    }
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
  if(this.deaths == 0) {
    return (this.kills);
  }
  return (this.kills/this.deaths);
});

StatsInstanceSchema
.virtual('kda')
.get(function () {
  if (this.deaths == 0){
    return ((this.kills + .5*this.assists)/1);
  }
  return ((this.kills + .5*this.assists)/this.deaths);
});

StatsInstanceSchema
.virtual('clutches')
.get(function () {
  return (this.clutch1v1 + this.clutch1v2 + this.clutch1v3 + this.clutch1v4 + this.clutch1v5);
})

module.exports = mongoose.model('StatsInstance', StatsInstanceSchema);
