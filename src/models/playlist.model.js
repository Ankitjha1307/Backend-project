import mongoose, {Schema} from "mongoose";
// import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const playlistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ], // as it is an array of videos
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
})

// playlistSchema.plugin(mongooseAggregatePaginate)  //can only use before export

export const Playlist= mongoose.model("Playlist", playlistSchema)