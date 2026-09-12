package com.spring_sber.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // 1. Создать заявку
    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Map<String, String> body) {
        String request = body.get("request");
        if (request == null || request.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(ticketService.createTicket(request));
    }

    // 2. Ответить на вопросы
    @PostMapping("/{id}/answers")
    public ResponseEntity<Ticket> submitAnswers(@PathVariable int id,
                                                @RequestBody Map<String, List<String>> body) {
        List<String> answers = body.get("answers");
        return ticketService.submitAnswers(id, answers)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 3. Подтвердить/отклонить
    @PostMapping("/{id}/confirm")
    public ResponseEntity<Ticket> confirm(@PathVariable int id,
                                          @RequestBody Map<String, Boolean> body) {
        Boolean confirmed = body.get("confirmed");
        if (confirmed == null) return ResponseEntity.badRequest().build();
        return ticketService.confirmSummary(id, confirmed)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Получить все заявки
    @GetMapping
    public ResponseEntity<List<Ticket>> getAll() {
        return ResponseEntity.ok(ticketService.findAll());
    }

    // Получить одну заявку
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getById(@PathVariable int id) {
        return ticketService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}