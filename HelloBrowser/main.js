const { app, session, BrowserView, BrowserWindow, ipcMain } = require('electron')
const installExtension = require('electron-devtools-installer').default
const {
    EMBER_INSPECTOR, REACT_DEVELOPER_TOOLS,
    BACKBONE_DEBUGGER, JQUERY_DEBUGGER,
    ANGULARJS_BATARANG, VUEJS_DEVTOOLS,
    REDUX_DEVTOOLS, REACT_PERF,
    CYCLEJS_DEVTOOL, MOBX_DEVTOOLS,
    APOLLO_DEVELOPER_TOOLS,
} = require('electron-devtools-installer')

let ctx = {
    win: null,
    winWidth: 0,
    winHeight: 0,
    winPaddingTop: 80,

    browserView: null,
    browserWidth: 420,
    browserHeight: 0,
    // viewConsole: null,

    devtoolsView: null,
    devtoolsWidth: 0,
    devtoolsHeight: 0,

    simulatorWidth: 0,
    simulatorHeight: 0,
    simulatorTop: 40,
    simulatorLeft: 40,
}

function createWindow() {
    // 创建浏览器窗口
    const win = ctx.win = new BrowserWindow({
        darkTheme: true,
        webPreferences: {
            nodeIntegration: true,
            // webviewTag: true,
            // diableBlinkFeatures: true
        },
    });

    win.on('show', function () {
        const browserView = ctx.browserView = new BrowserView({
            webPreferences: {
                // scaleFactor: 0.5,
                preload: __dirname + '/preload.js',
                // webSecurity: false,
                // enableRemoteModule: true,
                nodeIntegration: true,
                // webviewTag: true
            }
        })
        const devtoolsView = ctx.devtoolsView = new BrowserView({darkTheme: true})

        win.setBrowserView(browserView)
        win.addBrowserView(devtoolsView)
        setBounds()

        // browserView.webContents.loadURL('http://localhost:8899/')
        // browserView.webContents.loadURL(`file://${__dirname}/view.html`)
        // browserView.webContents.loadFile('view.html')
        // browserView.setBackgroundColor('#222222')

        browserView.webContents.setUserAgent("Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko; googleweblight) Chrome/38.0.1025.166 Mobile Safari/535.19");
        browserView.webContents.loadFile('start.html')

        browserView.webContents.enableDeviceEmulation({
            screenPosition: 'mobile',
            screenSize: { width: ctx.simulatorWidth, height: ctx.simulatorHeight },
            deviceScaleFactor: 2,
            viewPosition: { x: 0, y: 0 },
            viewSize: { width: ctx.simulatorWidth, height: ctx.simulatorHeight },
            fitToView: false
        });
        browserView.webContents.debugger.attach('1.3');
        browserView.webContents.debugger.sendCommand('Emulation.setEmitTouchEventsForMouse', { enabled: true });
        browserView.webContents.debugger.sendCommand('Emulation.setTouchEmulationEnabled', {
            enabled: true,
            configuration: 'mobile',
        });

        // 打开开发者工具
        // browserView.webContents.openDevTools({ mode: 'undocked' });
        devtoolsView.setBackgroundColor('#222222')
        browserView.webContents.setDevToolsWebContents(devtoolsView.webContents)
        browserView.webContents.openDevTools({ mode: 'detach' });

        // browserView.webContents.executeJavaScript(`
        // console.log('12345')
        // window.test = "test"
        // `, true)
        //     .then((result) => {
        //         console.log(result) // Will be the JSON object from the fetch call
        //     })


    })

    win.maximize()
    win.show()
    // win.on('closed', () => {
    //     win = null
    // })

    // 并且为你的应用加载index.html
    win.loadFile("main.html")

    // 打开开发者工具
    // win.webContents.openDevTools({ mode: 'detach' });
}

function setBounds() {
    // console.log(ctx.win.getSize(), ctx.win.getContentSize())
    const [winWidth, winHeight] = ctx.win.getContentSize()
    ctx = { ...ctx, winWidth, winHeight }
    ctx.browserHeight = winHeight - ctx.winPaddingTop

    let width = ctx.simulatorWidth = ctx.browserWidth - ctx.simulatorLeft * 2
    let height = ctx.simulatorHeight = ctx.browserHeight - ctx.simulatorTop * 2
    ctx.browserView.setBounds({ x: ctx.simulatorLeft, y: ctx.winPaddingTop + ctx.simulatorTop, width, height })

    width = ctx.devtoolsWidth = winWidth - ctx.browserWidth
    height = ctx.devtoolsHeight = ctx.browserHeight
    ctx.devtoolsView.setBounds({ x: ctx.browserWidth, y: ctx.winPaddingTop, width, height })
}

// Electron会在初始化完成并且准备好创建浏览器窗口时调用这个方法
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
    installExtension(VUEJS_DEVTOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));

    // const extensions = session.getAllExtensions
    // const installed = extensions.hasOwnProperty('devtron')
    // console.log(extensions, installed)
}).then(createWindow);

//当所有窗口都被关闭后退出
app.on("window-all-closed", () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('asynchronous-message', (event, arg) => {
    console.log('asynchronous-message:', arg) // prints "ping"
    event.reply('asynchronous-reply', 'pong')
})

ipcMain.on('synchronous-message', (event, arg) => {
    if (arg === 'reload') {
        console.log('synchronous-message:', arg) // prints "reload"
        ctx.browserView.webContents.reload()
        event.returnValue = true
    }
    else {
        console.log('synchronous-message:', arg) // prints "ping"
        event.returnValue = 'pong'
    }
})

// 您可以把应用程序其他的流程写在在此文件中
// 代码 也可以拆分成几个文件，然后用 require 导入。
