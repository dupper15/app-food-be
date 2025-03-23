import { Injectable, Inject, BadRequestException } from '@nestjs/common'; // eslint-disable-next-line @typescript-eslint/no-unused-vars
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { CloudinaryProvider } from 'src/cloudinary.config';

@Injectable()
export class UploadService {
  constructor(
    @Inject(CloudinaryProvider) private cloudinaryProvider: CloudinaryProvider,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new BadRequestException('Invalid file uploaded'));
      }
      const cloudinaryInstance = this.cloudinaryProvider.getInstance();
      const uploadStream = cloudinaryInstance.uploader.upload_stream(
        { folder: 'uploads' },
        (error: Error | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            return reject(
              new BadRequestException(
                `Upload failed: ${error?.message || 'Unknown error'}`,
              ),
            );
          }
          resolve(result.secure_url);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(files.map((file) => this.uploadImage(file)));
  }
}
