export function convertMulterToBlob(file: Express.Multer.File) {
  return new Blob([file.buffer], { type: file.mimetype });
}
