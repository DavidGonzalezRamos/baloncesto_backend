import mongoose, {Schema, Document, Types} from "mongoose";

export interface ITeam extends Document  {
  nameTeam: string
  nameCoach: string
  tournament: Types.ObjectId
}

export const TeamSchema: Schema = new Schema({
  nameTeam: { type: String, required: true, trim: true, unique: true },
  nameCoach: { type: String, required: true, trim: true },
  tournament: {
    type: Types.ObjectId,
    ref: 'Tournament',
  }
}, {timestamps: true}) 

const Team = mongoose.model<ITeam>('Team', TeamSchema)
export default Team