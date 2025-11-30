package com.verzol.stayhub.module.message.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.verzol.stayhub.module.message.dto.MessageDTO;
import com.verzol.stayhub.module.message.entity.Message;
import com.verzol.stayhub.module.message.repository.MessageRepository;
import com.verzol.stayhub.module.notification.service.NotificationService;
import com.verzol.stayhub.module.user.entity.User;
import com.verzol.stayhub.module.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public MessageDTO sendMessage(Long senderId, Long receiverId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = Message.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .content(content)
                .isRead(false)
                .build();

        Message saved = messageRepository.save(message);
        MessageDTO messageDTO = mapToDTO(saved, sender, receiver);
        
        // Send notification to receiver with senderId as relatedUserId
        try {
            String messageText = String.format("Bạn có tin nhắn mới từ %s", sender.getFullName());
            notificationService.sendNotification(
                    receiverId,
                    "Tin nhắn mới",
                    messageText,
                    "CHAT",
                    senderId // relatedUserId: sender's ID for navigation
            );
        } catch (Exception e) {
            System.err.println("Failed to send message notification: " + e.getMessage());
        }
        
        return messageDTO;
    }

    public List<MessageDTO> getConversation(Long userId1, Long userId2) {
        List<Message> messages = messageRepository.findConversation(userId1, userId2);
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId1));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId2));

        return messages.stream()
                .map(msg -> {
                    User sender = msg.getSenderId().equals(userId1) ? user1 : user2;
                    User receiver = msg.getReceiverId().equals(userId1) ? user1 : user2;
                    return mapToDTO(msg, sender, receiver);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long messageId, Long userId) {
        messageRepository.findById(messageId).ifPresent(message -> {
            if (message.getReceiverId().equals(userId)) {
                message.setIsRead(true);
                messageRepository.save(message);
            }
        });
    }

    @Transactional
    public void markConversationAsRead(Long userId1, Long userId2, Long currentUserId) {
        List<Message> unreadMessages = messageRepository.findConversation(userId1, userId2)
                .stream()
                .filter(msg -> msg.getReceiverId().equals(currentUserId) && !msg.getIsRead())
                .collect(Collectors.toList());

        unreadMessages.forEach(msg -> {
            msg.setIsRead(true);
            messageRepository.save(msg);
        });
    }

    public Long getUnreadCount(Long userId) {
        return messageRepository.countUnreadMessages(userId);
    }

    public List<Long> getConversationPartners(Long userId) {
        return messageRepository.findConversationPartners(userId);
    }

    private MessageDTO mapToDTO(Message message, User sender, User receiver) {
        return MessageDTO.builder()
                .id(message.getId())
                .senderId(message.getSenderId())
                .senderName(sender.getFullName())
                .senderAvatar(sender.getAvatarUrl())
                .receiverId(message.getReceiverId())
                .receiverName(receiver.getFullName())
                .receiverAvatar(receiver.getAvatarUrl())
                .content(message.getContent())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}

