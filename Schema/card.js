const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  deckId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'deck', 
    required: true 
  },
  createDate: { 
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
  },
  cardName: { 
    type: String, 
    required: true 
  },
  hint: { 
    type: String, 
    required: true 
  },
  ans: { 
    type: String, 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true 
  }
});

module.exports = mongoose.model('cards', cardSchema);
