// Require library
const excel = require('excel4node');
const fs = require('fs');
const path = require('path');

/**
 * Prepare data file
 * 
 * @param {*} data data from readFileFunction
 */
function writeFile(data) {
    try {
        var workbook = new excel.Workbook();
        var worksheet1 = workbook.addWorksheet('Sheet 1');
        let rowHeaderIndex = 2;
        // adding header rows
        data.serviceNames.forEach((service) => {
            worksheet1.cell(1, rowHeaderIndex).number(100).style({ font: { bold: true } });
            worksheet1.cell(1, rowHeaderIndex).string(service).style({ font: { bold: true } });
            rowHeaderIndex++;
        });

        //creating common dependencies
        let commonDependencies = [];
        let serviceNameIndex = 0
        data.dependencies.forEach((packageObject) => {
            for (const [key, value] of Object.entries(packageObject)) {
                //append all dependencies
                if (data.serviceNames[serviceNameIndex] === key) {
                    if (value.dependencies && value.devDependencies) {
                        commonDependencies = commonDependencies.concat(Object.keys(value.dependencies))
                        commonDependencies = commonDependencies.concat(Object.keys(value.devDependencies))
                    }
                    serviceNameIndex++;
                }
            }
        })
        // removing duplicate dependencies
        let uniqueDependencies = [...new Set(commonDependencies)]

        // adding first header columns
        let columnHeaderIndex = 2
        uniqueDependencies.forEach((item) => {
            worksheet1.cell(columnHeaderIndex, 1).number(100).style({ font: { bold: true } });
            worksheet1.cell(columnHeaderIndex, 1).string(item).style({ font: { bold: true } });
            columnHeaderIndex++;
        })
        //generating data col=2, row=2
        for (let col = 2; col < uniqueDependencies.length + 2; col++) {
            for (let row = 2; row < data.serviceNames.length + 2; row++) {
                let service = data.serviceNames[row - 2];
                let dependency = uniqueDependencies[col - 2];
                console.log('adding in', col, service, row, dependency)
                let value = data.dependencies.filter((item) => {
                    if (Object.keys(item)[0] === service) {
                        return item
                    }
                })[0][service];
                if (value.dependencies && value.dependencies[dependency]) {
                    value = value.dependencies[dependency];
                } else if (value.devDependencies && value.devDependencies[dependency]) {
                    value = value.devDependencies[dependency];
                } else {
                    value = 'n/a'
                }
                worksheet1.cell(col, row).string(value).style({ font: { bold: false } });
            }
        }
        let fileName = process.cwd().split('\\').pop().concat('-Dependencies.xlsx');
        console.log(`Creating file ${fileName} in location `, process.cwd())
        workbook.write(fileName);

        workbook.writeToBuffer();
    } catch (err) {
        console.log('error in preparing data files', err);
        throw err;
    }
}

/**
 * get all folders/services within services folders
 * read package.json build object with dependencies and devDependencies
 */
async function readFiles() {
    try {
        let serviceNames = [];
        const dependencies = [];
        const directoryPath = path.join(__dirname, 'Services');
        serviceNames = await fs.readdirSync(directoryPath, function (err, files) {
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }
        });
        //read package.json
        serviceNames.forEach(function (file) {
            const servicePath = path.join(directoryPath, file);
            let packageObject = require(servicePath + '\\package.json');
            dependencies.push({
                [file]: {
                    dependencies: packageObject.dependencies,
                    devDependencies: packageObject.devDependencies
                }
            })
        });
        return { serviceNames, dependencies };
    } catch (err) {
        console.log('error in reading files', err);
        throw err;
    }
}

/**
 * 1 readFiles
 * 2 createFiles
 */
async function main() {
    try {
        const data = await readFiles();
        await writeFile(data)
    } catch (err) {
        console.log("Error during data creation ", err)
    }
}

main();
