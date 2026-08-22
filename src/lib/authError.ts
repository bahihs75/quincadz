export function getAuthErrorMessage(error: unknown, fallback: string) {
  const rawMessage = error instanceof Error
    ? error.message
    : typeof error === 'object' && error !== null && 'message' in error
      ? String(error.message)
      : ''

  const normalizedMessage = rawMessage.toLowerCase()

  if (normalizedMessage.includes('failed to fetch') || normalizedMessage.includes('load failed') || normalizedMessage.includes('network')) {
    return 'تعذر الاتصال بخدمة تسجيل الدخول. تحقق من اتصال الإنترنت وحاول مرة أخرى.'
  }

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'يرجى تأكيد بريدك الإلكتروني من الرسالة التي أرسلناها إليك أولاً.'
  }

  return rawMessage || fallback
}
