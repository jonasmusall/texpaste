![texpaste logo](/docs/images/logo-light.svg#gh-dark-mode-only)
![texpaste logo](/docs/images/logo-dark.svg#gh-light-mode-only)

Input TeX code to get a live preview. Press ENTER or click the green checkmark to copy the result to the clipboard and use it in another application. ESCAPE or clicking the close button will discard the output. Custom macros can be created in the settings.

Made with [Electron](https://www.electronjs.org/) and [KaTeX](https://katex.org/).

![Demonstration video](/docs/images/live_demo.gif)

## Installation
Download options for Windows and Linux can be found in the latest [release](https://github.com/jonasmusall/texpaste/releases/latest). If you are using macOS, you will have to run this app from source. Listed below are the different kinds of files available to run or install texpaste.

| File                                  | Platform | Type                                            |
| ------------------------------------- | -------- | ----------------------------------------------- |
| `texpaste_(version)_linux.AppImage`   | Linux    | Standalone app                                  |
| `texpaste_(version)_linux.deb`        | Linux    | Installable package for Debian                  |
| `texpaste_(version)_linux.tar.gz`     | Linux    | Archive containing executable and program files |
| `texpaste_(version)_win.zip`          | Windows  | Archive containing executable and program files |
| `texpaste_(version)_win_portable.exe` | Windows  | Standalone app (slow startup)                   |
| `texpaste_(version)_win_setup.exe`    | Windows  | Installation wizard                             |

⚠️ *Windows users will be presented with a security warning on first launch. This is because I cannot afford a certificate to sign my code. You can circumvent the warning by clicking on "More info" and "Run anyway".*

## Development
To build or run this app directly from the source code, you will need [Node.js](https://nodejs.org/) with npm v7 or later. Clone or download the repository and use the following commands.

| Command        | Description                                                        |
| -------------- | ------------------------------------------------------------------ |
| `npm install`  | Installs the required dependencies.                                |
| `npm start`    | Launches the application.                                          |
| `npm run pack` | Packages the application (output is located in the "dist" folder). |
| `npm run dist` | Packages while also creating an installer.                         |

## Upcoming features
Autocomplete. Feel free to suggest something or file a bug report on the [issue tracker](https://github.com/jonasmusall/texpaste/issues).
