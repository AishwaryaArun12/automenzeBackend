const { default: mongoose } = require("mongoose");

const sparePartSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    validity : {type: Number,required : true},
    image : { type: String},
    category : { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }
  }, { timestamps: true });
  
  module.exports = mongoose.model('SparePart', sparePartSchema);