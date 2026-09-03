# GrabTV Environments
This repo maintains all active versions that are deployed to different environments. 

## Environments

- Azure (Dev)
- Azure (Test)
- Azure (Prod)

## How to update the Test and Production environments

- Each of the environments is managed by an individual yaml file in its respective `azure/{env_name}/main.yml` file.
- Unless there is a specific need to change what is on the enviroment, the dev `main.yml` should never be editied because the versions incrememnt automatically upon every merge to the `develop` branch of the backend and mobile repos
  - The code for the events server, used to interact with a connected TV from your mobile device resides inside the backend repository. Modifying it and merging into the develop branch of the backend repo automatically handles deploying it separately from the actual API (each are its own Azure container app).
- To update each of the mobile remote, event server, and API versions, simply update the version number to the version number you want to deploy to the environment

### Example Dev environment `main.yaml`

```
environment: Development

services:
  - name: grabtv-api
    version: "0.232.0"
  - name: grabtv-events
    version: "0.131.0"
  - name: grabtv-remote
    version: "0.253.0"
```

### Example Test environment `main.yml`
```
environment: Test

services:
  - name: grabtv-api
    version: "0.220.0" # <- note that the test version is lower than the dev version
  - name: grabtv-events
    version: "0.131.0"
  - name: grabtv-remote
    version: "0.230.0" # <- note that the test version is lower than the dev vcersion
```

- As can be seen, the test environment's yaml file shows the API is at version `0.220.0` and the remote (mobile companion & admin UI) is at version `0.230.0`.
- To bring test in line with dev, simply update the test `main.yml` to match the dev `main.yml` which is showing the latest API is version `0.232.0` and the latest remote is `0.253.0`
- Once the file is edited and committed to the `main` branch of this repo, a GitHub action triggers and the deploy automatically completes for the intended environment.
- A similar process can be employed to update Production using its `main.yml` file.
- Since version numbers are sequential, any version `0.1.0` to `0.{most current version.0` **will** work if you were to want to go backwared for any reason. Typically, you'll only want to move forward for Test and Prod but there is no stopping you from moving forward/backward on dev manually as well. Just be aware with dev, new merges will force a new/higher version overriding the manually edited user version.
- *NOTE:* The test and production environments _never_ automatically update without going through this process as outlined per environment whereas the dev environment _always_ updates automatically with no user intervention other than merging new code to the development branch of the respective functionality repository (backend or mobile repositories).
