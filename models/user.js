var mongoose = require('mongoose');

var UsersSchema = mongoose.Schema({
    fname: String,
    lname: String,
    sex: String,
    address: String,
    aadhaar: String,
    city: String,
    state: String,
    phone: String,
    image: String,
    pdf: String
});

module.exports = mongoose.model("Users", UsersSchema);
