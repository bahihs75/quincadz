'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'ar' | 'fr' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    home: 'الرئيسية',
    products: 'المنتجات',
    orders: 'طلباتي',
    profile: 'الملف الشخصي',
    cart: 'سلة التسوق',
    login: 'دخول',
    logout: 'تسجيل الخروج',
    settings: 'الإعدادات',
    save: 'حفظ',
    cancel: 'إلغاء',
    loading: 'جاري التحميل...',
    saving: 'جاري الحفظ...',
    save_changes: 'حفظ التغييرات',
    error_occurred: 'حدث خطأ',
    profile_updated: 'تم تحديث الملف الشخصي بنجاح',
    settings_saved: 'تم حفظ الإعدادات بنجاح',
    email_cannot_change: 'لا يمكن تغيير البريد الإلكتروني',
    full_name: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    user: 'مستخدم',
    to: 'إلى',
    invalid_hours: 'وقت الفتح يجب أن يكون قبل وقت الإغلاق',
    hours_help: 'اترك الحقول فارغة إذا كان المتجر مغلقاً في ذلك اليوم',
    browse_categories: 'تصفح حسب الفئة',
    all_products: 'جميع المنتجات',
    view_all: 'عرض الكل',
    price: 'السعر',
    unit: 'الوحدة',
    add_to_cart: 'أضف إلى السلة',
    out_of_stock: 'نفذ من المخزون',
    dashboard: 'لوحة التحكم',
    products_management: 'إدارة المنتجات',
    orders_management: 'إدارة الطلبات',
    store_settings: 'إعدادات المتجر',
    store_name: 'اسم المتجر',
    description: 'الوصف',
    address: 'العنوان',
    delivery_radius: 'نطاق التوصيل (كم)',
    opening_hours: 'ساعات العمل',
    admin_dashboard: 'لوحة تحكم الإدارة',
    stores_management: 'إدارة المتاجر',
    users_management: 'إدارة المستخدمين',
    categories_management: 'إدارة التصنيفات',
    platform_settings: 'إعدادات المنصة',
    language: 'اللغة',
    arabic: 'العربية',
    french: 'الفرنسية',
    english: 'الإنجليزية',
    no_image: 'لا توجد صورة',
    last_items: 'آخر {count} قطع',
    in_cart: 'في السلة',
    added_to_cart: 'تمت الإضافة إلى السلة',
  },
  fr: {
    home: 'Accueil',
    products: 'Produits',
    orders: 'Mes commandes',
    profile: 'Profil',
    cart: 'Panier',
    login: 'Connexion',
    logout: 'Déconnexion',
    settings: 'Paramètres',
    save: 'Enregistrer',
    cancel: 'Annuler',
    loading: 'Chargement...',
    saving: 'Enregistrement...',
    save_changes: 'Enregistrer les modifications',
    error_occurred: 'Une erreur est survenue',
    profile_updated: 'Profil mis à jour avec succès',
    settings_saved: 'Paramètres enregistrés avec succès',
    email_cannot_change: 'L\'email ne peut pas être modifié',
    full_name: 'Nom complet',
    email: 'Email',
    phone: 'Téléphone',
    user: 'Utilisateur',
    to: 'à',
    invalid_hours: 'L\'heure d\'ouverture doit être antérieure à l\'heure de fermeture',
    hours_help: 'Laissez vide si le magasin est fermé ce jour',
    browse_categories: 'Parcourir par catégorie',
    all_products: 'Tous les produits',
    view_all: 'Voir tout',
    price: 'Prix',
    unit: 'Unité',
    add_to_cart: 'Ajouter au panier',
    out_of_stock: 'Rupture de stock',
    dashboard: 'Tableau de bord',
    products_management: 'Gestion des produits',
    orders_management: 'Gestion des commandes',
    store_settings: 'Paramètres du magasin',
    store_name: 'Nom du magasin',
    description: 'Description',
    address: 'Adresse',
    delivery_radius: 'Rayon de livraison (km)',
    opening_hours: 'Heures d\'ouverture',
    admin_dashboard: 'Tableau de bord admin',
    stores_management: 'Gestion des magasins',
    users_management: 'Gestion des utilisateurs',
    categories_management: 'Gestion des catégories',
    platform_settings: 'Paramètres de la plateforme',
    language: 'Langue',
    arabic: 'Arabe',
    french: 'Français',
    english: 'Anglais',
    no_image: 'Aucune image',
    last_items: 'Derniers {count} articles',
    in_cart: 'dans le panier',
    added_to_cart: 'Ajouté au panier',
  },
  en: {
    home: 'Home',
    products: 'Products',
    orders: 'My Orders',
    profile: 'Profile',
    cart: 'Cart',
    login: 'Login',
    logout: 'Logout',
    settings: 'Settings',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading...',
    saving: 'Saving...',
    save_changes: 'Save Changes',
    error_occurred: 'An error occurred',
    profile_updated: 'Profile updated successfully',
    settings_saved: 'Settings saved successfully',
    email_cannot_change: 'Email cannot be changed',
    full_name: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    user: 'User',
    to: 'to',
    invalid_hours: 'Opening time must be before closing time',
    hours_help: 'Leave empty if the store is closed on that day',
    browse_categories: 'Browse by Category',
    all_products: 'All Products',
    view_all: 'View All',
    price: 'Price',
    unit: 'Unit',
    add_to_cart: 'Add to Cart',
    out_of_stock: 'Out of Stock',
    dashboard: 'Dashboard',
    products_management: 'Products Management',
    orders_management: 'Orders Management',
    store_settings: 'Store Settings',
    store_name: 'Store Name',
    description: 'Description',
    address: 'Address',
    delivery_radius: 'Delivery Radius (km)',
    opening_hours: 'Opening Hours',
    admin_dashboard: 'Admin Dashboard',
    stores_management: 'Stores Management',
    users_management: 'Users Management',
    categories_management: 'Categories Management',
    platform_settings: 'Platform Settings',
    language: 'Language',
    arabic: 'Arabic',
    french: 'French',
    english: 'English',
    no_image: 'No image',
    last_items: 'Last {count} items',
    in_cart: 'in cart',
    added_to_cart: 'Added to cart',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('fr')

  useEffect(() => {
    const saved = localStorage.getItem('quincadz_language') as Language
    if (saved && ['ar', 'fr', 'en'].includes(saved)) {
      setLanguage(saved)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('quincadz_language', language)
  }, [language])

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
