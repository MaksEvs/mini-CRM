export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String(error.code)
    if (code === '23503') {
      return 'Связанные данные не найдены или используются другими записями.'
    }
    if (code === '42501') {
      return 'У вас недостаточно прав для этого действия.'
    }
    if (code === '22023') {
      return 'Проверьте заполнение обязательных полей.'
    }
    if (code === 'P0002') {
      return 'Запрошенная запись не найдена или вам недоступна.'
    }
  }
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes('fetch')) {
      return 'Не удалось связаться с сервером. Проверьте интернет и попробуйте снова.'
    }
    return error.message
  }
  return 'Произошла непредвиденная ошибка. Попробуйте ещё раз.'
}
