/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: ['custom/main'],
  plugins: [
    "@semantic-release/commit-analyzer",        // 커밋 메시지 분석
    "@semantic-release/release-notes-generator", // 릴리스 노트 생성
    "@semantic-release/changelog",              // CHANGELOG.md 생성
    [
      "@semantic-release/git",
      {
        "message": "chore(release): ${nextRelease.version}"
      }
    ],
  ],
  tagFormat: 'custom.v${version}',
};