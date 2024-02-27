"use strict";
/*jshint esversion: 8 */

require('dotenv').config();
const {
  promises: fs
} = require("fs");

const axios = require('axios');
require('console-stamp')(console, {
  format: ':date(yyyy-mm-dd HH:MM:ss.l,utc)'
});

const util = require("util");
const crypto = require("crypto");

const exec = util.promisify(require('child_process').exec);
const execFile = util.promisify(require("child_process").execFile);

const packageJSON = require(`${__dirname}/package.json`);
const VERSION =  packageJSON.version;

const timeout = (ms) => new Promise(res => setTimeout(res, ms));

const toFixedPlaces = (value, places) => {
  return parseFloat(value.toFixed(places));
}

const time = () => {
  const [seconds, nanos] = process.hrtime();
  return seconds * 1000 + nanos / 1000000;
};

const getFiles = async (path = "./")=> {
  const entries = await fs.readdir(path, {
    withFileTypes: true
  });

  const files = entries
    .filter((file) => !file.isDirectory())
    .map((file) => ({
      ...file,
      path: path + file.name
    }));

  const folders = entries.filter((folder) => folder.isDirectory());

  for (const folder of folders)
    files.push(...(await getFiles(`${path}${folder.name}/`)));

  return files;
}

const splitLines = (data) => {
  if (typeof data === "string" && data.length > 0) {
    return data.split("\n").filter(Boolean);
  }
};

const parseTemplate = (template, replacements) => {
  return template.replace(/%\w+%/g, (id) => {
    return replacements[id] || id;
  });
};

const execCommand = async (command, args, timeout = 30000) => {
  try {
    const data = {};

    data.start = Date.now();

    const {
      stdout,
      stderr
    } = await execFile(command, args, {
      timeout: timeout,
    });

    data.end = Date.now();
    data.duration = data.end - data.start;

    let temp = splitLines(stdout);
    if (temp) {
      data.output = temp;
    }

    temp = splitLines(stderr);
    if (temp) {
      data.error = temp;
    }

    return data;
  } catch (error) {
    console.error(error);
    let temp = splitLines(error.message);
    return {
      error: temp,
    };
  }
};

const pathExists = async (path) => {
  try {
    let stat = await fs.stat(path);
    return typeof (stat) === "object";
  } catch (error) {

  }
  return false;
}

const hash = (data, algo, encoding, outputLength) => {
  algo = algo || 'sha1';
  encoding = encoding || 'base64'; //"latin1" | "hex" | "base64"
  let options;

  if (typeof (outputLength) === 'number')
      options = {
          'outputLength': outputLength
      };

  let hash = crypto.createHash(algo);
  let hased_data = hash.update(data, 'utf-8');
  return hased_data.digest(encoding);
}

(async () => {
  const start = time();

  const argLen = process.argv.length; 
  let release = "";
  if( argLen > 2) {
    release = `${process.argv.slice(2)}`;
  }

  console.log(`Releasing v${VERSION}...`);
  console.log("Copying release environment file...");
  await fs.copyFile(`${__dirname}/misc/.env.release`, `${__dirname}/.env.production`);

  const htIn = `${__dirname}/misc/.htaccess`;
  const htOut = `${__dirname}/out/.htaccess`;
  const indexFile = `${__dirname}/out/index.html`;
  const configFile = `${__dirname}/out/cfg.json`;

  console.log("Compiling...");
  let results = await exec("npm run build-export");
  if (!await pathExists(`${__dirname}/out/_next/`)) {
    console.log(results);
    process.exit(0);
  }
  console.log("Loading build configuration...");
  const outputs = require("./build.json");
  if (!outputs) {
    console.log("build.json not found or invalid.");
    process.exit(0);
  }
  console.log(`Found ${outputs.length - 1} builds.`)

  //let outputs = [];
  // const addOutput = (id, front, back, misc = false) => {
  //   let output = {
  //     id,
  //     replacements: {
  //       "%FRONT%": front,
  //       "%BACK%": back
  //     },
  //     misc
  //   }
  //   outputs.push(output);
  // }

  // addOutput("demo", "demo.fortifid.com", "demo.fortifid.com/public");
  // addOutput("qa", "qa.fortifid.com", "qa.fortifid.com/public");
  // addOutput("cisco", "cisco.fortifid.com", "cisco.fortifid.com/public");
  // addOutput("vistabank", "vistabank.fortifid.com", "vistabank.fortifid.com/public");

  // addOutput("sandbox", "portal.sandbox.fortifid.com", "portalbackend.sandbox.fortifid.com", true);
  // addOutput("prod", "branchportal.prod.fortifid.com", "branchportalbackend.prod.fortifid.com", true);
  // addOutput("", "%FRONT%", "%BACK%");

  //await fs.writeFile(`${__dirname}/output.json`, JSON.stringify(outputs, null, 2));

  let files = await getFiles(`${__dirname}/out/_next/`);

  const FOUND = [];
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    if (file.name.endsWith(".js")) {
      try {
        let data = await fs.readFile(file.path, "utf8");

        if (
          data.indexOf("%FRONT%") > -1 ||
          data.indexOf("%BACK%") > -1 ||
          data.indexOf("%VERSION%") > -1 ||
          data.indexOf("%MODE%") > -1 
        ) {
          FOUND.push({
            data,
            file: file.path
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  for (let o = 0; o < outputs.length; o++) {
    let output = outputs[o];
    if(output.id && output.id.length > 0) {
      console.log(`Building ${output.id}...`);
    } else {
      console.log("Resetting to default...");
    }
    
    for (let index = 0; index < FOUND.length; index++) {
      const item = FOUND[index];
      const replacements = {...output.replacements, "%VERSION%": VERSION};
      let contents = parseTemplate(item.data, replacements);
      await fs.writeFile(item.file, contents);
    }

    let exists = await pathExists(htOut);
    if (output.misc) {
      if (!exists) {
        await fs.copyFile(htIn, htOut);
      }
    } else {
      if (exists) {
        await fs.unlink(htOut);
      }
    }

    const config = {
      version: VERSION,
      front_url: `https://${output.replacements["%FRONT%"]}`,
      back_url: `https://${output.replacements["%BACK%"]}`,
      created: Date.now(),
      index_hash:  hash(await fs.readFile(indexFile, "utf8"), "md5", "hex")
    }

    await fs.writeFile(configFile, JSON.stringify(config, null, 2));

    if (output.id.length > 0) {

      let fileOut = `portal-front-out-${output.id}.tar.gz`;
      if(await pathExists(fileOut)) {
        console.log(`Deleting previous archive for ${output.id}...`);
        await fs.unlink(fileOut);
      }

      let results = await execCommand("tar", ["-czf", fileOut, "./out"]);
      if(await pathExists(fileOut)) {
        console.log(`Uploading ${output.id}...`);
        results = await execCommand("curl", ["-F", `upload=@${fileOut}`, "https://i.dev.fortifid.com/u/"]);
        if(output.release || release === "all" || release.indexOf(output.id) > -1) {
          if(process.env.CMD_PASS) {
            try {
              console.log("Waiting 1000ms to ensure archive is 100% uploaded...");
              await timeout(1000);

              console.log(`Updating ${output.id}...`);
              const updateUrl = `https://${output.replacements["%BACK%"]}/cmd?cmd=update&password=${process.env.CMD_PASS}`;
              //console.log(updateUrl);
              let results = await axios.get(updateUrl);
              console.log(results.data);
            } catch (error) {
              console.log(error);
            }
          } else {
            console.log("CMD_PASS is missing.");
          }
        }
      } else {
        console.log(`Archive not found for ${output.id}`);
      }
    }
  }

  await fs.copyFile(`${__dirname}/misc/.env.production`, `${__dirname}/.env.production`);
  const duration = time() - start;
  console.log(`Done. ${toFixedPlaces(duration, 2)}ms`);

})();