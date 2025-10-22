import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // entity who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // entity being subscribed to
        ref: "User"
    }
}, {
    timestamps: true
})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)