const express = require("express");
const AWS = require("aws-sdk");
const fs = require("fs");
const cors = require("cors");

const s3 = new AWS.S3({
    accessKeyId: "AKIA2UC3DUARPIFEPNHT",
    secretAccessKey: "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",
});
const appRouter = require("./routes/appRouter");
const connectDB = require("./db/connect_db");
const User = require("./db/userModel");

const app = express();
connectDB();

const directoryPath = "./uploads/uploadToDB";

app.use(cors());
app.use(express.json());
app.use("/api", appRouter);

app.listen(8080, () => {
    console.log(`server listening on port 8080...`);
});

///////////////////////////////////////////////////////TRACK DIRECTORY

fs.watch(directoryPath, async (eventType, filename) => {
    if (eventType === "rename" && filename) {
        const filePath = `${directoryPath}/${filename}`;
        console.log(
            `File ${filename} was added to the directory or removed from the directory.`
        );

        const uid = filename.split(".")[0];
        const userExists = await User.findOne({ uid });

        if (userExists) {
            uploadFileToS3(filePath);
        } else {
            console.log(
                `User with UID ${uid} does not exist. Deleting the file.`
            );
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    }
});


async function uploadFileToS3(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const params = {
        Bucket: "ather",
        Key: filePath.split("/").pop(), // Use the file name as the key
        Body: fileStream,
        Overwrite: true
    };

    //check if file already exists or not

    try {
        const data = await s3.upload(params).promise();
        console.log("File uploaded successfully:", data.Location);
        fs.unlink(filePath, (err) => {
            console.log(err);
        })
    } catch (err) {
        console.error("Error uploading file:", err);
    }
}
