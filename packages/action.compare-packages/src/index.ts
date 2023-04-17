// import { Configuration, OpenAIApi } from 'openai';

// const configuration = new Configuration({
//   // apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

// async function run() {
//   const completion = await openai.createChatCompletion({
//     model: 'gpt-3.5-turbo',
//     messages: [{ role: 'user', content: 'Hello' }],
//   });

//   console.log(completion.data.choices);
// }

// run();

// const { exec } = require('child_process');

// exec('npm ls --json --depth=0', (error: any, stdout: any, stderr: any) => {
//   if (error) {
//     console.error(`exec error: ${error}`);
//     return;
//   }

//   const packageList = stdout
//     .split('\n')
//     .filter((line: string) => line.includes('@'))
//     .map((line: string) => line.trim().split('@')[0]);

//   console.log(packageList);
// });

import { exec } from 'shelljs';

const result = exec(`npm ls --parseable`, { silent: true });

if (result.code !== 0) {
  console.log(result.stderr);
}

console.log(result.stdout.split('\n'));
