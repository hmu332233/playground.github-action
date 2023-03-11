'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
const core = __importStar(require('@actions/core'));
const github = __importStar(require('@actions/github'));
const ics_1 = require('ics');
const file_1 = require('./utils/file');
const git_1 = require('./utils/git');
function convertToIssue(payload) {
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
function convertToIcs(issues) {
  const events = issues.map((issue) => {
    const event = {
      productId: 'minung--ics',
      calName: 'minung--ics 캘린더',
      start: [2023, 3, 24, 0, 0],
      duration: { hours: 24 },
      title: issue.title,
      description: issue.body,
      classification: 'PUBLIC',
      status: 'CONFIRMED',
      // busyStatus: 'BUSY',
    };
    return event;
  });
  const { error, value } = (0, ics_1.createEvents)(events);
  if (error) {
    // TODO: throw로 에러 처리
    return '';
  }
  return value || '';
}
function getErrorMessage(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}
function run() {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const issue = convertToIssue(github.context.payload);
      if (!issue) {
        return;
      }
      const issueDirPath = './data/issues';
      const issueMap = (0, file_1.readJsonFile)(issueDirPath);
      issueMap[issue.id] = issue;
      const icsString = convertToIcs(Object.values(issueMap));
      (0, file_1.createIcsFile)(issueDirPath, icsString);
      (0, file_1.createJsonFile)(issueDirPath, issueMap);
      (0, git_1.commitAndPush)(issueDirPath, 'Update issues');
    } catch (error) {
      core.setFailed(getErrorMessage(error));
    }
  });
}
run();
