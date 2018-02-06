const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// ommfg gui
function runGUI() {

}


// 4pr0z
function runHeadless(args) {
	mainWindow = new BrowserWindow({width: 800, height: 600});

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'headless.html'),
		protocol: 'file:',
		slashes: true
	}));

	mainWindow.on('closed', () => {
		mainWindow = null
	})
}


function createWindow() {
	let args = process.argv;
	if (args.length <= 2) {
		runGUI(args)
	} else {
		runHeadless(args)
	}
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
})

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow()
	}
})