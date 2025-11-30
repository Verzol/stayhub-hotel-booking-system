package com.verzol.stayhub.module.message.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.verzol.stayhub.module.message.dto.MessageDTO;
import com.verzol.stayhub.module.message.service.MessageService;
import com.verzol.stayhub.module.user.entity.User;
import com.verzol.stayhub.module.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody SendMessageRequest request, Principal principal) {
        User sender = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        MessageDTO message = messageService.sendMessage(sender.getId(), request.getReceiverId(), request.getContent());
        return ResponseEntity.ok(message);
    }

    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<List<MessageDTO>> getConversation(@PathVariable Long otherUserId, Principal principal) {
        User currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<MessageDTO> messages = messageService.getConversation(currentUser.getId(), otherUserId);
        return ResponseEntity.ok(messages);
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long messageId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        messageService.markAsRead(messageId, user.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/conversation/{otherUserId}/read")
    public ResponseEntity<Void> markConversationAsRead(@PathVariable Long otherUserId, Principal principal) {
        User currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        messageService.markConversationAsRead(currentUser.getId(), otherUserId, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Long count = messageService.getUnreadCount(user.getId());
        return ResponseEntity.ok(count);
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<Long>> getConversationPartners(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Long> partners = messageService.getConversationPartners(user.getId());
        return ResponseEntity.ok(partners);
    }

    /**
     * Lightweight endpoint to check if there are new messages in a conversation
     * Returns true if there are new messages since lastMessageId
     */
    @GetMapping("/conversation/{otherUserId}/check-update")
    public ResponseEntity<CheckUpdateResponse> checkConversationUpdate(
            @PathVariable Long otherUserId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long lastMessageId,
            Principal principal) {
        User currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<MessageDTO> messages = messageService.getConversation(currentUser.getId(), otherUserId);
        
        // Check if there are new messages
        boolean hasUpdate = false;
        if (lastMessageId != null && !messages.isEmpty()) {
            // Check if the latest message ID is different from lastMessageId
            Long latestMessageId = messages.get(messages.size() - 1).getId();
            hasUpdate = !latestMessageId.equals(lastMessageId);
        } else if (!messages.isEmpty()) {
            // If no lastMessageId provided, consider it as an update
            hasUpdate = true;
        }
        
        // Also check unread count
        Long unreadCount = messageService.getUnreadCount(currentUser.getId());
        
        return ResponseEntity.ok(new CheckUpdateResponse(hasUpdate, unreadCount, messages.isEmpty() ? null : messages.get(messages.size() - 1).getId()));
    }

    // Response DTO
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class CheckUpdateResponse {
        private boolean hasUpdate;
        private Long unreadCount;
        private Long lastMessageId;
    }

    // Inner class for request
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class SendMessageRequest {
        private Long receiverId;
        private String content;
    }
}

