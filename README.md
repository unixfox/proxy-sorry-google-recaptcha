# How to use it?

1. Install NodeJS 12 or more and then `npm install`.
2. Pass your [anti-captcha](https://anti-captcha.com) client key using the environment variable `API_CLIENT_KEY` like so on Linux:
````
export API_CLIENT_KEY=myapikey
````
3. Launch the program using npm: `npm start`.
4. Import the file `ca/certs/ca.pem` into your browser/application.
5. Set your proxy settings to `http://localhost:8081`.