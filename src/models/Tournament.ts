import mongoose, {Schema, Document, PopulatedDoc, Types} from "mongoose";
import { ITeam } from "./Team";
import { IUser } from "./User";

export interface ITournament extends Document  {
  dateStart: Date
  dateEnd: Date
  tournamentName: string
  teams: PopulatedDoc<ITeam & Document>[]
  admin: PopulatedDoc<IUser & Document>
}

const TournamentSchema: Schema = new Schema({
  dateStart: { type: Date, required: true, trim: true },
  dateEnd: { type: Date, required: true, trim: true  },
  tournamentName: { type: String, required: true, trim: true, unique: true },
  teams: [{ type: Types.ObjectId, ref: 'Team' }],
  admin: { type: Types.ObjectId, ref: 'User' }
}, {timestamps: true})

const Tournament = mongoose.model<ITournament>('Tournament', TournamentSchema)
export default Tournament