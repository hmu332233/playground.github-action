import { WebhookPayload } from '@actions/github/lib/interfaces';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { createEvents, EventAttributes } from 'ics';
import { createIcsFile, createJsonFile, readJsonFile } from './utils/file';
import { commitAndPush } from './utils/git';
import { getTimeArray } from './utils/date';

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

function convertToIcs(issues: Issue[]): string {
  const events = issues.map((issue) => {
    const event: EventAttributes = {
      productId: 'minung--ics',
      calName: 'minung--ics 캘린더',
      start: getTimeArray('2023-03-24', 'Asia/Seoul'),
      startInputType: 'utc',
      duration: { hours: 24 },
      title: issue.title,
      description: issue.body,
      classification: 'PUBLIC',
      status: 'CONFIRMED',
      // busyStatus: 'BUSY',
    };
    return event;
  });

  const { error, value } = createEvents(events);

  if (error) {
    // TODO: throw로 에러 처리
    return '';
  }

  return value || '';
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

    const issueMap = readJsonFile(issueDirPath) as IssueMap;
    issueMap[issue.id] = issue;

    const icsString = convertToIcs(Object.values(issueMap));

    createIcsFile(issueDirPath, icsString);
    createJsonFile(issueDirPath, issueMap);
    commitAndPush(issueDirPath, 'Update issues');
  } catch (error) {
    core.setFailed(getErrorMessage(error));
  }
}

run();
