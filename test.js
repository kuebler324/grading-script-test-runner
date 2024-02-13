/*
  place in working directory and use "node test" to run script
  options:
    -all
      will run all tests despite failures
    -v
      will only run valgrind

  linux dependencies:
    node
    g++
    cat
    grep
    python3
    valgrind
*/

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const { exit } = require('process');

const execute = async (command, stdoutCallback) => {
  // asynchronous function for executing command line commands with error catching
  // pass in an stdoutCallback: (stdout) => void callback to grab the output of the command
  console.log(`executing '${command}'`);
  try {
    // execute the command
    const { stdout } = await exec(command);
    if (stdout && stdoutCallback) {
      // use callback function with result std output
      await stdoutCallback(stdout);
    }
  } catch (err) {
    // catch command execution errors
    console.log('failure:');
    if (err) {
      if (typeof err.stdout === 'string' && err.stdout.length > 0) {
        console.warn('stdout:' + err.stdout);
      } else if (err.code === 139) {
        console.warn('segmentation fault');
      } else {
        if (err.error) {
          console.error(err.error);
        }
        if (err.stderr) {
          console.error(err.stderr);
        }
      }
    }
    exit();
  }
};

const boldText = text => `\x1b[1m${text}\x1b[0m`;

const main = async () => {
  console.log(boldText('running test.js for eecs630 (by Eric Kuebler)\n'));

  // detect command flags
  const allFlag = process.argv.indexOf('-all') !== -1;
  const vFlag = process.argv.indexOf('-v') !== -1;

  // obtain the argument for the test cpp file
  const testPath = 'MainTest.cpp';

  // compile test cpp file
  console.log(boldText('compiling...'));
  await execute(`g++ -std=c++11 ${testPath} -o compiled`);

  // obtain highest clock speed
  let clockspeed = 0;
  console.log(boldText('\ncalculating clock speed...'));
  await execute(`cat /proc/cpuinfo | grep 'MHz'`, stdout => {
    stdout.split('\n').forEach(line => {
      const segments = line.split(' ');
      if (segments.length === 3) {
        const speed = parseFloat(segments[2]);
        if (speed > clockspeed) {
          clockspeed = speed;
        }
      }
    });
  });
  console.log(`clockspeed: ${clockspeed}\n`);

  console.log(boldText('running tests...'));
  // obtain list of all input files in Inputs directory
  fs.readdir('Inputs', async (err, files) => {
    if (err) {
      throw err;
    }

    // initialize testing variables
    let problem = false;

    // loop through all input files
    if (!vFlag) {
      let result = boldText('\nTest Results:\n\nInput File\tOutput\tTime\tSpace\n');
      const accept = 'YES';
      for (let i = 0; i < files.length && (!problem || allFlag); ++i) {
        const filename = files[i];
        if (filename.indexOf('.txt') === filename.length - 4) {
          // execute compiled test file with input
          await execute(`/usr/bin/time -v -o log.txt ./compiled Inputs/${filename} >result.txt`);

          // execute python grading script for result
          await execute(`python3 GradingScript.py result.txt Outputs/${filename.replace('input', 'output')} log.txt Logs/${filename.replace('input', 'log')} ${clockspeed}`, stdout => {
            // color code and check the result, format for printing
            const testResult = stdout
              .split('\n')
              .map(outcome => {
                if (outcome === '') {
                  return '';
                }
                const acceptable = outcome === accept;
                if (!acceptable) {
                  problem = true;
                }
                return `\x1b[${acceptable ? '32' : '31'}m${outcome}\x1b[0m`;
              })
              .join('\t');
            result += `${filename}:\t${testResult}\n`;
          });
        } else {
          // ignore files that do not end in .txt
          console.log(`ignoring '${filename}'`);
        }
      }

      // output the test results as a table
      console.log(result);
      console.log(
        boldText(`\x1b[${problem ? '31' : '32'}m${problem ? `Exiting because a test failed.${allFlag ? '' : '\nTo run without exiting early, use "node test -all"'}` : 'Passed all tests.\n'}\x1b[0m`)
      );
    }

    // run all tests through valgrind, only if all tests pass
    if (!problem) {
      console.log(boldText('running valgrind...'));
      let result = boldText('\nValgrind Results:\n\n');
      for (let i = 0; i < files.length; ++i) {
        const filename = files[i];
        if (filename.indexOf('.txt') === filename.length - 4) {
          // execute compiled test file with input
          await execute(`valgrind --log-file=log.txt --leak-check=full --show-leak-kinds=all ./compiled Inputs/${filename} >result.txt`);
          await execute(`cat log.txt`, stdout => {
            result += `valgrind result for ${filename}:\n${stdout.substr(stdout.indexOf('HEAP SUMMARY'))}\n`;
          });
        } else {
          // ignore files that do not end in .txt
          console.log(`ignoring '${filename}'`);
        }
        break;
      }
      console.log(result);
    }
  });
};

main();
