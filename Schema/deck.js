const mongoose=require("mongoose");
const deckSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'users', 
        required: true 
    },
    deckName: { 
        type: String, 
        required: true 
    },
    cardNo: { 
        type: Number, 
        default: 0 
    },
    createdDate: { 
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
const deck_collection = mongoose.model('decks',deckSchema)
module.exports = deck_collection;