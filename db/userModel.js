const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        name: { type: "String", required: true },
        gender: { type: "String" },
        aadhar: { type: "String", required: true },
        isAdmin: {
            type: "String",
        },
        phoneNo: { type: "String" },
        uid: { type: "String" },
    },
    { timestaps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
