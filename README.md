# aws-practices-node.js
This repo contains list of scripts that can be used during s/w development using nodeJs

# s3 script - getFileFromS3toLocal.js
This script is used if we need to get a file from s3 into our local using pre-signed url.


# Dependency generator script - generateReport.js
This script is used to generate report in xlsx format, which will have list of npm dependencies used in project anlong with its verison.
conisderation:
The folder structure is as below:
src
|-----serviceName1
|-----serviceName2
      |------------package.json
      
The output format of file will be:
|              |serviceName1|serviceName2|
|depedencyName1|            |            |
|depedencyName2|            |            |
