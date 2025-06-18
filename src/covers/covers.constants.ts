export enum Covers {
  LOGIN = 'login',
  RESET_PASSWORD = 'reset_password',
  REQUEST_RESET_PASSWORD = 'request_reset_password',
}

export enum CoverKeys {
  LOGIN = 'login_page_image',
  RESET_PASSWORD = 'reset_password_page_image',
  REQUEST_RESET_PASSWORD = 'request_reset_password_image',
}

export const LOGIN_COVER_COLLECTIONS = {
  login: {
    maxSize: 100 * 1024 * 1024,
    maxCount: 2,
    required: true,
    accepteds: ['image/*'],
  },
};

export const RESET_PASSWORD_COLLECTIONS = {
  reset_password: {
    maxSize: 100 * 1024 * 1024,
    maxCount: 2,
    required: true,
    accepteds: ['image/*'],
  },
};

export const REQUEST_RESET_PASSWORD_COLLECTIONS = {
  forgot_password: {
    maxSize: 100 * 1024 * 1024,
    maxCount: 2,
    required: true,
    accepteds: ['image/*'],
  },
};
