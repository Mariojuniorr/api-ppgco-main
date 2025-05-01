import { convertMulterToBlob } from '../files';

export const objectToFormData = (
  obj: Record<string, string | Express.Multer.File>,
) => {
  return Object.entries(obj).reduce((formData, [key, value]) => {
    if (!value) return formData;

    if (typeof value === 'string') {
      formData.append(key, value);
      return formData;
    }

    formData.append(key, convertMulterToBlob(value), value.originalname);
    return formData;
  }, new FormData());
};
