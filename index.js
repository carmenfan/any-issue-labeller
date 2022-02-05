const core = require('@actions/core');
const github = require('@actions/github');

let octokit;

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
		const { data } = await octokit.rest.issues.listLabelsForRepo({
			owner: github.context.payload.repository.owner.name,
			repo: github.context.payload.repository.name,
		});

		console.log(data);

		await octokit.rest.issues.getLabel({
			owner: github.context.payload.repository.owner.name,
			repo: github.context.payload.repository.name,
			name,

		});
	} catch ({ message }) {
		throw new Error(`Failed to find label: ${message}`);
	}
};

const ensureIssueExists = async (issue) => {
	try {
		await octokit.rest.issues.get({
			owner: github.context.payload.repository.owner.name,
			repo: github.context.payload.repository.name,
			issue_number: issue,

		});
	} catch ({ message }) {
		throw new Error(`Failed to find issue: ${message}`);
	}
};

const run = async () => {
	const { issueNum, label } = extractInputs();
	console.log(`adding label ${label} to issue #${issueNum}`);

	await ensureLabelExists(label);
	await ensureIssueExists(issueNum);

	// Get the JSON webhook payload for the event that triggered the workflow
	const payload = JSON.stringify(github.context.payload, undefined, 2);
	console.log(`The event payload: ${payload}`);
};
run().catch((err) => {
	core.setFailed(err.message);
});
