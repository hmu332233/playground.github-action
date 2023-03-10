import * as core from '@actions/core';
import * as github from '@actions/github';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function run(): Promise<void> {
  try {
    const context = github.context;

    if (context.payload.issue) {
      const issueNumber = context.payload.issue.number;
      core.info(`Issue #${issueNumber} opened`);
    }
  } catch (error) {
    core.setFailed(getErrorMessage(error));
  }
}

run();
