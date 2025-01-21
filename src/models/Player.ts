import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPlayer extends Document {
  name: string;
  lastName: string;
  numberIpn: number;
  number: number;
  curp: string;
  position: string;
  idCard: string; // Ruta del archivo credencial
  schedulePlayer: string; // Ruta del archivo horario
  photoPlayer: string; // Ruta del archivo fotografía
  examMed: string; // Ruta del archivo examen médico
  team: Types.ObjectId;
}

export const PlayerSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    numberIpn: { type: Number, required: true, trim: true },
    number: { type: Number, required: true, trim: true },
    curp: { type: String, required: true, trim: true, unique: true },
    position: { type: String, required: true, trim: true },
    idCard: {type: String, required: true, trim: true },
    schedulePlayer: { type: String, required: true, trim: true },
    photoPlayer: { type: String, required: true, trim: true },
    examMed: { type: String, required: true, trim: true },
    team: {
      type: Types.ObjectId,
      ref: "Team",
    },
  },
  { timestamps: true }
);

const Player = mongoose.model<IPlayer>("Player", PlayerSchema);
export default Player;
