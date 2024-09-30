import mongoose, {Schema, Document} from "mongoose";

export type PlayerType = Document & {
  playerName: string
  team: string
  number: number
  position: string
  dateTime: Date
}

const PlayerSchema: Schema = new Schema({
  playerName: {
    type: String, 
    required: true,
    trim: true
  },
  team: {
    type: String, 
    required: true,
    trim: true
  },
  number: 
  {
    type: Number, 
    required: true,
    trim: true
  },
  position: {
    type: String, 
    required: true,
    trim: true
  },
  dateTime: {
    type: Date, 
    default: Date.now,
    trim: true
  }
})

const Player = mongoose.model<PlayerType>('Player', PlayerSchema)
export default Player