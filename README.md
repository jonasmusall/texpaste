# TeXPaste
Input TeX code to get a live preview. Press ENTER or click the green checkmark to copy the result to the clipboard and use it in another application. ESCAPE or clicking the close button will discard the output.

Made with [Electron](https://www.electronjs.org/) and [KaTeX](https://katex.org/).

<img src="./docs/images/demo.png">

## Development
To build or run this app directly from the source code, you will need [Node.js](https://nodejs.org/). Clone or download the repository and use the following commands.

| Command        | Description                                                        |
| -------------- | ------------------------------------------------------------------ |
| `npm install`  | Installs the required dependencies.                                |
| `npm start`    | Launches the application.                                          |
| `npm run pack` | Packages the application (output is located in the "dist" folder). |
| `npm run dist` | Packages while also creating an installer.                         |

## Upcoming features
Settings such as colors and custom TeX macros.
