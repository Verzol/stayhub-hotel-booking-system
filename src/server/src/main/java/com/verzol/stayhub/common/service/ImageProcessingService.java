package com.verzol.stayhub.common.service;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Path;

import javax.imageio.ImageIO;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImageProcessingService {

    // Thumbnail sizes
    private static final int THUMBNAIL_WIDTH = 300;
    private static final int THUMBNAIL_HEIGHT = 300;

    /**
     * Generate thumbnail from original image file
     * Returns the thumbnail filename or null if generation fails
     */
    public String generateThumbnail(MultipartFile originalFile, String originalFilename, Path rootLocation) {
        try {
            // Read original image
            BufferedImage originalImage = ImageIO.read(originalFile.getInputStream());
            if (originalImage == null) {
                return null; // Not an image file
            }

            // Calculate thumbnail dimensions maintaining aspect ratio
            int originalWidth = originalImage.getWidth();
            int originalHeight = originalImage.getHeight();
            double aspectRatio = (double) originalWidth / originalHeight;

            int thumbnailWidth, thumbnailHeight;
            if (aspectRatio > 1) {
                // Landscape
                thumbnailWidth = THUMBNAIL_WIDTH;
                thumbnailHeight = (int) (THUMBNAIL_WIDTH / aspectRatio);
            } else {
                // Portrait or square
                thumbnailHeight = THUMBNAIL_HEIGHT;
                thumbnailWidth = (int) (THUMBNAIL_HEIGHT * aspectRatio);
            }

            // Resize image
            BufferedImage thumbnail = resizeImage(originalImage, thumbnailWidth, thumbnailHeight);

            // Generate thumbnail filename (thumb_ prefix)
            String extension = getFileExtension(originalFilename);
            // Keep the same base filename with thumb_ prefix
            String thumbnailFilename = "thumb_" + originalFilename;
            Path thumbnailPath = rootLocation.resolve(thumbnailFilename);

            // Determine image format
            String format = getImageFormat(extension);

            // Save thumbnail
            ImageIO.write(thumbnail, format, thumbnailPath.toFile());

            return thumbnailFilename;
        } catch (IOException e) {
            System.err.println("Failed to generate thumbnail: " + e.getMessage());
            return null; // Return null if thumbnail generation fails
        }
    }

    /**
     * Resize image with high quality
     */
    private BufferedImage resizeImage(BufferedImage original, int targetWidth, int targetHeight) {
        // Use high-quality resizing algorithm
        BufferedImage resized = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
        java.awt.Graphics2D g = resized.createGraphics();
        
        // Enable high-quality rendering hints
        g.setRenderingHint(java.awt.RenderingHints.KEY_INTERPOLATION, 
                          java.awt.RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(java.awt.RenderingHints.KEY_RENDERING, 
                          java.awt.RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(java.awt.RenderingHints.KEY_ANTIALIASING, 
                          java.awt.RenderingHints.VALUE_ANTIALIAS_ON);
        
        g.drawImage(original, 0, 0, targetWidth, targetHeight, null);
        g.dispose();
        
        return resized;
    }

    /**
     * Get file extension from filename
     */
    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot) : ".jpg";
    }

    /**
     * Get image format from extension
     */
    private String getImageFormat(String extension) {
        return switch (extension.toLowerCase()) {
            case ".png" -> "png";
            case ".gif" -> "gif";
            case ".webp" -> "webp";
            default -> "jpg"; // Default to JPEG
        };
    }

    /**
     * Compress image to reduce file size
     */
    public void compressImage(Path imagePath) throws IOException {
        BufferedImage image = ImageIO.read(imagePath.toFile());
        if (image == null) return;

        // Re-save with compression
        String format = getImageFormatFromPath(imagePath);
        ImageIO.write(image, format, imagePath.toFile());
    }

    private String getImageFormatFromPath(Path path) {
        String filename = path.getFileName().toString().toLowerCase();
        if (filename.endsWith(".png")) return "png";
        if (filename.endsWith(".gif")) return "gif";
        if (filename.endsWith(".webp")) return "webp";
        return "jpg";
    }

    /**
     * Generate thumbnail from stored file path (alternative method)
     */
    public String generateThumbnailFromPath(Path imagePath, String originalFilename, Path rootLocation) {
        try {
            BufferedImage originalImage = ImageIO.read(imagePath.toFile());
            if (originalImage == null) {
                return null;
            }

            // Calculate thumbnail dimensions maintaining aspect ratio
            int originalWidth = originalImage.getWidth();
            int originalHeight = originalImage.getHeight();
            double aspectRatio = (double) originalWidth / originalHeight;

            int thumbnailWidth, thumbnailHeight;
            if (aspectRatio > 1) {
                thumbnailWidth = THUMBNAIL_WIDTH;
                thumbnailHeight = (int) (THUMBNAIL_WIDTH / aspectRatio);
            } else {
                thumbnailHeight = THUMBNAIL_HEIGHT;
                thumbnailWidth = (int) (THUMBNAIL_HEIGHT * aspectRatio);
            }

            BufferedImage thumbnail = resizeImage(originalImage, thumbnailWidth, thumbnailHeight);
            String thumbnailFilename = "thumb_" + originalFilename;
            Path thumbnailPath = rootLocation.resolve(thumbnailFilename);

            String format = getImageFormat(getFileExtension(originalFilename));
            ImageIO.write(thumbnail, format, thumbnailPath.toFile());

            return thumbnailFilename;
        } catch (IOException e) {
            System.err.println("Failed to generate thumbnail from path: " + e.getMessage());
            return null;
        }
    }
}

