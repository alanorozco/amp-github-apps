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

import {GitHub} from './github';
import {ILogger} from './types';
import {checklistHeader, commentBody, checklistBuilders} from './template';

/** A GitHub bot which posts checklists on pull requests. */
export class ChecklistBot {
  readonly github: GitHub;

  /** */
  constructor(
    client: Octokit,
    private org: string,
    private repo: string,
    private logger: ILogger = console
  ) {
    this.github = new GitHub(client, org, repo, logger);
    this.logger.info(`ChecklistBot initialized for ${this.org}`);
  }

  /**
   * Process a pull request.
   * Determines whether a new directory was added to path. If so, it inserts a
   * checklist into the pull's description and posts a notifier comment pointing
   * to it.
   */
  async processPullRequest(pullNumber: number, user: string, body: string) {
    const {repo} = this;

    this.logger.info(
      `processPullRequest: Processing ${repo}#${pullNumber} by @${user}`
    );

    const checklists = [];

    for (const [pathRegExp, checklistBuilder] of checklistBuilders) {
      const found = await this.github.findNewDirectory(pullNumber, pathRegExp);
      if (found) {
        const [filename, path, subdir] = found;
        checklists.push(checklistBuilder({user, filename, path, subdir}));
      }
    }

    if (!checklists.length) {
      return;
    }

    await this.github.updatePullBody(
      pullNumber,
      [body, checklistHeader(), ...checklists].join('\n')
    );

    await this.github.addComment(pullNumber, commentBody());

    this.logger.info(
      `processPullRequest: Added checklist comment to ${repo}#${pullNumber}`
    );
  }
}
