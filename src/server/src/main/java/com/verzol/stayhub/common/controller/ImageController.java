package com.verzol.stayhub.common.controller;

import java.util.concurrent.TimeUnit;

import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.verzol.stayhub.common.service.FileStorageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final FileStorageService fileStorageService;

    /**
     * Serve image with caching headers
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Resource resource = fileStorageService.loadAsResource(filename);
            
            // Determine content type
            String contentType = determineContentType(filename);
            
            return ResponseEntity.ok()
                    .cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS)
                            .cachePublic()
                            .mustRevalidate())
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .header(HttpHeaders.ETAG, "\"" + filename + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000, immutable")
                    .body(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Serve thumbnail with caching headers
     */
    @GetMapping("/thumb/{filename:.+}")
    public ResponseEntity<Resource> getThumbnail(@PathVariable String filename) {
        try {
            // Try to load thumbnail (prefixed with "thumb_")
            String thumbnailFilename = "thumb_" + filename;
            Resource resource = fileStorageService.loadAsResource(thumbnailFilename);
            
            String contentType = determineContentType(filename);
            
            return ResponseEntity.ok()
                    .cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS)
                            .cachePublic()
                            .mustRevalidate())
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .header(HttpHeaders.ETAG, "\"" + thumbnailFilename + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000, immutable")
                    .body(resource);
        } catch (RuntimeException e) {
            // If thumbnail doesn't exist, fallback to original
            return getImage(filename);
        }
    }

    private String determineContentType(String filename) {
        String lowerFilename = filename.toLowerCase();
        if (lowerFilename.endsWith(".png")) {
            return MediaType.IMAGE_PNG_VALUE;
        } else if (lowerFilename.endsWith(".gif")) {
            return MediaType.IMAGE_GIF_VALUE;
        } else if (lowerFilename.endsWith(".webp")) {
            return "image/webp";
        } else {
            return MediaType.IMAGE_JPEG_VALUE;
        }
    }
}

