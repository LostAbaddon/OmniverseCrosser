globalThis.IsTab = true;
globalThis.IsInject = true;
globalThis.TabID = -1;
globalThis.OmniverseCrosser.init();

OmniverseCrosser.listen('onInjectTID', msg => {
	TabID = msg.tid;
	console.log('[> Injection Tab ID: ' + globalThis.TabID + ' <]');
});

_onExtInjected();

console.log('Injection :: Ready');