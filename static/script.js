const chatInput = document.querySelector("#chat-input"); // Seleciona a área de input do chat pelo ID
const sendButton = document.querySelector("#send-btn"); // Seleciona o botão de envio pelo ID
const chatContainer = document.querySelector(".chat-container"); // Seleciona o contêiner de chats pela classe
const themeButton = document.querySelector("#theme-btn"); // Seleciona o botão de mudar o tema pelo ID
const deleteButton = document.querySelector("#delete-btn"); // Seleciona o botão de excluir chat pelo ID

let userText = null; // Inicializa uma variável para armazenar o texto do usuário

const loadDataFromLocalstorage = () => {
    // Função para carregar chats e tema salvos do localStorage e aplicar/adicionar na página
    const themeColor = localStorage.getItem("themeColor");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
    <h1>Simulador ChatGPT</h1>
    <p>Olá! Sou um assistente virtual que utiliza a API do GPT-3.5, como posso lhe ajudar?</p>
</div>`;
    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const createChatElement = (content, className) => {
    // Função para criar e retornar um elemento de chat com o conteúdo fornecido e uma classe específica
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv;
};

const getChatResponse = async (incomingChatDiv) => {
    // Função para obter a resposta do chat usando uma requisição assíncrona
    const API_URL = "/process";
    const pElement = document.createElement("p");

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_input: userText
        })
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        const responseData = await response.json();
        pElement.textContent = responseData.content.trim();
    } catch (error) {
        pElement.classList.add("error");
        pElement.textContent = "Oops! Algo deu errado ao recuperar a resposta. Por favor, tente novamente.";
    }

    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const copyResponse = (copyBtn) => {
    // Função para copiar o texto de resposta para a área de transferência
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
};

const showTypingAnimation = () => {
    // Função para exibir a animação de digitação no chat
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="./static/chatbot.jpg" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;

    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
};

const handleOutgoingChat = () => {
    // Função para lidar com a entrada do usuário e exibir a animação de digitação
    userText = chatInput.value.trim();
    if (!userText) return;

    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="./static/user.jpg" alt="user-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

    const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
};

deleteButton.addEventListener("click", () => {
    // Evento de clique no botão de excluir chat
    if (confirm("Tem certeza de que deseja excluir todos os chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

themeButton.addEventListener("click", () => {
    // Evento de clique no botão de mudar o tema
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
    // Evento de input na área de input do chat
    chatInput.style.height = `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // Evento de tecla pressionada na área de input do chat
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

sendButton.addEventListener("click", handleOutgoingChat);

loadDataFromLocalstorage(); // Carrega dados do localStorage ao carregar a página
