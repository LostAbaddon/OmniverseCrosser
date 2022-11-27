globalThis.OmniverseCrosser.init();

OmniverseCrosser.listen('reply-test1', msg => {
	console.log('Step 2 DONE', msg.data);
	return "艹艹艹艹艹艹艹艹";
});
OmniverseCrosser.listen('reply-test2', msg => {
	console.log('Step 3 DONE', msg.data);
});

document.body.addEventListener('click', async () => {
	console.log('Body On Click');
	var result = await OmniverseCrosser.sendMsgAndWait('test1', 'fuck you');
	console.log('Step 1 DONE', result.data);
	OmniverseCrosser.sendMsg('test2', 'fuck you again');
});

console.log('Content :: Ready');