![GitHub stars](https://img.shields.io/github/stars/unixfox/proxy-sorry-google-recaptcha.svg?style=social) [![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/unixfox/proxy-sorry-google-recaptcha.svg)](https://hub.docker.com/r/unixfox/proxy-sorry-google-recaptcha) [![Docker Cloud Automated build](https://img.shields.io/docker/cloud/automated/unixfox/proxy-sorry-google-recaptcha.svg)](https://hub.docker.com/r/unixfox/proxy-sorry-google-recaptcha) ![GitHub package.json version](https://img.shields.io/github/package-json/v/unixfox/proxy-sorry-google-recaptcha.svg)
# How to use it?

1. Install NodeJS 12 or more and then `npm install`.
2. Pass your [anti-captcha](https://anti-captcha.com) client key using the environment variable `API_CLIENT_KEY` like so on Linux:
````
export API_CLIENT_KEY=myapikey
````
3. Launch the program using npm: `npm start`.
4. Import the file `ca/certs/ca.pem` into your browser/application.
5. Set your proxy settings to `http://localhost:8081`.