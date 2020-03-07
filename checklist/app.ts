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

import {Application, Context} from 'probot';
import {WebhookPayloadPullRequest} from '@octokit/webhooks';
import {Octokit} from '@octokit/rest';

import {ChecklistBot} from './src/checklist_bot';

module.exports = (app: Application) => {
  // @rcebulko:
  // How do you want to handle draft PRs or PRs with "DO NOT SUBMIT" or similar
  // things in the title? This is a common question we end up confronting
  // after-the-fact with PR bots, worth answering here. If you want to ignore
  // draft PRs and only comment once the PR is ready, you can filter on
  // payload.pull_request.draft or something like that, and then you can listen
  // for the pull_requests.ready_for_review event. The Owners Bot index.js has
  // some logic like this you may find helpful.
  app.on(
    'pull_request.opened',
    async ({github, payload, log}: Context<WebhookPayloadPullRequest>) => {
      await new ChecklistBot(
        // This type-cast is required because Probot exports a separate GitHubAPI
        // class, even though it's in Octokit instance.
        (github as unknown) as Octokit,
        payload.repository.owner.login,
        payload.repository.name,
        log
      ).processPullRequest(
        payload.pull_request.number,
        payload.pull_request.user.login,
        payload.pull_request.body
      );
    }
  );
};
