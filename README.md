# MERLOT Marketplace Frontend

The MERLOT Marketplace Frontend is the main interaction point for users with the merlot marketplace.

It provides an easy-to-use GUI for communication with the MERLOT backend services, with features such as enrolled organisation viewing/editing, user listing, service offering viewing/editing and contracting.

## Development

To start development for the MERLOT marketplace, please refer to [this document](https://github.com/merlot-education/.github/blob/main/Docs/DevEnv.md)
to set up a local WSL development environment of all relevant services.
This is by far the easiest way to get everything up and running locally.

## Structure


    ├── src/app
    │   ├── containers    # shared layout throughout all frontend components
    │   ├── icons         # selected icon sets
    │   ├── sdwizard      # self-description creation wizard based on XFSC Self-Description Wizard Frontend
    │   ├── services      # shared services for interacting with the MERLOT backend
    │   ├── views         # Frontend components for all GUI functionality 
    │   ├── views         # MERLOT specific extension of the aforementioned SD-Wizard


## Dependencies
- [MERLOT Backend Services](https://github.com/merlot-education/localdeployment)

## Build

To build this frontend you need to provide a GitHub read-only token in order to be able to fetch maven packages from
GitHub. You can create this token at https://github.com/settings/tokens with at least the scope "read:packages".
Then set up your ~/.npmrc file as follows:

    @merlot-education:registry=https://npm.pkg.github.com
    //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN

Afterward you can initialize the frontend with

    npm install

## Run

    npm start

Once the frontend is running, you can access it at http://localhost:4200/#/start .

## Deploy (Docker)

The MERLOT marketplace frontend can be deployed as part of the full MERLOT docker stack at
[localdeployment](https://github.com/merlot-education/localdeployment).

## Deploy (Helm)
TODO