import config from '@config';
import { Translation } from '../common/types';
import { errorLog } from '../common/utils/logger';

const FREE_API = 'https://api-free.deepl.com';
const PRO_API = 'https://api.deepl.com';

/**
 * Call DeepL API to translate text
 *
 * @param texts
 * @param targetLang
 * @param sourceLang
 * @param deeplKey
 * @returns
 */
async function translateText(
  texts: string[],
  targetLang: string,
  sourceLang?: string,
  deeplKey?: string
): Promise<Translation[]> {
  const key = config.DEEPL_KEY ?? deeplKey;
  const DEEPL_URL = !key || key.endsWith(':fx') || key === '' ? FREE_API : PRO_API;
  try {
    const response = await fetch(`${DEEPL_URL}/v2/translate`, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: texts,
        target_lang: targetLang,
        source_lang: sourceLang,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.translations.map((translation: any) => ({
      text: translation.text,
      sourceLang: translation.detected_source_language,
    }));
  } catch (error) {
    errorLog(error, { description: 'Error translating with DeepL' });
    throw new Error('Failed to translate text');
  }
}

export default translateText;
