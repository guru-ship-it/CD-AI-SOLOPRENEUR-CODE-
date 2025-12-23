
[1m[37m===[39m Deploying to 'antigravitycompliancedeskai'...[22m

[36m[1mi [22m[39m deploying [1mfunctions, hosting[22m
Running command: npm --prefix "$RESOURCE_DIR" run build

> build
> tsc

[32m[1m+ [22m[39m [32m[1mfunctions:[22m[39m Finished running [1mpredeploy[22m script.
[36m[1mi  functions:[22m[39m preparing codebase [1mdefault[22m for deployment
[36m[1mi  functions:[22m[39m ensuring required API [1mcloudfunctions.googleapis.com[22m is enabled...
[36m[1mi  functions:[22m[39m ensuring required API [1mcloudbuild.googleapis.com[22m is enabled...
[36m[1mi  artifactregistry:[22m[39m ensuring required API [1martifactregistry.googleapis.com[22m is enabled...
[33m[1m! [22m[39m [1m[33mfunctions: [39m[22mpackage.json indicates an outdated version of firebase-functions. Please upgrade using [1mnpm install --save firebase-functions@latest[22m in your functions directory.
[33m[1m! [22m[39m [1m[33mfunctions: [39m[22mPlease note that there will be breaking changes when you upgrade.
[36m[1mi  functions:[22m[39m Loading and analyzing source code for codebase default to determine what to deploy
[36m[1mi  functions:[22m[39m You are using a version of firebase-functions SDK (4.9.0) that does not have support for the newest Firebase Extensions features. Please update firebase-functions SDK to >=5.1.0 to use them correctly
Serving at port 8623


[1m[31mError:[39m[22m User code failed to load. Cannot determine backend specification. Timeout after 10000. See https://firebase.google.com/docs/functions/tips#avoid_deployment_timeouts_during_initialization'

