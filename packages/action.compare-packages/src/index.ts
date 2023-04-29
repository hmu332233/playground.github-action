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

const packages = result.stdout
  .split('\n')
  .map((v) => v.split('node_modules/')[1])
  .filter(Boolean);

const COMPARE_TARGET_BRANCH =
  process.env.COMPARE_TARGET_BRANCH || 'origin/main';

console.log(
  'compare',
  COMPARE_TARGET_BRANCH,
  github.context.payload.pull_request?.head.ref,
  github.context.payload.pull_request?.head.sha,
);

// github.context.

// 추가된 패키지 목록 출력
const result2 = exec(
  // `git diff --name-only ${COMPARE_TARGET_BRANCH} ${targetSha} | grep package.json | xargs cat | jq -r '.dependencies | keys[]' | paste -sd ", "`,
  `git diff ${COMPARE_TARGET_BRANCH} origin/${github.context.payload.pull_request?.head.ref} -- package.json | grep -E '^\\+' | grep -E '\".+\":\\s*\".+"' | sed -E 's/^\\+.*\"([^"]+)\":.*$/\\1/' | tr '\\n' ',' | sed 's/,$//'`,
  // { silent: true },
);

console.log(
  `git diff ${COMPARE_TARGET_BRANCH} origin/${github.context.payload.pull_request?.head.ref} -- package.json | grep -E '^\\+' | grep -E '\".+\":\\s*\".+"' | sed -E 's/^\\+.*\"([^"]+)\":.*$/\\1/' | tr '\\n' ',' | sed 's/,$//'`,
);

if (result2.code !== 0) {
  console.log(result.stderr);
}

const addedPackages = result2.stdout.split(',');
console.log('addedPackages', addedPackages);

const originPackages = packages.filter((v) => !addedPackages.includes(v));
console.log(originPackages);

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function createPrompt(pkgNames1: string[], pkgNames2: string[]) {
  return `Please compare the packages in lists A and B, and identify any with similar purposes.
If a similar package is found, please present the information in the following JSON format:
[ { "pkgName1": "[package from A list]", "pkgName2": "[package from B list]", "description": "[brief explanation of the similarity]" }]
If no similar packages are found, output "[]". Please ensure only the JSON format is provided in the response.
  
Here are the package lists:
A List: ${pkgNames1.join(',')}
B List: ${pkgNames2.join(',')}`;
}

function removeWhitespace(inputString: string) {
  const regex = /\s/g;
  return inputString.replace(regex, '');
}

async function run() {
  if (addedPackages.length === 0) {
    return core.setOutput('RESULTS', '추가된 패키지가 없습니다.');
  }

  const content = createPrompt([...originPackages, 'jest'], addedPackages);
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
      ({ pkgName1, pkgName2, description }: any) =>
        `pkgName1: ${pkgName1}\npkgName2: ${pkgName2}\ndescription: ${description}`,
    )
    .join('\n\n');

  console.log(resultsString);

  core.setOutput('RESULTS', resultsString || 'Not found similar package');
}

run();
