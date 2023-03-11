import { WebhookPayload } from '@actions/github/lib/interfaces';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { createJsonFile, readJsonFile } from './utils/file';
import { commitAndPush } from './utils/git';

type IssueMap = {
  [id: string]: Issue;
};

type Issue = {
  id: string;
  number: number;
  title: string;
  body: string;
};

function convertToIssue(payload: WebhookPayload): Issue | undefined {
  const { issue } = payload;

  if (!issue) {
    return undefined;
  }

  return {
    id: `${issue.id}`,
    number: issue.number,
    title: issue.title,
    body: issue.body || '',
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function run(): Promise<void> {
  try {
    const issue = convertToIssue(github.context.payload);

    if (!issue) {
      return;
    }

    const issueDirPath = './data/issues';

    const data = readJsonFile(issueDirPath) as IssueMap;
    data[issue.id] = issue;

    createJsonFile(issueDirPath, data);
    commitAndPush(issueDirPath, 'Update issues');
  } catch (error) {
    core.setFailed(getErrorMessage(error));
  }
}

run();
