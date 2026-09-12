package com.spring_sber.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;

import java.util.ArrayList;
import java.util.List;

@Component
public class LlmClient {

    @Value("${yandex.folder-id}")
    private String folderId;

    @Value("${yandex.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String API_URL = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";

    // ======================================================
    // 1. ГЕНЕРАЦИЯ 3 УТОЧНЯЮЩИХ ВОПРОСОВ
    // ======================================================

    public List<String> generateQuestions(String userRequest) {
        String prompt = String.format(
                "Ты — помощник техподдержки. Пользователь написал: \"%s\". " +
                "Задай три коротких уточняющих вопроса, чтобы понять суть проблемы. " +
                "Выведи только вопросы, каждый с новой строки, без нумерации.",
                userRequest
        );

        String response = callYandexGpt(prompt);

        // Разбиваем ответ по строкам, убираем пустые, берём первые 3
        List<String> questions = new ArrayList<>();
        for (String line : response.split("\n")) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty()) {
                questions.add(trimmed);
            }
            if (questions.size() == 3) break;
        }

        // Если нейросеть вернула меньше 3 вопросов — добавляем запасные
        while (questions.size() < 3) {
            questions.add("Уточните, пожалуйста, детали проблемы.");
        }

        return questions;
    }

    // ======================================================
    // 2. ФОРМИРОВАНИЕ РЕЗЮМЕ
    // ======================================================

    public String generateSummary(String originalRequest, List<String> answers) {
        String answersText = String.join("; ", answers);

        String prompt = String.format(
                "Ты — помощник техподдержки. Пользователь написал: \"%s\". " +
                "Он ответил на уточняющие вопросы: \"%s\". " +
                "Сформулируй краткое резюме его проблемы в стиле: 'Я правильно понял, что...'",
                originalRequest, answersText
        );

        return callYandexGpt(prompt).trim();
    }

    // ======================================================
    // 3. ПРОВЕРКА, МОЖЕТ ЛИ ИИ РЕШИТЬ ПРОБЛЕМУ
    // ======================================================

    public boolean canSolve(String originalRequest) {
        String lower = originalRequest.toLowerCase();
        return lower.contains("пароль")
                || lower.contains("wi-fi")
                || lower.contains("wifi")
                || lower.contains("почт")
                || lower.contains("вход")
                || lower.contains("vpn")
                || lower.contains("принтер");
    }

    // ======================================================
    // 4. ГЕНЕРАЦИЯ РЕШЕНИЯ
    // ======================================================

    public String generateSolution(String originalRequest) {
        String prompt = String.format(
                "Ты — помощник техподдержки. Пользователь написал: \"%s\". " +
                "Предложи пошаговое решение этой проблемы в виде нумерованного списка.",
                originalRequest
        );

        return callYandexGpt(prompt).trim();
    }

    // ======================================================
    // ВСПОМОГАТЕЛЬНЫЙ МЕТОД: ЗАПРОС К YANDEXGPT
    // ======================================================

    private String callYandexGpt(String prompt) {
        try {
            // Заголовки
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            // Тело запроса
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("modelUri", "gpt://" + folderId + "/yandexgpt-lite");

            ObjectNode completionOptions = objectMapper.createObjectNode();
            completionOptions.put("stream", false);
            completionOptions.put("temperature", 0.6);
            completionOptions.put("maxTokens", 1000);
            requestBody.set("completionOptions", completionOptions);

            ArrayNode messages = objectMapper.createArrayNode();
            ObjectNode message = objectMapper.createObjectNode();
            message.put("role", "user");
            message.put("text", prompt);
            messages.add(message);
            requestBody.set("messages", messages);

            // Отправка запроса
            HttpEntity<String> entity = new HttpEntity<>(
                    objectMapper.writeValueAsString(requestBody),
                    headers
            );

            ResponseEntity<String> response = restTemplate.exchange(
                    API_URL,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            // Парсинг ответа
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode alternatives = root.path("result").path("alternatives");

            if (alternatives.isArray() && alternatives.size() > 0) {
                return alternatives.get(0).path("message").path("text").asText();
            }

            return "Не удалось получить ответ от YandexGPT.";

        } catch (Exception e) {
            e.printStackTrace();
            return "Ошибка при обращении к YandexGPT: " + e.getMessage();
        }
    }
}