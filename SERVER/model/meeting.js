const { default: mongoose, Schema } = require("mongoose");

const MeetingSchema = new Schema(
  {
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timezone: {
      type: String,
      required: true, 
      enum: Intl.supportedValuesOf("timeZone"), 
    },
    meetingId: {
      type: String,
      required: true,
      unique: true,
    },
    endedAt: {
      type: Date,
    },
    duration: {
      type: Number, 
    },
    audiences: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports.Meeting = mongoose.model("Meeting", MeetingSchema);
