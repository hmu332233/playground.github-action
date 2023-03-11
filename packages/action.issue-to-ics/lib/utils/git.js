'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.commitAndPush = void 0;
const shelljs_1 = require('shelljs');
function commitAndPush(path, message) {
  (0, shelljs_1.exec)(`git config user.email "bot@minung.dev"`);
  (0, shelljs_1.exec)(`git config user.name "Bot"`);
  (0, shelljs_1.exec)(`git add ${path}`);
  (0, shelljs_1.exec)(`git commit -m "${message}"`);
  (0, shelljs_1.exec)(`git push`);
}
exports.commitAndPush = commitAndPush;
