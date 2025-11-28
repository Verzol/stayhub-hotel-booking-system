package com.verzol.stayhub.util;

import java.util.Random;

public class OtpUtil {
    
    public static String generateOtp() {
        Random random = new Random();
        int number = random.nextInt(999999);
        // Format thành chuỗi 6 số (ví dụ: 001234)
        return String.format("%06d", number);
    }
}
