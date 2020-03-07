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

import {Octokit} from '@octokit/rest';

import {ChecklistBot} from '../src/checklist_bot';
import {GitHub} from '../src/github';

describe('ChecklistBot', () => {
  let bot: ChecklistBot;

  beforeEach(() => {
    bot = new ChecklistBot(/*client=*/ null, 'test_org', 'repo');
  });

  describe('processPullRequest', () => {
    it('does not post if no new dirs where added to path', async () => {
      jest
        .spyOn(GitHub.prototype, 'findNewDirectory')
        .mockImplementation(async () => undefined);

      await bot.processPullRequest(1337, 'someone', 'description');
    });

    it('posts when a new dir is added to path', async () => {
      jest
        .spyOn(GitHub.prototype, 'findNewDirectory')
        .mockImplementation(async () => ['a/b/c', 'a/b', 'b']);

      jest
        .spyOn(GitHub.prototype, 'updatePullBody')
        .mockImplementation(async (pull_number, description) => {
          expect(pull_number).toBeTruthy();
          expect(description).toMatch(/^description\n[\n.]+/);
          return {} as Octokit.Response<Octokit.PullsUpdateResponse>;
        });

      jest
        .spyOn(GitHub.prototype, 'addComment')
        .mockImplementation(
          async () =>
            ({data: {id: 567}} as Octokit.Response<
              Octokit.IssuesGetCommentResponse
            >)
        );

      await bot.processPullRequest(1337, 'someone', 'description');
    });
  });
});
