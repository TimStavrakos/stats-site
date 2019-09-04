var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    steamID: {type: String, required: true},
    name: {type: String, required: true}
  }
);

UserSchema
.virtual('url')
.get(function () {
  return 'https://steamcommunity.com/profiles/' + this.steamID;
});

module.exports = mongoose.model('User', UserSchema);
