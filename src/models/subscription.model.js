import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscription: {
      type: Schema.Types.ObjectId,//The user who is subscribing
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,//The user whom the other user has subscribed to means the channel 
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription=mongoose.model("Subscription",subscriptionSchema)