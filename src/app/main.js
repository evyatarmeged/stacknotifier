#!/usr/bin/env electron

const {app, Menu, BrowserWindow, Tray} = require('electron'),
	url = require('url'),
	path = require('path');


/* Keep a global reference of the window object, if you don't, the window will
be closed automatically when the JavaScript object is garbage collected. */
let tray = null;
let mainWindow;

function runHeadless() {
	mainWindow = new BrowserWindow({show: true, title: "Stack Overflow Notifier"});
	tray = new Tray(path.join(__dirname, '../images/sof.png'));

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '../static/headless.html'),
		protocol: 'file:',
	}));

	const contextMenu = Menu.buildFromTemplate([
		{label: 'Quit', click: () => {
				mainWindow.close();}}
	]);

	tray.setContextMenu(contextMenu);

	mainWindow.on('closed', () => {
		mainWindow = null
	})
}

function createWindow() {
	let args = process.argv;
	if (args.length <= 5 && (args[2] !== '--help' && args[2] !== '-h') && args[2] !== '--show-config') {
		process.stdout.write(`Insufficient arguments. Run --help for more information\r\n`);
		process.exit(0)
	} else {
		runHeadless(args)
	}
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow()
	}
});