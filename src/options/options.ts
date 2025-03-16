import config from '@config';
import { errorLog } from '../common/utils/logger';
import { Store, Languages } from '../common/constants';
import StorageCtrl from '../common/Storage';
import I18n from '../common/utils/language';

/**
 * Initialize translations
 */
const initTranslations = () => {
  // Update elements with data-viva-i18n attribute
  document.querySelectorAll('[data-viva-i18n]').forEach((element) => {
    const key = element.getAttribute('data-viva-i18n');
    if (key) {
      if (element instanceof HTMLInputElement) {
        element.placeholder = I18n.t(key);
      } else {
        element.innerHTML = I18n.t(key);
      }
    }
  });
};

// Show or hide environment variable notice
const updateEnvNotice = (key: string, envValue: string | undefined) => {
  const container = document.getElementById(`${key}-container`);
  if (container) {
    if (envValue) {
      // Replace the input with text showing it's defined in env
      container.innerHTML = `
        <label data-viva-i18n="settings.api_keys.${key}">${I18n.t(`settings.api_keys.${key}`)}</label>
        <div class="env-notice" data-viva-i18n="settings.api_keys.env_defined">
          ${I18n.t('settings.api_keys.env_defined')}
        </div>
      `;
    }
  }
};

/**
 * Save the Gladia API key to storage
 */
const saveGladiaKey = async () => {
  const gladiaKey = (document.getElementById('gladia-key') as HTMLInputElement)?.value;

  // Only save keys if they're not defined in environment variables
  if (!config.GLADIA_KEY && gladiaKey?.length > 0) {
    await StorageCtrl.setItem(Store.GLADIA_KEY, gladiaKey);
  } else {
    await StorageCtrl.removeItem(Store.GLADIA_KEY);
  }
};

/**
 * Save the Deepl API key to storage
 */
const saveDeeplKey = async () => {
  const deeplKey = (document.getElementById('deepl-key') as HTMLInputElement)?.value;

  // Only save keys if they're not defined in environment variables
  if (!config.DEEPL_KEY && deeplKey?.length > 0) {
    await StorageCtrl.setItem(Store.DEEPL_KEY, deeplKey);
  } else {
    await StorageCtrl.removeItem(Store.DEEPL_KEY);
  }
};

/**
 * Save the OpenAI API key to storage
 */
const saveOpenaiKey = async () => {
  const openaiKey = (document.getElementById('openai-key') as HTMLInputElement)?.value;

  // Only save keys if they're not defined in environment variables
  if (!config.OPENAI_KEY && openaiKey?.length > 0) {
    await StorageCtrl.setItem(Store.OPENAI_KEY, openaiKey);
  } else {
    await StorageCtrl.removeItem(Store.OPENAI_KEY);
  }
};

/**
 * Save the target language to storage
 */
const saveTargetLanguage = async () => {
  const targetLanguage = (document.getElementById('target-language') as HTMLSelectElement).value;

  // Save target language and update translations
  await StorageCtrl.setItem(Store.LANGUAGE, targetLanguage);
};

/**
 * Save the options to storage
 */
const saveOptions = (storeKey: string) => {
  const saveFn = (fn: () => Promise<void>) => async () => {
    const status = document.getElementById('status');
    try {
      await fn();
      if (status) {
        status.textContent = I18n.t('settings.saved');
        setTimeout(() => {
          status.textContent = '';
        }, 2000);
      }
    } catch (error) {
      errorLog(error);
      if (status) {
        status.textContent = I18n.t('settings.error');
      }
    }
  };

  switch (storeKey) {
    case Store.GLADIA_KEY:
      return saveFn(saveGladiaKey);
    case Store.DEEPL_KEY:
      return saveFn(saveDeeplKey);
    case Store.OPENAI_KEY:
      return saveFn(saveOpenaiKey);
    case Store.LANGUAGE:
      return saveFn(saveTargetLanguage);
  }
  throw new Error(`Unknown store key: ${storeKey}`);
};

// Initialize options from storage and set up event listeners
const initializeOptionsCallbacks = async () => {
  const gladiaInput = document.getElementById('gladia-key') as HTMLInputElement;
  const deeplInput = document.getElementById('deepl-key') as HTMLInputElement;
  const openaiInput = document.getElementById('openai-key') as HTMLInputElement;
  const targetLanguageSelect = document.getElementById('target-language') as HTMLSelectElement;

  // Update environment notices and input values
  updateEnvNotice('gladia', config.GLADIA_KEY);
  updateEnvNotice('deepl', config.DEEPL_KEY);
  updateEnvNotice('openai', config.OPENAI_KEY);

  // Initialize translations
  initTranslations();

  // Set stored values only if not defined in environment
  if (!config.GLADIA_KEY && gladiaInput) {
    const gladiaKey = StorageCtrl.getItem(Store.GLADIA_KEY);
    if (gladiaKey) {
      gladiaInput.value = gladiaKey;
    }
    gladiaInput.addEventListener('change', saveOptions(Store.GLADIA_KEY));
  }

  if (!config.DEEPL_KEY && deeplInput) {
    const deeplKey = StorageCtrl.getItem(Store.DEEPL_KEY);
    if (deeplKey) {
      deeplInput.value = deeplKey;
    }
    deeplInput.addEventListener('change', saveOptions(Store.DEEPL_KEY));
  }

  if (!config.OPENAI_KEY && openaiInput) {
    const openaiKey = StorageCtrl.getItem(Store.OPENAI_KEY);
    if (openaiKey) {
      openaiInput.value = openaiKey;
    }
    openaiInput.addEventListener('change', saveOptions(Store.OPENAI_KEY));
  }

  // Set the saved language in the select
  const savedLanguage = StorageCtrl.getItem(Store.LANGUAGE) || Languages.EN;
  targetLanguageSelect.value = savedLanguage;
  targetLanguageSelect.addEventListener('change', saveOptions(Store.LANGUAGE));
};

/* Initialize the extension options page */
const initExtensionOptions = async () => {
  await I18n.init();
  await StorageCtrl.init();
  await initializeOptionsCallbacks();
};
document.addEventListener('DOMContentLoaded', initExtensionOptions);
