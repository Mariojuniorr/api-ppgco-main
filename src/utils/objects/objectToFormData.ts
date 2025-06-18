export const objectToFormData = (
  obj: Record<string, string | Express.Multer.File>,
) => {
  return Object.entries(obj).reduce((formData, [key, value]) => {
    const formatters = {
      string: (value: string) => value,
      object: (value: Express.Multer.File) =>
        new Blob([value.buffer], { type: value.mimetype }),
    };

    const formatter = formatters[typeof value];

    if (formatter) {
      formData.append(key, formatter(value));
    }

    return formData;
  }, new FormData());
};
