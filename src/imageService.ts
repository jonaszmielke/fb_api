import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export type ImageType = 'profile_picture' | 'background' | 'post';

// Map each image type to its corresponding directory.
const destinationPaths: Record<ImageType, string> = {
  profile_picture: path.join(__dirname, '../app_images/profile_pictures'),
  background: path.join(__dirname, '../app_images/backgrounds'),
  post: path.join(__dirname, '../app_images/posts'),
};

/**
 * Saves an uploaded file to a directory based on the image type.
 *
 * @param file - The uploaded file object from Multer.
 * @param type - The type of image determining the destination folder.
 * @returns The unique filename of the saved image.
 */
export async function saveImage(file: Express.Multer.File, type: ImageType): Promise<string> {
  if (!file) {
    throw new Error("No file provided");
  }

  // Generate a unique filename using UUID and preserve the original extension.
  const extension = path.extname(file.originalname);
  const uniqueName = `${uuidv4()}${extension}`;

  // Determine destination directory based on type.
  const destinationDir = destinationPaths[type];
  const destinationPath = path.join(destinationDir, uniqueName);

  // Ensure the destination directory exists.
  //await fs.promises.mkdir(destinationDir, { recursive: true });

  // Move the file from its temporary location to the destination folder.
  await fs.promises.rename(file.path, destinationPath);

  return uniqueName;
}
