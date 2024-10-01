import mongoose, {Schema, Document, PopulatedDoc, Types} from "mongoose";
import { ITeam } from "./Team";

export interface ITournament extends Document  {
  dateStart: Date
  dateEnd: Date
  tournamentName: string
  teams: PopulatedDoc<ITeam & Document>[]
}

const TournamentSchema: Schema = new Schema({
  dateStart: { type: Date, required: true, trim: true },
  dateEnd: { type: Date, required: true, trim: true  },
  tournamentName: { type: String, required: true, trim: true, unique: true },
  teams: [{ type: Types.ObjectId, ref: 'Team' }]
}, {timestamps: true})

const Tournament = mongoose.model<ITournament>('Tournament', TournamentSchema)
export default Tournament