package com.spring_sber.backend;

import java.util.ArrayList;
import java.util.List;

public class Ticket {
    private int id;
    private String originalRequest;       // изначальный запрос клиента
    private List<String> questions;       // 3 уточняющих вопроса
    private List<String> answers;         // ответы клиента
    private String summary;               // "Я правильно понял, что..."
    private String status;                // NEW, WAITING_ANSWERS, WAITING_CONFIRM, RESOLVED, ESCALATED
    private String solution;              // решение, если есть
    private String escalationReason;      // причина эскалации

    public Ticket() {
        this.questions = new ArrayList<>();
        this.answers = new ArrayList<>();
    }

    public Ticket(String originalRequest) {
        this.originalRequest = originalRequest;
        this.questions = new ArrayList<>();
        this.answers = new ArrayList<>();
        this.status = "NEW";
    }

    // Геттеры и сеттеры
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getOriginalRequest() { return originalRequest; }
    public void setOriginalRequest(String originalRequest) { this.originalRequest = originalRequest; }

    public List<String> getQuestions() { return questions; }
    public void setQuestions(List<String> questions) { this.questions = questions; }

    public List<String> getAnswers() { return answers; }
    public void setAnswers(List<String> answers) { this.answers = answers; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSolution() { return solution; }
    public void setSolution(String solution) { this.solution = solution; }

    public String getEscalationReason() { return escalationReason; }
    public void setEscalationReason(String escalationReason) { this.escalationReason = escalationReason; }
}