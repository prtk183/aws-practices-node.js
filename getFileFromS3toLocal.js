const fs = require('fs')
const Path = require('path')
const Axios = require('axios')
const AWS = require('aws-sdk');

//your IAM user credentials
var credentials = {
	accessKeyId: "################",
	secretAccessKey: "#################################"
};
AWS.config.update({
	credentials: credentials,
	region: 'your-s3-region'
});

//path to the object you're looking for
var keyfile = "SelfRegistrationEmployees.pdf"
	var presignedGETURL;

console.log("just calling main --->", main()); //<----- invocation point code
/**
 * 1. generate pre signed url
 * 2. get data
 * 3. write to local
 */
async function main() {
	try {
		presignedGETURL = await generatePresignedUrl();
		let data = await downloadFile(presignedGETURL);
		let file = await writeFile(data);
		console.log("file..>", file)
		return "done";
	} catch (err) {

		console.log("err caught due to...>", err)
	}

}

/**
 * This function will call s3 to generate s3-presigned-url
 *
 */
async function generatePresignedUrl() {
	try {
		let bucektParams = {
			Bucket: 'hellofilesbucket', // your bucket name,
			Key: keyfile // path to the object you're looking for
		}
		var s3 = new AWS.S3();
		presignedGETURL = s3.getSignedUrl('getObject', bucektParams);
		console.log("presigned url obtained from s3: ", presignedGETURL);

	} catch (err) {
		console.log("error call during call s3 ".concat(err))
		throw err;
	}

}

/**
 * This function downloads files from s3 by making http call
 * @params{*} presignedGETURL s3-presigned-url
 */
async function downloadFile(presignedGETURL) {
	const url = presignedGETURL
		try {
			const response = await Axios({
					url,
					method: 'GET',
					responseType: 'arraybuffer',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/pdf' // <-- declare the file format in s3
					}
				})

				console.log("response.data from s3 object...>", response.data)
				return response.data;
		} catch (err) {
			console.log("error in axios call", err)
			throw err;
		}

}

/**
 * This function downloads files from s3 by making http call
 * @params{*} Data object data
 */
async function writeFile(Data) {

	//path to your local directory location
	const path = Path.resolve(__dirname, './files', keyfile)

		//can also use streams and pipe
		//var write = require('fs').createWriteStream(path);
		//fs.createReadStream(Data.toString()).pipe(write);

		return new Promise((resolve, reject) => {
			fs.writeFile(path, Data, (err) => {
				if (err) {
					reject("File creation error: ".concat(err));
				} else {
					resolve("./files/".concat(keyfile))
				}
			});
		})

}
