import { WebhookPayload } from '@actions/github/lib/interfaces';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { createFile } from './utils/file';
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

    const data: IssueMap = {};
    data[issue.id] = issue;
    createFile('./data/issues', data);
    commitAndPush('./data/issues', 'Update issues');
  } catch (error) {
    core.setFailed(getErrorMessage(error));
  }
}

run();
