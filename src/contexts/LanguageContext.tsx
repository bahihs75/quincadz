'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'ar' | 'fr' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
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
    remember_me: 'تذكرني',
    forgot_password: 'نسيت كلمة المرور؟',
    create_account: 'إنشاء حساب جديد',
    choose_location: 'تحديد الموقع',
    detect_my_location: 'تحديد موقعي الحالي',
    wilaya: 'الولاية',
    baladiya: 'البلدية',
    search_baladiya: 'ابحث عن البلدية',
    password: 'كلمة المرور',
    select_wilaya: 'اختر الولاية',
    detecting: 'جاري التحديد...',
    geolocation_not_supported: 'المتصفح لا يدعم تحديد الموقع',
    location_wilaya_not_found: 'لم نتمكن من تحديد الولاية',
    location_baladiya_not_found: 'تم تحديد الولاية، الرجاء اختيار البلدية يدوياً',
    location_error: 'حدث خطأ أثناء تحديد الموقع',
    location_failed: 'فشل تحديد الموقع',
    location_permission_denied: 'الرجاء السماح بالوصول إلى الموقع',
    location_unavailable: 'خدمة الموقع غير متوفرة',
    location_timeout: 'انتهت مهلة تحديد الموقع',
    show_map: "عرض الخريطة",
    hide_map: "إخفاء الخريطة",
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
    remember_me: 'Se souvenir de moi',
    forgot_password: 'Mot de passe oublié ?',
    create_account: 'Créer un compte',
    choose_location: 'Choisir votre emplacement',
    detect_my_location: 'Détecter ma position',
    wilaya: 'Wilaya',
    baladiya: 'Baladiya',
    search_baladiya: 'Rechercher une baladiya',
    password: 'Mot de passe',
    select_wilaya: 'Choisir wilaya',
    detecting: 'Détection...',
    geolocation_not_supported: 'La géolocalisation n\'est pas supportée',
    location_wilaya_not_found: 'Wilaya non trouvée',
    location_baladiya_not_found: 'Wilaya trouvée, veuillez choisir la baladiya',
    location_error: 'Erreur de localisation',
    location_failed: 'Échec de la localisation',
    location_permission_denied: 'Veuillez autoriser l\'accès à la localisation',
    location_unavailable: 'Service de localisation indisponible',
    location_timeout: 'Délai de localisation dépassé',
    show_map: "Afficher la carte",
    hide_map: "Cacher la carte",
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
    remember_me: 'Remember me',
    forgot_password: 'Forgot password?',
    create_account: 'Create account',
    choose_location: 'Choose your location',
    detect_my_location: 'Detect my location',
    wilaya: 'Wilaya',
    baladiya: 'Baladiya',
    search_baladiya: 'Search baladiya',
    password: 'Password',
    select_wilaya: 'Select wilaya',
    detecting: 'Detecting...',
    geolocation_not_supported: 'Geolocation not supported',
    location_wilaya_not_found: 'Wilaya not found',
    location_baladiya_not_found: 'Wilaya found, please select baladiya',
    location_error: 'Location error',
    location_failed: 'Location failed',
    location_permission_denied: 'Please allow location access',
    location_unavailable: 'Location service unavailable',
    location_timeout: 'Location timeout',
    show_map: "Show map",
    hide_map: "Hide map",
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

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[language][key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v))
      })
    }
    return text
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
