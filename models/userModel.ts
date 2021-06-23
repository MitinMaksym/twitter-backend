import {Schema, Document, model} from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'

export type UserType = {
    username:string,
    email:string,
    password: string,
    passwordConfirm:string,
    confirmHash:string
}

export type UserModalDocumentType = UserType & Document


const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: [true, "Username is required"],
    minLength: [4, "Username must contain at least 4 characters"],
    maxLength: [15, "Username must contain less than 15 characters"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
    validate: [validator.isEmail, "Email is invalid"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [4, "Password must contain at least 4 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "passwordConfirm is required"],
    validate: {
      validator: function (val: string) {
        return (this as unknown as UserType).password === val;
      },
      message: "Passwords are not the same",
    },
  },
  confirmHash: {
    type: String,
  },
});

userSchema.pre<UserModalDocumentType>('save',async function(next) {
     //Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
    
  // @ts-ignore
  this.passwordConfirm = undefined;
  next();
})

const userModal = model<UserModalDocumentType>('User', userSchema)

export default userModal
