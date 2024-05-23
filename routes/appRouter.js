const express = require("express");
const fs = require("fs");
const router = express.Router();
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
    accessKeyId: "AKIA2UC3DUARPIFEPNHT",
    secretAccessKey: "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",
});

router.post("/registerUser", registerUser);
router.post("/loginUser", loginUser);
router.post("/getFile", getFile);

router.get("/listAllFiles", listAllFiles);

module.exports = router;

////////////////////////////////////////////////////////////CONTROLLERS
const User = require("../db/userModel");

async function registerUser(req, res) {
    const { name, gender, phoneNo, aadhar, uid } = req.body;

    //verify if user already exist or not
    const userExists = await User.findOne({ aadhar });
    if (userExists) {
        res.status(400).send("user already exists");
        console.log("User already exists");
        return;
    }

    //register user
    const user = await User.create({
        name,
        gender,
        phoneNo,
        aadhar,
        uid,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            phoneNo: user.phoneNo,
            aadhar: user.aadhar,
            uid: user.uid,
        });
    } else {
        res.status(400);
        console.log("Cannot create USER");
    }
}

async function loginUser(req, res) {
    const { uid } = req.body;

    //verify if user exists
    const userExists = await User.findOne({ uid });
    if (userExists) {
        res.status(201).json({
            _id: userExists._id,
            name: userExists.name,
            phoneNo: userExists.phoneNo,
            aadhar: userExists.aadhar,
            uid: userExists.uid,
        });
    } else {
        res.status(400).send("user not found, please register");
        console.log("User not found");
    }
}

async function getFile(req, res) {
    const { uid } = req.body;

    try {
        const fileName = "123456.csv";
        const params = {
            Bucket: "ather",
            Key: `${uid}.csv`,
        };

        // Check if the file exists in S3
        const metadata = await s3.headObject(params).promise();

        // Retrieve the file from S3
        const fileData = await s3.getObject(params).promise();

        // Save the file locally
        const filePath = "./uploads/output.csv";
        const fileStream = fs.createWriteStream(filePath);
        fileStream.write(fileData.Body);
        fileStream.end();

        // Set headers for downloading the file
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=data.csv");

        res.send(fileData.Body);
    } catch (err) {
        if (err.code === "NotFound") {
            console.log("File does not exist in the bucket.");
            res.status(400).send("No Report Exists");
        } else {
            console.error("Error retrieving file:", err);
            res.status(500).send("Error retrieving file");
        }
    }
}

async function listAllFiles(req, res){
    let files = [];
    try{
        const params = {
            Bucket: "ather"
        }

        const data = await s3.listObjectsV2(params).promise();
        data.Contents.forEach(file => {
            files.push(file.Key)
        })

        res.status(201).json({
            files
        })
    }catch(err){
        console.log(err)
        res.status(400);
    }
}