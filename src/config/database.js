import mongoose from "mongoose";


const connectToDB = async () => {
    const connectToDB = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected sucessfully`)
};

export default connectToDB;

