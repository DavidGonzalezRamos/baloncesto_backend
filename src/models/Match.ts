import mongoose, {Schema, Document, Types} from "mongoose";

const matchStatus = {
  IN_PROGRESS: 'inProgress',
  FINISHED: 'finished'
} as const 

export type MatchStatus = typeof matchStatus[keyof typeof matchStatus]

export interface IMatch extends Document  {
  teamLocal: string
  teamVisitor: string
  scoreLocal: Number
  scoreVisitor: Number
  teamWinner: string
  date: Date
  place: string
  tournament: Types.ObjectId
  status: MatchStatus
} 

export const MatchSchema: Schema = new Schema({
  teamLocal: { type: String, required: true, trim: true },
  teamVisitor: { type: String, required: true, trim: true },
  scoreLocal: { type: Number, required: true, trim: true },
  scoreVisitor: { type: Number, required: true, trim: true },
  teamWinner: { type: String, required: true, trim: true },
  date: { type: Date, required: true, trim: true },
  place: { type: String, required: true, trim: true },
  tournament: { type: Types.ObjectId,ref: 'Tournament'
  },
  status: { type: String, enum: Object.values(matchStatus), default: matchStatus.IN_PROGRESS }
}, {timestamps: true})

const Match = mongoose.model<IMatch>('Match', MatchSchema)
export default Match