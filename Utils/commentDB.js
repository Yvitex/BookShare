const mongoose = require("mongoose");

function initMessageDb() {
    let CommentSchema = mongoose.Schema({
        user: String, 
        message: String,
        time: Date,
    })

    const Comment = mongoose.model("Comment", CommentSchema);
    return Comment;
}

module.exports = {
    initMessageDb,
}