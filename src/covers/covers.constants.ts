export enum Cover {
  LOGIN = 'login_page_image',
  PASSWORD_RESET = 'password_reset_page_image',
  REQUEST_PASSWORD_RESET = 'request_password_reset_page_image',
}

export type CollectionNames =
  | 'login_cover'
  | 'password_reset_cover'
  | 'request_password_reset_cover';

export const COLLECTIONS = {
  covers: {
    maxSize: 100 * 1024 * 1024,
    maxCount: 2,
    required: false,
    accepteds: ['image/*'],
  },
  login_cover: {
    maxSize: 100 * 1024 * 1024,
    maxCount: 1,
    required: false,
    accepteds: ['image/*'],
  },
  password_reset_cover: {
    maxSize: 100 * 1024 * 1024,
    maxCount: 1,
    required: false,
    accepteds: ['image/*'],
  },
  request_password_reset_cover: {
    maxSize: 100 * 1024 * 1024,
    maxCount: 1,
    required: false,
    accepteds: ['image/*'],
  },
};
