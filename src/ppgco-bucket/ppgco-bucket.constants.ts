export const errorPreffix = '[API PPGOC BUCKET ERROR] ';

export const uploadFileHeaders = {
  'Content-Type':
    'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
};

export const ENDPOINTS = {
  bucket: {
    create: 'buckets',
    update: '${ bucketKey }',
  },
  files: {
    get: 'files/path/${ bucketKey }/${ filename }',
    upload: 'files/upload/${ bucketKey }',
    delete: 'files/delete/${ bucketKey }/${ filename }',
  },
};
