# Sympt [WIP]

## Local Setup
### Requirements

- Node 12

### Setting up

1. Copy the private service accounts file into the 'server' folder.
2. Run `npm run setup:all` from root directory.
3. Run `npm start` to start the server and app concurrently.



## Scripts
### Root
| Script                      | Description                                                                 |
| --------------------------- | --------------------------------------------------------------------------- |
| `npm run setup:all`         | Reset and rebuild both server and web directories.                          |
| `npm run setup:server`      | Reset and rebuild server.                                                   |
| `npm run setup:web`         | Reset and rebuild web.                                                      |
| `npm run lint:check`        | Check linting for both server and app.                                      |
| `npm run lint:fix`          | Fix linting that can be automatically changed for both server and app.      |
| `npm start`                 | Start both server and app concurrently.                                     |

### Server *(cd server)*
| Script                      | Description                                                                 |
| --------------------------- | --------------------------------------------------------------------------- |
| `npm run setup`             | Reset and build server.                                                     |
| `npm run build`             | Compile TS into JS.                                                         |
| `npm run lint:check`        | Check linting for server.                                                   |
| `npm run lint:fix`          | Fix auto-fixable linting for server.                                        |
| `npm start`                 | Compile and start server.                                                   |

### Web *(cd web)*
| Script                      | Description                                                                 |
| --------------------------- | --------------------------------------------------------------------------- |
| `npm run setup`             | Reset and build webapp.                                                     |
| `npm run build`             | Compile TS into JS.                                                         |
| `npm run lint:check`        | Check linting for webapp.                                                   |
| `npm run lint:fix`          | Fix auto-fixable linting for webapp.                                        |
| `npm start`                 | Compile and start webapp.                                                   |
