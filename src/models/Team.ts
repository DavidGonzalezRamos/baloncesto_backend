import mongoose, {Schema, Document, Types, PopulatedDoc} from "mongoose";
import { IPLayer } from "./Player";

export interface ITeam extends Document  {
  nameTeam: string
  nameCoach: string
  branchTeam: string
  tournament: Types.ObjectId
  players: PopulatedDoc<IPLayer & Document>[]
}

export const TeamSchema: Schema = new Schema({
  nameTeam: { type: String, required: true, trim: true},
  branchTeam: { type: String, required: true, trim: true },
  nameCoach: { type: String, required: true, trim: true },
  tournament: {
    type: Types.ObjectId,
    ref: 'Tournament',
  },
  players: [{ type: Types.ObjectId, ref: 'Player' }]
}, {timestamps: true}) 

const Team = mongoose.model<ITeam>('Team', TeamSchema)
export default Team