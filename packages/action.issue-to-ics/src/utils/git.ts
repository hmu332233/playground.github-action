import { exec } from 'shelljs';

export function commitAndPush(path: string, message: string) {
  exec(`git config user.email "bot@minung.dev"`);
  exec(`git config user.name "Bot"`);
  exec(`git add ${path}`);
  exec(`git commit -m "${message}"`);
  exec(`git push`);
}
