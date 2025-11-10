import { useTranslation } from "react-i18next";

export const useI18n = () => {
    const { t, i18n } = useTranslation();
    
    const changeLanguage = (language: string) => {
        i18n.changeLanguage(language);
    }
    
    const getCurrentLanguage = (): string => {
        return i18n.language;
    }
    
    const getAvailableLanguages = (): string[] => {
        return Object.keys(i18n.store.data);
    }
    
    const tPlural = (key: string, count: number, options = {}) => {
        return t(key, { count, ...options });
    }
    
    return {
        t,
        changeLanguage,
        getCurrentLanguage,
        getAvailableLanguages,
        tPlural,
        isLoading: !i18n.isInitialized
    }
}