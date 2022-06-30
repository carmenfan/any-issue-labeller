const core = require('@actions/core');
const github = require('@actions/github');

let octokit;

const owner = github.context.payload.repository.owner.name || github.context.payload.repository.owner.login;
const repoName = github.context.payload.repository.name;

const extractInputs = () => {
	const issueNum = parseInt(core.getInput('issue-number'), 10);
	console.log('Issue number is', issueNum, ' original value is ', core.getInput('issue-number'));
	if (Number.isNaN(issueNum)) {
		throw new Error(`Cannot convert ${issueNum} into an integer`);
	}

	const label = core.getInput('label');
	if (!label) { throw new Error('label cannot be empty'); }

	const token = core.getInput('github-token');

	if (!label) { throw new Error('token cannot be empty'); }
	octokit = github.getOctokit(token);

	return { issueNum, label };
};

const ensureLabelExists = async (name) => {
	try {
		await octokit.rest.issues.getLabel({
			owner,
			repo: repoName,
			name,

		});
	} catch ({ message }) {
		throw new Error(`Failed to find label: ${message}`);
	}
};

const ensureIssueExists = async (issue) => {
	try {
		await octokit.rest.issues.get({
			owner,
			repo: repoName,
			issue_number: issue,

		});
	} catch ({ message }) {
		throw new Error(`Failed to find issue: ${message}`);
	}
};

const assignLabelToIssue = async (issue, label) => {
	try {
		await octokit.rest.issues.addLabels({
			owner,
			repo: repoName,
			issue_number: issue,
			labels: [label],

		});
	} catch ({ message }) {
		throw new Error(`Failed to assign label ${label} issue #${issue}: ${message}`);
	}
};

const run = async () => {
	const { issueNum, label } = extractInputs();
	console.log(`adding label ${label} to issue #${issueNum}`);

	await ensureLabelExists(label);
	await ensureIssueExists(issueNum);

	await assignLabelToIssue(issueNum, label);
};
run().catch((err) => {
	core.setFailed(err.message);
});
