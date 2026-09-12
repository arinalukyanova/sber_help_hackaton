package com.spring_sber.backend;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class TicketService {

    private final List<Ticket> tickets = new ArrayList<>();
    private final AtomicInteger idCounter = new AtomicInteger(1);
    private final LlmClient llmClient;

    public TicketService(LlmClient llmClient) {
        this.llmClient = llmClient;
    }

    // 1. Создать заявку (клиент пишет запрос)
    public Ticket createTicket(String request) {
        Ticket ticket = new Ticket(request);
        ticket.setId(idCounter.getAndIncrement());
        ticket.setStatus("WAITING_ANSWERS");

        // ИИ генерирует 3 вопроса
        List<String> questions = llmClient.generateQuestions(request);
        ticket.setQuestions(questions);

        tickets.add(ticket);
        return ticket;
    }

    // 2. Клиент отвечает на вопросы
    public Optional<Ticket> submitAnswers(int id, List<String> answers) {
        Optional<Ticket> opt = findById(id);
        if (opt.isEmpty()) return Optional.empty();

        Ticket ticket = opt.get();
        ticket.setAnswers(answers);

        // ИИ формирует резюме
        String summary = llmClient.generateSummary(ticket.getOriginalRequest(), answers);
        ticket.setSummary(summary);
        ticket.setStatus("WAITING_CONFIRM");

        return Optional.of(ticket);
    }

    // 3. Клиент подтверждает или отклоняет
    public Optional<Ticket> confirmSummary(int id, boolean confirmed) {
        Optional<Ticket> opt = findById(id);
        if (opt.isEmpty()) return Optional.empty();

        Ticket ticket = opt.get();

        if (confirmed) {
            if (llmClient.canSolve(ticket.getOriginalRequest())) {
                String solution = llmClient.generateSolution(ticket.getOriginalRequest());
                ticket.setSolution(solution);
                ticket.setStatus("RESOLVED");
            } else {
                ticket.setStatus("ESCALATED");
                ticket.setEscalationReason("ИИ не смог решить проблему. Запрос передан в поддержку.");
            }
        } else {
            ticket.setStatus("ESCALATED");
            ticket.setEscalationReason("Клиент отклонил резюме. ИИ не справился. Передано в поддержку.");
        }

        return Optional.of(ticket);
    }

    public List<Ticket> findAll() {
        return tickets;
    }

    public Optional<Ticket> findById(int id) {
        return tickets.stream()
                .filter(t -> t.getId() == id)
                .findFirst();
    }
}