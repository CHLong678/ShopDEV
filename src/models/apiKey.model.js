const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "Apikey";
const COLLECTION_NAME = "Apikeys";

var apiKeySchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      // default: function() {
      //   return crypto.randomBytes(64).toString('hex'); // Generate a random 40 characters hex string
      // }
    },
    status: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      required: true,
      enum: ["0000", "1111", "2222"],
    },
    // createdAt: {
    //   type: Date,
    //   default: Date.now(),
    //   expires: "30d", // This will be automatically deleted expired apiKeys after 30 days
    // },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, apiKeySchema);
