import {Schema, Document, model} from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export type UserType = {
    username:string,
    email:string,
    password: string,
    passwordConfirm:string,
    confirmToken:string,
    passwordChangedAt: Date,
    passwordResetToken: string,
    passwordResetExpires: Date,
    active: boolean,
    confirmed: boolean
}

export type UserModalDocumentType = UserType & Document & {
    correctPassword: (candidatePassword: string, userPassword:string) => Promise<boolean>,
    changePasswordAfter: (JWTTimestamp: number) => boolean
    createConfirmToken: () => string
}


const userSchema = new Schema<UserModalDocumentType>({
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
  confirmed: {
      type:Boolean,
      default: false,
      select: false

  },
  confirmToken: {
    type: String,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };

  userSchema.methods.changePasswordAfter = function (
    JWTTimestamp:number
  ) {

    if (this.passwordChangedAt) {
       
        const changedTimestamp = this.passwordChangedAt.getTime() / 1000

        return changedTimestamp < JWTTimestamp;  
    }

    return false
  };
  userSchema.methods.createConfirmToken = function() {
    const token = crypto.randomBytes(32).toString('hex');
    this.confirmToken = crypto.createHash("sha256").update(token).digest("hex")
  
    return token
  }

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
