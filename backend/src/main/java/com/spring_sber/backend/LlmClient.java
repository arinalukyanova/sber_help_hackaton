package com.spring_sber.backend;

import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class LlmClient {

    // Генерация 3 уточняющих вопросов
    public List<String> generateQuestions(String request) {
        List<String> questions = new ArrayList<>();
        questions.add("На каком устройстве возникает проблема?");
        questions.add("Когда проблема появилась впервые?");
        questions.add("Что именно происходит при попытке входа?");
        return questions;
    }

    // Формирование резюме
    public String generateSummary(String originalRequest, List<String> answers) {
        StringBuilder summary = new StringBuilder("Я правильно понял, что ваш запрос: ");
        summary.append(originalRequest);
        if (!answers.isEmpty()) {
            summary.append(". Уточнения: ");
            summary.append(String.join("; ", answers));
        }
        return summary.toString();
    }

    // Может ли ИИ решить проблему
    public boolean canSolve(String originalRequest) {
        String lower = originalRequest.toLowerCase();
        return lower.contains("пароль") || lower.contains("wi-fi") || lower.contains("почт");
    }

    // Генерация решения
    public String generateSolution(String originalRequest) {
        String lower = originalRequest.toLowerCase();
        if (lower.contains("пароль")) {
            return "Перейдите в личный кабинет и нажмите 'Восстановить пароль'. Следуйте инструкции.";
        } else if (lower.contains("wi-fi")) {
            return "Попробуйте перезагрузить роутер. Если не помогает — обратитесь в IT-отдел.";
        } else if (lower.contains("почт")) {
            return "Проверьте настройки почтового клиента. Убедитесь, что пароль верный.";
        }
        return "Решение не найдено.";
    }
}