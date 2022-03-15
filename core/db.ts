import mongoose from 'mongoose'

const connectMongoDB = () => {
  const DB =
    process.env?.DATABASE?.replace(
      '<password>',
      process.env.DATABASE_PASSWORD || ''
    ) || ''
  mongoose
    .connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('DB is connected')
    })
    .catch((err) => console.log(err))
}

export default connectMongoDB
