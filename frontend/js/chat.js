// ==========================================
// НАСТРОЙКИ API
// ==========================================

const API_URL =
    "http://localhost:8000/api/analyze";


// ==========================================
// ЭЛЕМЕНТЫ СТРАНИЦЫ
// ==========================================

const messageInput =
    document.getElementById("message");

const analyzeButton =
    document.getElementById("analyzeButton");

const exampleButton =
    document.getElementById("exampleButton");

const resultsContainer =
    document.getElementById("results");

const actionsContainer =
    document.getElementById("actions");

const emptyState =
    document.getElementById("emptyState");

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("errorBox");

const problemCounter =
    document.getElementById("problemCounter");

const actionsEmpty =
    document.getElementById("actionsEmpty");

const operatorName =
    document.getElementById("operatorName");


// ==========================================
// ОПЕРАТОР
// ==========================================

const savedOperatorName =
    localStorage.getItem("operatorName");


if (savedOperatorName) {

    operatorName.textContent =
        `Оператор: ${savedOperatorName}`;

} else {

    operatorName.textContent =
        "Оператор";
}


// ==========================================
// СОБЫТИЯ
// ==========================================

analyzeButton.addEventListener(
    "click",
    analyzeMessage
);


exampleButton.addEventListener(
    "click",
    insertExample
);


// Ctrl + Enter → анализ

messageInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            analyzeMessage();
        }
    }
);


// ==========================================
// ПРИМЕР
// ==========================================

function insertExample() {

    messageInput.value =
        "Вчера банкомат не выдал 5000 рублей, " +
        "но деньги со счёта списались. " +
        "А сегодня мне позвонили из службы безопасности " +
        "и попросили назвать код из СМС " +
        "и перевести деньги на безопасный счёт.";

    messageInput.focus();
}


// ==========================================
// ГЛАВНАЯ ФУНКЦИЯ
// ==========================================

async function analyzeMessage() {

    const message =
        messageInput.value.trim();


    if (!message) {

        showError(
            "Введите текст обращения."
        );

        return;
    }


    startLoading();


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Backend вернул ошибку."
            );
        }


        if (
            !data.problems ||
            !Array.isArray(data.problems)
        ) {

            throw new Error(
                "Backend вернул неправильный формат данных."
            );
        }


        renderProblems(
            data.problems
        );


        renderActions(
            data.problems
        );

    }

    catch (error) {

        console.error(
            "Ошибка:",
            error
        );


        showError(
            "Не удалось выполнить анализ. " +
            error.message
        );

    }

    finally {

        stopLoading();
    }
}


// ==========================================
// ОТОБРАЖЕНИЕ ПРОБЛЕМ
// ==========================================

function renderProblems(problems) {

    resultsContainer.innerHTML = "";


    emptyState.classList.add(
        "hidden"
    );


    errorBox.classList.add(
        "hidden"
    );


    problemCounter.classList.remove(
        "hidden"
    );


    problemCounter.textContent =
        getProblemWord(
            problems.length
        );


    problems.forEach(
        (problem, index) => {

            const card =
                createProblemCard(
                    problem,
                    index
                );


            resultsContainer.appendChild(
                card
            );
        }
    );
}


// ==========================================
// СОЗДАНИЕ КАРТОЧКИ
// ==========================================

function createProblemCard(
    problem,
    index
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "problem-card";


    const priority =
        problem.priority ||
        "medium";


    const confidence =
        Math.round(
            Number(
                problem.confidence || 0
            ) * 100
        );


    const missing =
        problem.missing_information ||
        [];


    let missingHtml = "";


    if (missing.length > 0) {

        missingHtml = `
            <div class="missing-box">

                ⚠ <strong>
                    Не хватает информации:
                </strong>

                <br>

                ${missing
                    .map(
                        item =>
                            `• ${escapeHtml(item)}`
                    )
                    .join("<br>")}

            </div>
        `;

    } else {

        missingHtml = `
            <div class="complete-box">

                ✓ Данных достаточно
                для следующего действия

            </div>
        `;
    }


    const extracted =
        problem.extracted_information ||
        {};


    let extractedHtml = "";


    const extractedEntries =
        Object.entries(
            extracted
        );


    if (
        extractedEntries.length > 0
    ) {

        extractedHtml = `
            <div class="missing-box">

                <strong>
                    Извлечённые данные:
                </strong>

                <br>

                ${extractedEntries
                    .map(
                        ([key, value]) =>
                            `• ${escapeHtml(key)}:
                             ${escapeHtml(
                                 String(value)
                             )}`
                    )
                    .join("<br>")}

            </div>
        `;
    }


    card.innerHTML = `

        <div class="problem-top">

            <div class="problem-number">
                ПРОБЛЕМА
                ${String(index + 1).padStart(
                    2,
                    "0"
                )}
            </div>

            <div
                class="
                    priority
                    priority-${escapeHtml(
                        priority
                    )}
                "
            >
                ${escapeHtml(priority)}
            </div>

        </div>


        <h3>
            ${escapeHtml(
                problem.title ||
                "Без названия"
            )}
        </h3>


        <p class="problem-description">

            ${escapeHtml(
                problem.description ||
                "Описание отсутствует"
            )}

        </p>


        <div class="info-grid">


            <div class="info-item">

                <div class="info-label">
                    Категория
                </div>

                <div class="info-value">
                    ${escapeHtml(
                        problem.category ||
                        "OTHER"
                    )}
                </div>

            </div>


            <div class="info-item">

                <div class="info-label">
                    Уверенность
                </div>

                <div
                    class="
                        info-value
                        confidence
                    "
                >
                    ${confidence}%
                </div>

            </div>


        </div>


        ${extractedHtml}

        ${missingHtml}
    `;


    return card;
}


// ==========================================
// ДЕЙСТВИЯ АГЕНТА
// ==========================================

function renderActions(problems) {

    actionsContainer.innerHTML =
        "";


    if (problems.length === 0) {

        actionsEmpty.classList.remove(
            "hidden"
        );

        return;
    }


    actionsEmpty.classList.add(
        "hidden"
    );


    problems.forEach(
        problem => {

            const actionCard =
                document.createElement(
                    "div"
                );


            actionCard.className =
                "action-card";


            actionCard.innerHTML = `

                <div class="action-category">

                    ${escapeHtml(
                        problem.category ||
                        "OTHER"
                    )}

                </div>


                <div class="action-title">

                    ${formatAction(
                        problem.next_action
                    )}

                </div>


                <div class="action-response">

                    ${escapeHtml(
                        problem.suggested_response ||
                        "Рекомендация отсутствует."
                    )}

                </div>

            `;


            actionsContainer.appendChild(
                actionCard
            );
        }
    );
}


// ==========================================
// ЧЕЛОВЕКОЧИТАЕМЫЕ ACTION
// ==========================================

function formatAction(action) {

    const actions = {

        request_clarification:
            "Запросить уточнение",

        escalate:
            "Эскалировать обращение",

        create_ticket:
            "Создать заявку",

        prepare_answer:
            "Подготовить ответ",

        check_transaction:
            "Проверить операцию"

    };


    return (
        actions[action] ||
        action ||
        "Определить следующее действие"
    );
}


// ==========================================
// LOADING
// ==========================================

function startLoading() {

    analyzeButton.disabled =
        true;


    analyzeButton.textContent =
        "Анализируем...";


    errorBox.classList.add(
        "hidden"
    );


    emptyState.classList.add(
        "hidden"
    );


    resultsContainer.innerHTML =
        "";


    actionsContainer.innerHTML =
        "";


    actionsEmpty.classList.remove(
        "hidden"
    );


    problemCounter.classList.add(
        "hidden"
    );


    loading.classList.remove(
        "hidden"
    );
}


function stopLoading() {

    loading.classList.add(
        "hidden"
    );


    analyzeButton.disabled =
        false;


    analyzeButton.textContent =
        "✦ Проанализировать обращение";
}


// ==========================================
// ОШИБКИ
// ==========================================

function showError(message) {

    stopLoading();


    emptyState.classList.add(
        "hidden"
    );


    resultsContainer.innerHTML =
        "";


    problemCounter.classList.add(
        "hidden"
    );


    errorBox.textContent =
        message;


    errorBox.classList.remove(
        "hidden"
    );
}


// ==========================================
// СКЛОНЕНИЕ "ПРОБЛЕМА"
// ==========================================

function getProblemWord(number) {

    const lastTwo =
        number % 100;


    const last =
        number % 10;


    if (
        lastTwo >= 11 &&
        lastTwo <= 14
    ) {

        return `${number} проблем`;
    }


    if (last === 1) {

        return `${number} проблема`;
    }


    if (
        last >= 2 &&
        last <= 4
    ) {

        return `${number} проблемы`;
    }


    return `${number} проблем`;
}


// ==========================================
// ЗАЩИТА HTML
// ==========================================

function escapeHtml(value) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        value ?? "";


    return element.innerHTML;
}