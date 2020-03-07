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

const anchorName = 'contribution-checklist';

type Props = {
  user: string; // someone
  filename: string; // extensions/amp-foo/0.1/amp-foo.js
  path: string; // extensions/amp-foo
  subdir: string; // amp-foo
};

type ChecklistBuilder = (props: Props) => string;

// [pathRegExp, checklistBuilder]
type ChecklistMatcher = [RegExp, ChecklistBuilder];

/**
 * Returns a checklist notifier comment body.
 */
export const commentBody = () => `
:eye::paperclip::eye: It looks like you're submitting a new extension.
 
Please make sure you're following the [contribution guidelines](https://go.amp.dev/contribute/code).

I've updated the comment for this pull request with a [checklist for new extensions](#${anchorName}).
`;

/**
 * Returns a checklist section body.
 */
export const checklistHeader = () => `
---
## <a id="${anchorName}" do-not-remove></a> Contribution process
_This section was added by @amp-contribution-checklist_.

_Please check all steps that are **completed**, or those that **do _not_ apply** to this extension._
`;

/**
 * Returns a checklist section body.
 */
const extensionChecklist = ({user, path}: Props) => `
- [ ] This extension has an [intent-to-implement issue (I2I)](https://go.amp.dev/i2i) that is attached to this pull request.
&nbsp;
- [ ] The I2I issue tags a [working group](https://go.amp.dev/wg):
  -  if the extension is an ad type, or an integration for analytics:
    \`@ampproject/wg-ads-and-analytics\` 
  -  otherwise:
    \`@ampproject/wg-ui-and-a11y\`
&nbsp;
- [ ] The I2I issue has been approved during [a design review](https://github.com/ampproject/amphtml/blob/master/contributing/design-reviews.md).
&nbsp;
- [ ] This pull request adds a file named [\`${path}/OWNERS\`](https://github.com/ampproject/amphtml/blob/master/contributing/CODE_OWNERSHIP.md) that includes:
  - [ ] yourself (\`${user}\`)
  - [ ] the relevant [working group](https://go.amp.dev/wg) (like \`ampproject/wg-ads-and-analytics\`)
`;

const elementChecklist = ({subdir}: Props) => `
If this extension provides a custom element, like \`<${subdir}>\`, the I2I issue explains:

- [ ] the **features** the extension provides
- [ ] the **attributes** the element uses, if any
- [ ] how attributes are **validated**
- [ ] how **the page is modified**: _"my component creates an \`<iframe>\` that loads \`$URL\`"_
`;

/**
 * Returns a checklist section body.
 */
const videoPlayersChecklist = () => `
If this extension provides a video player, the I2I issue explains:

  - [ ] Component purpose according to [video player policy](https://github.com/ampproject/amphtml/blob/master/spec/amp-3p-video.md).
`;

export const checklistBuilders: ChecklistMatcher[] = [
  [new RegExp('^extensions/([^/]+)/.+'), extensionChecklist],
  [new RegExp('^extensions/((?!-ad-network-)[^/]+)/.+'), elementChecklist],
  [
    new RegExp('^extensions/([^/]+video[^/]*|[^/]+-player)/.+'),
    videoPlayersChecklist,
  ],
];
