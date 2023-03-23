const axios = require('axios').default;
const deasync = require('deasync');
const shell = require('shelljs');
const fs = require('fs');
const os = require('os');


let command;
switch(os.platform()) {
    case "win32":
        let chkLocation = [
            'C:\\Program Files\\Google\\Chrome\\Application',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application'
        ];

        for (let loc of chkLocation) {
            try {
                let dirs = fs.readdirSync(loc);
                if (dirs.length > 0 && dirs.filter((v) => v.indexOf('chrome.exe') >= 0)) {
                    command = `dir /B/AD "${loc}"|findstr /R /C:"^[0-9].*\..*[0-9]$"`;
                    break;
                }
            } catch (error) {}
        }
        break;
    case "linux":
    case "darwin":
        command = 'google-chrome --version';
        break;
}

let data = shell.exec(command);
let versions = Array.from(new Set(data.stdout.split(/\r?\n/).filter((v) => !!v)));
versions = versions.sort((a, b) => b.split('.')[0] - a.split('.')[0]);

if (versions.length >= 2) {
    console.log(`현재 버전: ${versions[0]}, 업데이트 버전: ${versions[1]} => 크롬 업데이트 해주세요.`);
}

let now_version = versions[0];
console.log(`Chrome Version => ${now_version} Chrome Driver Install`);


let content;
let done = false;
axios.get('https://chromedriver.chromium.org/downloads').then((res) => {
    content = res.data;
    done = true;
}).catch((err) => {done = true})
deasync.loopWhile(() => !done);

let downloadable_versions = [];
if (!!content) {
    let regex = new RegExp(/googleapis\.com\/index\.html\?path=([0-9\.]+)/, "g");
    do {
        var match = regex.exec(content);
        if (match)
            downloadable_versions.push(match[1]);
    } while (match);
}

let downloaded_ver = downloadable_versions.find((v) => v.split(".")[0] == now_version.split(".")[0]);
done = false;
axios.get(`https://chromedriver.storage.googleapis.com/${downloaded_ver}/chromedriver_win32.zip`, { responseType: "arraybuffer" }).then((res) => {
    fs.writeFileSync(`./chromeDriver_${downloaded_ver}.zip`, res.data, "binary");
    done = true;
}).catch((err) => {done = true;})
deasync.loopWhile(() => !done);

console.log("Install Done!");
process.exit();