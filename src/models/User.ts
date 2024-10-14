import mongoose, { Schema, Document} from "mongoose";

export interface IUser extends Document {
  email: string
  password: string
  name: string
  confirmed: boolean
  role: string;  // Nuevo campo de rol
}

const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['admin', 'viewer'],  // Los posibles roles
    default: 'viewer',  // Por defecto, un usuario tiene rol de "viewer"
  },

})

const User = mongoose.model<IUser>('User', userSchema)
export default User

