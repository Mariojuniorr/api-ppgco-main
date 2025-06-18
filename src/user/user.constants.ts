export const USER_REPOSITORY = 'USER_REPOSITORY';
export const COLLECTIONS = {
  avatar: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png'],
    required: true,
  },
  documents: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'application/msword'],
    maxCount: 5,
    required: false,
  },
  attachments: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/*', 'application/pdf', 'text/plain'],
    maxCount: 3,
    required: false,
  },
};
