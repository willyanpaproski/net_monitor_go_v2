import { useLanguageContext } from '../contexts/LanguageContext';
import { useI18n } from '../hooks/usei18n';

export default function LanguageSelector() {
    const { t } = useI18n();
    const { currentLanguage, changeLanguage } = useLanguageContext();
    
    const languages = [
        { code: 'pt', name: t('languageSelector.pt') || 'Português', flag: '🇧🇷' },
        { code: 'en', name: t('languageSelector.en') || 'English', flag: '🇺🇸' },
        { code: 'es', name: t('languageSelector.es') || 'Español', flag: '🇪🇸' }
    ];

    const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

    const handleLanguageSelect = (languageCode: string) => {
        changeLanguage(languageCode);
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: 0,
            position: 'absolute'
        }}>
            <div style={{ marginRight: '10px', marginTop: '3px' }}>{currentLang.flag}</div>
            <div style={{
                padding: '3px',
                backgroundColor: '#1a1a1a',
                fontSize: '0.5rem',
                borderRadius: '100px'
            }}>
                {languages.map((language) => (
                    <>
                        <button onClick={() => handleLanguageSelect(language.code)} style={{ backgroundColor: currentLang.code === language.code ? '#121212' : 'transparent' }}>
                            {language.code.toUpperCase()}
                        </button>
                    </>
                ))}
            </div>
        </div>
    );
}