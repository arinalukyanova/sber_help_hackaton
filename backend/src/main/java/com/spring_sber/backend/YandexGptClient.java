package com.spring_sber.backend;

import com.cheernota.yandexgpt.client.YandexGptChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class YandexGptClient {

    private final YandexGptChatClient chatClient;

    // Конструктор, куда Spring подставит настроенный клиент
    public YandexGptClient(YandexGptChatClient chatClient) {
        this.chatClient = chatClient;
    }

    // 1. Генерация 3 уточняющих вопросов
    public List<String> generateQuestions(String userRequest) {
        String prompt = String.format(
                "Ты — помощник техподдержки. Пользователь написал: \"%s\". " +
                "Задай три коротких уточняющих вопроса, чтобы понять суть проблемы. " +
                "Выведи только вопросы, каждый с новой строки, без нумерации.",
                userRequest
        );
        String response = chatClient.generateByPrompt(prompt);
        return response.lines()
                .filter(line -> !line.trim().isEmpty())
                .limit(3)
                .collect(Collectors.toList());
    }

    // 2. Формирование резюме: "Я правильно понял, что..."
    public String generateSummary(String originalRequest, List<String> answers) {
        String answersText = String.join("; ", answers);
        String prompt = String.format(
                "Ты — помощник техподдержки. Пользователь написал: \"%s\". " +
                "Он ответил на уточняющие вопросы: \"%s\". " +
                "Сформулируй краткое резюме его проблемы в стиле: 'Я правильно понял, что...'",
                originalRequest, answersText
        );
        return chatClient.generateByPrompt(prompt).trim();
    }

    // 3. Проверка, может ли ИИ решить проблему
    public boolean canSolve(String originalRequest) {
        String lower = originalRequest.toLowerCase();
        // Можно оставить простую логику, а можно спросить у самой модели.
        // Пока оставим так для скорости.
        return lower.contains("пароль") || lower.contains("wi-fi") || lower.contains("почт") || lower.contains("вход");
    }

    // 4. Генерация решения
    public String generateSolution(String originalRequest) {
        String prompt = String.format(
                "Ты — помощник техподдержки. Пользователь написал: \"%s\". " +
                "Предложи пошаговое решение этой проблемы в виде нумерованного списка.",
                originalRequest
        );
        return chatClient.generateByPrompt(prompt).trim();
    }
}