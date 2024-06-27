# MERLOT Marketplace Frontend

The MERLOT Marketplace Frontend is the main interaction point for users with the merlot marketplace.

It provides an easy-to-use GUI for communication with the MERLOT backend services, with features such as enrolled organisation viewing/editing, user listing, service offering viewing/editing and contracting. It does not contain any major logic or data processing itself and hence depends on a running backend.

## Development

To start development for the MERLOT marketplace, please refer to [this document](https://github.com/merlot-education/.github/blob/main/Docs/DevEnv.md)
to set up a local WSL development environment of all relevant services.
This is by far the easiest way to get everything up and running locally.

## Structure


    ├── src/app
    │   ├── containers        # shared layout throughout all frontend components
    │   ├── icons             # selected icon sets
    │   ├── sdwizard          # self-description creation wizard based on XFSC Self-Description Wizard Frontend
    │   ├── services          # shared services for interacting with the MERLOT backend
    │   ├── views             # Frontend components for all GUI functionality 
    │   ├── wizard-extension  # MERLOT specific extension of the aforementioned SD-Wizard


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

## Run E2E Tests

    npx cypress open

Once run, a new window will open, presenting you with the option to select E2E tests and run them on your local machine. The tests will by default be performed against the dev-instance of the MERLOT marketplace at https://marketplace.dev.merlot-education.eu/ and will need human interaction during the login steps for presenting a credential.

## Deploy (Docker)

The MERLOT marketplace frontend can be deployed as part of the full MERLOT docker stack at
[localdeployment](https://github.com/merlot-education/localdeployment).

## Deploy (Helm)
### Prerequisites
Before you begin, ensure you have Helm installed and configured to the desired Kubernetes cluster.

### Setting Up Minikube (if needed)
If you don't have a Kubernetes cluster set up, you can use Minikube for local development. Follow these steps to set up Minikube:

1. **Install Minikube:**
   Follow the instructions [here](https://minikube.sigs.k8s.io/docs/start/) to install Minikube on your machine.

2. **Start Minikube:**
   Start Minikube using the following command:
   ```
   minikube start
   ```
3. **Verify Minikube Status:**
   Check the status of Minikube to ensure it's running:   
   ```
   minikube status
   ```

### Usage
1. **Clone the Repository:**
   Clone the repository containing the Helm chart:
   ```
   git clone https://github.com/merlot-education/gitops.git
   ```

2. **Navigate to the Helm Chart:**
   Change into the directory of the Helm chart:
   ```
   cd gitops/charts/marketplace
   ```

3. **Customize Values (if needed):**
   If you need to customize any values, modify the values.yaml file in this directory according to your requirements. This file contains configurable parameters such as image repository, tag, service ports, etc. An example containing the values used in Merlot dev environment is available in gitops/environments/dev/marketplace.yaml

4. **Install the Chart:**
   Run the following command to install the chart from the local repository:
   ```
   helm install [RELEASE_NAME] .
   ```
   Replace [RELEASE_NAME] with the name you want to give to this deployment. In this case it can be marketplace.

5. **Verify Deployment:**
   Check the status of your deployment using the following commands:
   ```
   kubectl get pods
   kubectl get services
   ```

### Additional Resources 
- [Helm Documentation](https://helm.sh/docs/)
