const AWS = require("aws-sdk");
const fs = require("fs");
const s3 = new AWS.S3({
    accessKeyId: "AKIA2UC3DUARPIFEPNHT",
    secretAccessKey: "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",
});

const uploadFile = (fileName, bucketName) => {
    const fileContent = fs.readFileSync(fileName);

    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileContent,
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error("Error uploading file:", err);
        } else {
            console.log(`File uploaded successfully. ${data.Location}`);
        }
    });
};

// Usage
// uploadFile("rootkey.csv", "ather");

let retrievedFile = fs.createWriteStream("./uploads/output.csv");
let params = {
    Bucket: "ather",
    Key: "rootkey.csv"
}
s3.getObject(params).createReadStream().pipe(retrievedFile);



// Directory to watch for changes
const directoryPath = "./uploads";

// Bucket name to upload files to
const bucketName = "ather";

// Function to upload a file to S3
async function uploadFileToS3(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const params = {
        Bucket: bucketName,
        Key: filePath.split("/").pop(), // Use the file name as the key
        Body: fileStream,
    };

    try {
        const data = await s3.upload(params).promise();
        console.log("File uploaded successfully:", data.Location);
    } catch (err) {
        console.error("Error uploading file:", err);
    }
}

// Watch the directory for file changes
fs.watch(directoryPath, (eventType, filename) => {
    if (eventType === "rename" && filename) {
        const filePath = `${directoryPath}/${filename}`;
        console.log(`File ${filename} was added to the directory.`);

        // Upload the file to S3
        uploadFileToS3(filePath);
    }
});

console.log(`Watching directory ${directoryPath} for file changes...`);
