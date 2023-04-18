import * as core from '@actions/core';
import * as github from '@actions/github';

import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { Configuration, OpenAIApi } from 'openai';
import { exec } from 'shelljs';

dotenv.config();

const result = exec(`npm ls --parseable`, { silent: true });

if (result.code !== 0) {
  console.log(result.stderr);
}

const packageNames = result.stdout
  .split('\n')
  .map((v) => v.split('node_modules/')[1])
  .filter(Boolean)
  .join(', ');

const COMPARE_TARGET_BRANCH =
  process.env.COMPARE_TARGET_BRANCH || 'origin/main';

console.log('compare', COMPARE_TARGET_BRANCH);

// 추가된 패키지 목록 출력
const result2 = exec(
  `git diff --name-only ${COMPARE_TARGET_BRANCH} HEAD | grep package.json | xargs cat | jq -r '.dependencies | keys[]' | paste -sd ", "`,
  { silent: true },
);

if (result2.code !== 0) {
  console.log(result.stderr);
}

const addedPackageNames = result2.stdout;
console.log('addedPackageNames', addedPackageNames);

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function createPrompt(pkgNames1: string, pkgNames2: string) {
  return `Please find a package with a similar purpose in A list and B list.

If a similar package is found, please write it in the json format below.
[ { "name": "[package of A list found]", "description": [explain the reason in one line] }]
If no package similar to the target is found in the list, say "[]".
Don't output anything in addition to Json format
  
Here is lists.
A List: ${pkgNames1}
B List: ${pkgNames2}`;
}

async function run() {
  const content = createPrompt(packageNames + ', jest', addedPackageNames);
  console.log(content);
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content }],
  });

  console.log(completion.data.usage);
  console.log(completion.data.choices);

  const comparedPkgs = JSON.parse(
    completion.data.choices[0].message?.content || '[]',
  );
  const resultsString = comparedPkgs
    .map(
      ({ name, description }: any) =>
        `name: ${name}\ndescription: ${description}`,
    )
    .join('\n\n');

  console.log(resultsString);

  core.setOutput('RESULTS', resultsString || 'Not found similar package');
}

run();
