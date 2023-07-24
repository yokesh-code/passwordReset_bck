const mongoose =  require('mongoose');

const UserSchema = new mongoose.Schema({
    email: String,
    password:String,
    resetPasswordToken:String,
    resetPasswordExpire:Date
});

const User = mongoose.model('User',UserSchema);

module.exports = User;