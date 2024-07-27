const { default: mongoose } = require("mongoose");

const sparePartSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    validity : {type: Number,required : true},
    image : { type: String}
  }, { timestamps: true });
  
  module.exports = mongoose.model('SparePart', sparePartSchema);