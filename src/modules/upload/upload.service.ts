import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { CloudinaryProvider } from 'src/cloudinary.config';
@Injectable()
export class UploadService {
  constructor(
    @Inject(CloudinaryProvider) private cloudinaryProvider: CloudinaryProvider,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      if (!file || !file.buffer) {
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
          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }
}
