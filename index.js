const core = require('@actions/core');
const github = require('@actions/github');

try {
	const issueNum = parseInt(core.getInput('issue-number'));
	console.log("Issue number is" , issueNum, " original value is ", core.getInput('issue-number'));
	if (isNaN(issueNum)) {
		throw new Error(`Cannot convert ${issueNum} into an integer`);
	}

	const label = core.getInput('label');
	if(!label)
		throw new Error ("label cannot be empty");

	console.log(`adding label ${label} to issue #${issueNum}`);
	// Get the JSON webhook payload for the event that triggered the workflow
	const payload = JSON.stringify(github.context.payload, undefined, 2);
	console.log(`The event payload: ${payload}`);
} catch (error) {
	core.setFailed(error.message);
}
