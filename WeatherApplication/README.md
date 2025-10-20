# WeatherApplication
A simple weather application that uses the OpenWeather API to show current weather and an hourly forecast.

## Quick start

1. Sign up at https://openweathermap.org and create an API key.
2. Copy `config.example.js` to `config.js` in the project root:

	- On Windows PowerShell:

```powershell
cp .\config.example.js .\config.js
```

3. Open `config.js` and replace the placeholder with your API key:

```js
var OPENWEATHER_API_KEY = 'YOUR_REAL_KEY_HERE';
```

4. Open `index.html` in your browser (double-click or serve the folder).

Notes:

- Do NOT commit `config.js` to version control. It contains a secret API key.
- If you see the message "Invalid or missing OpenWeather API key" or a 401 error in the UI, visit https://openweathermap.org/faq#error401 for troubleshooting (expired key, wrong key, or account limits).

If you prefer not to create a file, you can also set `OPENWEATHER_API_KEY` from the browser console before using the app, for testing only:

```js
window.OPENWEATHER_API_KEY = 'YOUR_KEY_HERE';
```

Enjoy!
