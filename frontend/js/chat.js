// ======================================================
// SberHelp
// Основная логика frontend
// ======================================================


// ------------------------------------------------------
// DOM
// ------------------------------------------------------

const screen =
    document.getElementById("screen");


// ------------------------------------------------------
// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ------------------------------------------------------

const state = {

    initialMessage: "",

    currentQuestion: 0,

    answers: [
        "",
        "",
        ""
    ],

    confirmedProblem: false
};


// ------------------------------------------------------
// УТОЧНЯЮЩИЕ ВОПРОСЫ
// ------------------------------------------------------

const questions = [

    {
        title:
            "На каком устройстве возникает проблема?",

        placeholder:
            "Например: рабочий ноутбук Windows..."
    },

    {
        title:
            "Когда проблема появилась впервые?",

        placeholder:
            "Например: сегодня утром после смены пароля..."
    },

    {
        title:
            "Что именно происходит при попытке входа?",

        placeholder:
            "Например: появляется сообщение «Неверный пароль»..."
    }

];


// ======================================================
// ЭКРАН 01 — START
// ======================================================

function renderStart() {

    screen.innerHTML = `

        <section class="page fade-in">

            <div class="page-content">

                <h1 class="page-title">
                    Чем можем помочь?
                </h1>

                <p class="page-description">
                    Опишите проблему — ИИ SberHelp поможет
                    сформировать и решить запрос.
                </p>


                <div class="input-card">

                    <textarea
                        id="problemInput"
                        class="large-textarea"
                        placeholder="Опишите вашу проблему..."
                    ></textarea>

                    <div class="input-plus">
                        +
                    </div>

                </div>


                <button
                    id="startButton"
                    class="main-button"
                >
                    Найти решение
                    <span>→</span>
                </button>


                <div class="bottom-note">
                    Безопасно. Быстро. Надёжно.
                </div>

            </div>

        </section>

    `;


    const input =
        document.getElementById(
            "problemInput"
        );


    const button =
        document.getElementById(
            "startButton"
        );


    button.addEventListener(
        "click",
        () => {

            const value =
                input.value.trim();


            if (!value) {

                input.classList.add(
                    "input-error"
                );

                input.focus();

                return;
            }


            state.initialMessage =
                value;


            renderAnalysis();
        }
    );


    input.addEventListener(
        "input",
        () => {

            input.classList.remove(
                "input-error"
            );
        }
    );
}


// ======================================================
// ЭКРАН 02 — ANALYSIS
// ======================================================

function renderAnalysis() {

    screen.innerHTML = `

        <section class="page fade-in">

            <div class="page-content">

                <h1 class="page-title">
                    Анализируем запрос
                </h1>

                <p class="page-description">
                    Это займёт несколько секунд.
                </p>


                <div class="ai-orb-wrapper">

                    <div class="ai-orb">

                        <div class="ai-orb-core"></div>

                    </div>

                </div>


                <div class="analysis-card">

                    <div class="analysis-row">

                        <span class="check">
                            ✓
                        </span>

                        <span>
                            Определяем тему обращения
                        </span>

                    </div>


                    <div class="analysis-row muted-analysis">

                        <span class="loader-dot"></span>

                        <span>
                            Готовим уточняющие вопросы
                        </span>

                    </div>

                </div>

            </div>

        </section>

    `;


    /*
        Здесь специально НЕТ:
        "оцениваем сложность запроса"

        Это та правка, которую ты попросила.
    */


    setTimeout(
        () => {

            state.currentQuestion = 0;

            renderQuestion();

        },
        1800
    );
}


// ======================================================
// ЭКРАНЫ 03–05 — QUESTIONS
// ======================================================

function renderQuestion() {

    const index =
        state.currentQuestion;


    const question =
        questions[index];


    screen.innerHTML = `

        <section class="page fade-in">

            <div class="page-content question-page">

                <div class="question-counter">
                    Вопрос ${index + 1}/3
                </div>


                <h1 class="page-title">
                    Нужно немного уточнить
                </h1>


                <p class="page-description">
                    Ответ поможет ИИ точнее определить
                    причину проблемы.
                </p>


                <!-- ПЛАШКА С ВОПРОСОМ -->

                <div class="question-card">

                    <div class="question-label">
                        Вопрос
                    </div>

                    <div class="question-text">
                        ${question.title}
                    </div>

                </div>


                <!-- ПОЛЕ ДЛЯ ОТВЕТА -->

                <textarea
                    id="questionAnswer"
                    class="question-textarea"
                    placeholder="${question.placeholder}"
                >${state.answers[index]}</textarea>


                <button
                    id="continueButton"
                    class="main-button question-button"
                >
                    Продолжить
                    <span>→</span>
                </button>

            </div>

        </section>

    `;


    const answerInput =
        document.getElementById(
            "questionAnswer"
        );


    const continueButton =
        document.getElementById(
            "continueButton"
        );


    continueButton.addEventListener(
        "click",
        () => {

            const answer =
                answerInput.value.trim();


            if (!answer) {

                answerInput.classList.add(
                    "input-error"
                );

                answerInput.focus();

                return;
            }


            state.answers[index] =
                answer;


            if (
                state.currentQuestion < 2
            ) {

                state.currentQuestion++;

                renderQuestion();

            } else {

                renderConfirmation();
            }
        }
    );


    answerInput.addEventListener(
        "input",
        () => {

            answerInput.classList.remove(
                "input-error"
            );
        }
    );
}


// ======================================================
// ЭКРАН 06 — CONFIRM
// ======================================================

function renderConfirmation() {

    screen.innerHTML = `

        <section class="page fade-in">

            <div class="page-content">

                <h1 class="page-title">
                    Мы сформулировали
                    вашу проблему
                </h1>


                <p class="page-description">
                    Проверьте, всё ли верно.
                    При необходимости можно передать
                    запрос в поддержку.
                </p>


                <div class="problem-summary-card">

                    <div class="summary-label">
                        Сформулированная проблема
                    </div>


                    <div class="summary-text">

                        Пользователь не может войти
                        в рабочий аккаунт SberHelp
                        на корпоративном компьютере
                        после смены пароля.

                        <br><br>

                        При входе система сообщает
                        об ошибке авторизации.

                    </div>


                    <button
                        id="editButton"
                        class="text-button"
                    >
                        Изменить
                    </button>

                </div>


                <div class="confirm-buttons">

                    <button
                        id="supportButton"
                        class="outline-button"
                    >
                        Нет, в поддержку
                    </button>


                    <button
                        id="confirmButton"
                        class="green-button"
                    >
                        Да, всё верно
                        <span>→</span>
                    </button>

                </div>

            </div>

        </section>

    `;


    document
        .getElementById(
            "editButton"
        )
        .addEventListener(
            "click",
            () => {

                state.currentQuestion = 0;

                renderQuestion();
            }
        );


    document
        .getElementById(
            "supportButton"
        )
        .addEventListener(
            "click",
            renderSupport
        );


    document
        .getElementById(
            "confirmButton"
        )
        .addEventListener(
            "click",
            () => {

                state.confirmedProblem =
                    true;

                renderAIAnswer();
            }
        );
}


// ======================================================
// ЭКРАН 08 — AI ANSWER
// ======================================================

function renderAIAnswer() {

    screen.innerHTML = `

        <section class="page fade-in">

            <div class="page-content">

                <h1 class="page-title">
                    Решение проблемы
                </h1>


                <p class="page-description">
                    Попробуйте следующие шаги.
                    Если проблема не исчезнет —
                    сформированный запрос уже готов
                    для передачи специалисту.
                </p>


                <div class="solution-list">


                    <div class="solution-item">

                        <div class="solution-number">
                            1
                        </div>

                        <div class="solution-text">
                            Завершите активные сессии
                            в настройках безопасности
                        </div>

                    </div>


                    <div class="solution-item">

                        <div class="solution-number">
                            2
                        </div>

                        <div class="solution-text">
                            Подождите несколько минут
                        </div>

                    </div>


                    <div class="solution-item">

                        <div class="solution-number">
                            3
                        </div>

                        <div class="solution-text">
                            Попробуйте войти
                            с новым паролем
                        </div>

                    </div>


                    <div class="solution-item">

                        <div class="solution-number">
                            4
                        </div>

                        <div class="solution-text">
                            Если ошибка сохранится —
                            сбросьте кэш браузера
                        </div>

                    </div>

                </div>


                <div class="help-question">
                    Помогло решение?
                </div>


                <div class="answer-buttons">

                    <button
                        id="successButton"
                        class="green-button"
                    >
                        Да, всё получилось
                    </button>


                    <button
                        id="noHelpButton"
                        class="outline-button"
                    >
                        Нет, нужна поддержка
                    </button>

                </div>

            </div>

        </section>

    `;


    document
        .getElementById(
            "successButton"
        )
        .addEventListener(
            "click",
            renderSuccess
        );


    document
        .getElementById(
            "noHelpButton"
        )
        .addEventListener(
            "click",
            renderSupport
        );
}


// ======================================================
// ЭКРАН 09 — SUCCESS
// ======================================================

function renderSuccess() {

    screen.innerHTML = `

        <section class="page fade-in">

            <div class="page-content success-page">

                <h1 class="page-title">
                    Рады, что помогли!
                </h1>


                <p class="page-description">
                    Если появятся новые вопросы —
                    SberHelp всегда рядом.
                </p>


                <div class="success-icon-wrapper">

                    <div class="success-icon">
                        ✓
                    </div>

                </div>


                <button
                    id="newQuestionButton"
                    class="main-button"
                >
                    Задать другой вопрос
                </button>


                <button
                    id="homeButton"
                    class="text-button home-link"
                >
                    Вернуться на главную
                </button>

            </div>

        </section>

    `;


    document
        .getElementById(
            "newQuestionButton"
        )
        .addEventListener(
            "click",
            resetApplication
        );


    document
        .getElementById(
            "homeButton"
        )
        .addEventListener(
            "click",
            resetApplication
        );
}


// ======================================================
// ЭКРАН 10 — SUPPORT
// ======================================================

function renderSupport() {

    screen.innerHTML = `

        <section class="page fade-in">

            <div class="page-content">

                <h1 class="page-title">
                    Запрос передан
                    в поддержку
                </h1>


                <p class="page-description">
                    Мы отправили специалисту уже
                    подготовленный запрос вместе
                    с собранной информацией.
                </p>


                <div class="support-plane">
                    ➤
                </div>


                <div class="support-card">

                    <div class="support-title">
                        Что передано:
                    </div>


                    <div class="support-row">
                        ✓
                        Сформулированная проблема
                    </div>


                    <div class="support-row">
                        ✓
                        Ваши ответы на вопросы
                    </div>


                    <div class="support-row">
                        ✓
                        Технические детали
                    </div>


                    <div class="support-row">
                        ✓
                        Контекст обращения
                    </div>

                </div>


                <button
                    id="returnHomeButton"
                    class="main-button"
                >
                    Вернуться на главную
                </button>

            </div>

        </section>

    `;


    document
        .getElementById(
            "returnHomeButton"
        )
        .addEventListener(
            "click",
            resetApplication
        );
}


// ======================================================
// RESET
// ======================================================

function resetApplication() {

    state.initialMessage = "";

    state.currentQuestion = 0;

    state.answers = [
        "",
        "",
        ""
    ];

    state.confirmedProblem = false;


    renderStart();
}


// ======================================================
// ЗАПУСК
// ======================================================

renderStart();