export interface IStorageService {
  uploadImage(base64String: string, folder: string): Promise<string>;
}
