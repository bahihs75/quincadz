'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const handleChange = (lang: 'ar' | 'fr' | 'en') => {
    setLanguage(lang)
  }

  return (
    <div className="language-switcher">
      <label>
        <input
          type="radio"
          name="language"
          value="ar"
          checked={language === 'ar'}
          onChange={() => handleChange('ar')}
        />
        <span>العربية</span>
      </label>
      <label>
        <input
          type="radio"
          name="language"
          value="fr"
          checked={language === 'fr'}
          onChange={() => handleChange('fr')}
        />
        <span>Français</span>
      </label>
      <label>
        <input
          type="radio"
          name="language"
          value="en"
          checked={language === 'en'}
          onChange={() => handleChange('en')}
        />
        <span>English</span>
      </label>
      <span className="selection"></span>
    </div>
  )
}
