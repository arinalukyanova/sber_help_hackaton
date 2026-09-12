const loginButton =
    document.getElementById("loginButton");

const operatorInput =
    document.getElementById("operatorName");

const loginError =
    document.getElementById("loginError");


loginButton.addEventListener(
    "click",
    login
);


operatorInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            login();
        }
    }
);


function login() {

    const name =
        operatorInput.value.trim();


    if (!name) {

        loginError.textContent =
            "Введите имя оператора.";

        return;
    }


    localStorage.setItem(
        "operatorName",
        name
    );


    window.location.href =
        "chat.html";
}