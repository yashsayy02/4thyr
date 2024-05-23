const mongoose = require('mongoose');

const connectDB = async() => {
    try{
        const connectToDB = await mongoose.connect(
            "mongodb+srv://yashsayy:poojayash02@cluster0.iyggiln.mongodb.net/clgProject?retryWrites=true&w=majority&appName=Cluster0/",
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        );

        console.log("mongodb connected");
    }catch(err){
        console.log(`Error: ${err.message}`);
        process.exit();
    }
}

module.exports = connectDB;