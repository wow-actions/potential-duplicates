import * as core from '@actions/core'
import * as github from '@actions/github'
import mustache from 'mustache'
import { Algo } from './algo'
import { Util } from './util'

export namespace Action {
  export async function run() {
    const context = github.context
    const payload = context.payload.issue
    if (payload && Util.isValidEvent('issues', ['opened', 'edited'])) {
      const octokit = Util.getOctokit()
      const duplicates = []
      const response = await octokit.issues.listForRepo({
        ...context.repo,
        state: core.getInput('state') as 'all' | 'open' | 'closed',
      })

      const issues = response.data.filter((i) => i.number !== payload.number)
      const title = payload.title
      const threshold = parseFloat(core.getInput('threshold'))

      for (const issue of issues) {
        const accuracy = Algo.compare(issue.title, title)

        core.debug(
          `${issue.title} ~ ${title} = ${parseFloat(
            (accuracy * 100).toFixed(2),
          )}%`,
        )

        if (accuracy >= threshold) {
          duplicates.push({
            number: issue.number,
            title: issue.title,
            accuracy: parseFloat((accuracy * 100).toFixed(2)),
          })
        }
      }

      if (duplicates.length) {
        const label = core.getInput('label')
        if (label) {
          await octokit.issues.addLabels({
            ...context.repo,
            issue_number: payload.number,
            labels: [label],
          })
        }

        const comment = core.getInput('comment')
        if (comment) {
          const body = mustache.render(comment, {
            issues: duplicates,
          })

          await octokit.issues.createComment({
            ...context.repo,
            body,
            issue_number: payload.number,
          })
        }
      }
    }
  }
}
