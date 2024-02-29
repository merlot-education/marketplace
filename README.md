# Merlot Marketplace

## SonarQube
[![Quality Gate Status](https://sonarqube.common.merlot-education.eu/api/project_badges/measure?project=merlot-education_marketplace_AYdG6VNrMxRMOCkiKtK_&metric=alert_status&token=sqb_629d7643396f780c99c0789cd0d30315336f4abc)](https://sonarqube.common.merlot-education.eu/dashboard?id=merlot-education_marketplace_AYdG6VNrMxRMOCkiKtK_) 
[![Bugs](https://sonarqube.common.merlot-education.eu/api/project_badges/measure?project=merlot-education_marketplace_AYdG6VNrMxRMOCkiKtK_&metric=bugs&token=sqb_629d7643396f780c99c0789cd0d30315336f4abc)](https://sonarqube.common.merlot-education.eu/dashboard?id=merlot-education_marketplace_AYdG6VNrMxRMOCkiKtK_)
[![Code Smells](https://sonarqube.common.merlot-education.eu/api/project_badges/measure?project=merlot-education_marketplace_AYdG6VNrMxRMOCkiKtK_&metric=code_smells&token=sqb_629d7643396f780c99c0789cd0d30315336f4abc)](https://sonarqube.common.merlot-education.eu/dashboard?id=merlot-education_marketplace_AYdG6VNrMxRMOCkiKtK_)
[![Lines of Code](https://sonarqube.common.merlot-education.eu/api/project_badges/measure?project=merlot-education_marketplace_AYdG6VNrMxRMOCkiKtK_&metric=ncloc&token=sqb_629d7643396f780c99c0789cd0d30315336f4abc)](https://sonarqube.common.merlot-education.eu/dashboard?id=merlot-education_marketplace_AYdG6VNrMxRMOCkiKtK_)
[![Reliability Rating](https://sonarqube.common.merlot-education.eu/api/project_badges/measure?project=merlot-education_marketplace_AYdG6VNrMxRMOCkiKtK_&metric=reliability_rating&token=sqb_629d7643396f780c99c0789cd0d30315336f4abc)](https://sonarqube.common.merlot-education.eu/dashboard?id=merlot-education_marketplace_AYdG6VNrMxRMOCkiKtK_)
[![Security Hotspots](https://sonarqube.common.merlot-education.eu/api/project_badges/measure?project=merlot-education_marketplace_AYdG6VNrMxRMOCkiKtK_&metric=security_hotspots&token=sqb_629d7643396f780c99c0789cd0d30315336f4abc)](https://sonarqube.common.merlot-education.eu/dashboard?id=merlot-education_marketplace_AYdG6VNrMxRMOCkiKtK_)

## First checkout
Per the Github documentation, available [here](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry), a personal access token (classic) is needed to authenticate into the GitHub Packages Registry, where some packages needed by this project are stored.
It's necessary to follow that documentation and create a token with at least a read:packages scope, and then place it in a .npmrc file using this format:
```
@merlot-education:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<personal_access_token_here>
```

* `npm install`
* `ng update`

## Run
* `ng serve`

http://localhost:4200/#/start 
