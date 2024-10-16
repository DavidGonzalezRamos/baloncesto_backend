import mongoose, {Schema, Document, Types} from "mongoose";

export interface IPLayer extends Document  {
  name: string
  lastName: string
  number: number
  curp: string
  position: string
  team: Types.ObjectId
}

export const PlayerSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true},
  lastName: { type: String, required: true, trim: true },
  number: { type: Number, required: true, trim: true },
  curp: { type: String, required: true, trim: true, unique: true },
  position: { type: String, required: true, trim: true },
  team: {
    type: Types.ObjectId,
    ref: 'Team',
  }
}, {timestamps: true})

const Player = mongoose.model<IPLayer>('Player', PlayerSchema)
export default Player
