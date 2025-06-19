const mongoose = require('mongoose');

const comentSchema = new mongoose.Schema ({
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    

})

module.exports = mongoose.model('Comment', comentSchema);