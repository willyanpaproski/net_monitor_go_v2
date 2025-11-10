import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useI18n } from '../hooks/usei18n';

interface LanguageContextType {
    currentLanguage: string;
    changeLanguage: (language: string) => void;
    availableLanguages: string[];
    isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
    const { getCurrentLanguage, changeLanguage, getAvailableLanguages, isLoading } = useI18n();
    const [currentLanguage, setCurrentLanguage] = useState<string>('pt');

    useEffect(() => {
        const currentLang = getCurrentLanguage();
        setCurrentLanguage(currentLang);
    }, []);

    const handleLanguageChange = (language: string) => {
        changeLanguage(language);
        setCurrentLanguage(language);
    };

    const contextValue: LanguageContextType = {
        currentLanguage,
        changeLanguage: handleLanguageChange,
        availableLanguages: getAvailableLanguages(),
        isLoading
    };

    return React.createElement(
        LanguageContext.Provider,
        { value: contextValue },
        children
    );
};

export const useLanguageContext = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguageContext must be used within a LanguageProvider');
    }
    return context;
};