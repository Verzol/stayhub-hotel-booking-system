package com.verzol.stayhub.module.auth.dto;

public class CheckEmailResponse {
    private boolean exists;

    public CheckEmailResponse() {}

    public CheckEmailResponse(boolean exists) {
        this.exists = exists;
    }

    public boolean isExists() {
        return exists;
    }

    public void setExists(boolean exists) {
        this.exists = exists;
    }
}
