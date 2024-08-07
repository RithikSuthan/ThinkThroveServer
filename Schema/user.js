const mongoose=require("mongoose");

const userSchema = new mongoose.Schema({
uname:{
    type:String,
    trim:true,
    required:true
},
email:{
    type:String,
    trim:true,
    unique:true,
    required: true
},
password:{
    type:String,
    required:true
},
cardNo:{
    type:Number,
    required:true,
},
deckNo:{
    type:Number,
    required:true,
},
loginTime: {
    type: Date,
    default: Date.now
},
updatedTime: {
    type: Date,
    default: Date.now
},
deleteStatus: {
    type: Boolean,
    default: false
},
activeStatus: {
    type: Boolean,
    default: true
}

})
const users_collection = mongoose.model('users',userSchema)
module.exports = users_collection;
