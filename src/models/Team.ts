import mongoose, {Schema, Document, Types, PopulatedDoc} from "mongoose";
import { IPlayer } from "./Player";

export interface ITeam extends Document  {
  nameTeam: string
  nameCoach: string
  branchTeam: string
  tournament: Types.ObjectId
  players: PopulatedDoc<IPlayer & Document>[]
}

export const TeamSchema: Schema = new Schema({
  nameTeam: { type: String, required: true, trim: true },
  branchTeam: { type: String, required: true, trim: true },
  nameCoach: { type: String, required: true, trim: true },
  tournament: {
    type: Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  players: [{ type: Types.ObjectId, ref: 'Player' }]
}, {timestamps: true}) 

// Crear un índice compuesto para que 'nameTeam' sea único solo dentro del mismo 'tournament'
TeamSchema.index({ nameTeam: 1, tournament: 1, branchTeam: 1 }, { unique: true });

const Team = mongoose.model<ITeam>('Team', TeamSchema)
export default Team