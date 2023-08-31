const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

const rapidAPIHeaders = {
  'Accept-Encoding': 'application/gzip',
  'X-RapidAPI-Key': '',//replace with your Key
  'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
};

const rapidAPIBaseUrl = 'https://google-translate1.p.rapidapi.com';

let translatedLanguage;

app.get('/', async (req, res) => {
  try {
    const lg = await getSupportedLanguages();
    res.render('index', { lg, translatedLanguage });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

app.post('/translate', async (req, res) => {
  const { lang1, lang2, lg1 } = req.body;

  try {
    const translation = await translateText(lg1, lang1.trim(), lang2.trim());
    translatedLanguage = translation.data.translations[0].translatedText;
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

async function getSupportedLanguages() {
  const response = await axios.get(`${rapidAPIBaseUrl}/language/translate/v2/languages`, {
    headers: rapidAPIHeaders
  });
  return response.data.data.languages;
}

/**
 * Translates text from one language to another using the Google Translate API.
 * @param {string} text - The text to be translated.
 * @param {string} sourceLang - The language of the text.
 * @param {string} targetLang - The language to translate the text into.
 * @returns {Promise<Object>} - A promise that resolves to the translated text.
 */
async function translateText(text, sourceLang, targetLang) {
  try {
    const params = new URLSearchParams();
    params.set('q', text);
    params.set('source', sourceLang);
    params.set('target', targetLang);

    const options = {
      method: 'POST',
      url: `${rapidAPIBaseUrl}/language/translate/v2`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        ...rapidAPIHeaders
      },
      data: params.toString(),
    };

    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Translation failed:', error);
    throw error;
  }
}

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
