const AppConstants = {
  authFields: {
    email: 'email',
    password: 'password',
    confirmPassword: 'confirm_password',
    firstName: 'first_name',
    lastName: 'last_name',
    remember: 'remember',
    terms: 'terms',
  },
  inputTypes: {
    text: 'text',
    email: 'email',
    password: 'password',
    checkbox: 'checkbox',
  },
  authStateVariants: {
    success: 'success',
    warning: 'warning',
  },
  authMessageVariants: {
    error: 'error',
    notice: 'notice',
  },
  resetLinkStateQueryKey: 'state',
  resetLinkStates: {
    expired: 'expired',
  },
} as const

export default AppConstants