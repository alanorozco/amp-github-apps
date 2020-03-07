/**
 * Copyright 2020 The AMP HTML Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Probot} from 'probot';
import nock from 'nock';

import {ChecklistBot} from '../src/checklist_bot';
import {triggerWebhook} from './fixtures';

const app = require('../app');

describe('Probot webhooks', () => {
  let probot: Probot;

  beforeAll(() => {
    nock.disableNetConnect();
    process.env = {
      DISABLE_WEBHOOK_EVENT_CHECK: 'true',
      GITHUB_ORG: 'test_org',
      GITHUB_ACCESS_TOKEN: '_TOKEN_',
      NODE_ENV: 'test',
    };

    probot = new Probot({});
    const probotApp = probot.load(app);
    probotApp.app = {
      getInstallationAccessToken: async () => 'test',
      getSignedJsonWebToken: () => 'test',
    };
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    jest
      .spyOn(ChecklistBot.prototype, 'processPullRequest')
      .mockImplementation(async () => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();

    // Fail the test if there were unused nocks.
    if (!nock.isDone()) {
      nock.cleanAll();
      throw new Error('Not all nock interceptors were used!');
    }
  });

  describe.each(['pull_request.opened'])(`on %p event`, eventName => {
    it('processes the pull request for new dirs in path', async done => {
      await triggerWebhook(probot, eventName);

      expect(ChecklistBot.prototype.processPullRequest).toBeCalledWith(
        1337,
        'author',
        'Test comment'
      );
      done();
    });
  });
});
