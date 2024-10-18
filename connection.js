const mongoose = require("mongoose");
require("dotenv").config();
const connectionDb = async () => {
    try {
        await mongoose.connect("mongodb+srv://Rithik_Suthan_S:8098329762@cluster0.nwyrzl2.mongodb.net/ThinkThrove");
        console.log("Database connected");
    }
    catch (error)
    {
        console.log("Error in Db connection", error);
        process.exit(1);
    }
}
module.exports = connectionDb;