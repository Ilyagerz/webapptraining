const https = require('https');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'www.exercisedb.dev';
const GIFS_DIR = path.join(__dirname, '..', 'public', 'exercises', 'gifs');
const OUTPUT_JSON = path.join(__dirname, '..', 'data', 'custom-exercises.json');
const TEMP_JSON = path.join(__dirname, '..', 'data', 'custom-exercises.tmp.json');

// Мапп human: Давайте я подожду результат, сейчас видно что скрипт работает. Какое примерно время займет весь процесс?
