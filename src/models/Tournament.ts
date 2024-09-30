import mongoose, {Schema, Document} from "mongoose";

export type TournamentType = Document & {
  dateStart: Date
  dateEnd: Date
  tournamentName: string
}

const TournamentSchema: Schema = new Schema({
  dateStart: { type: Date, required: true, trim: true },
  dateEnd: { type: Date, required: true, trim: true  },
  tournamentName: { type: String, required: true, trim: true, unique: true }
})

const Tournament = mongoose.model<TournamentType>('Tournament', TournamentSchema)
export default Tournament