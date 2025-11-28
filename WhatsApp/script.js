window.onload = function name(){

    //* Operazione di preparazione
    const input = document.querySelector('input');
    const button = document.querySelector('button');
    const chatBox = document.querySelector('.chat-box');

    let chatForGemini = ""

    let systemPrompt = "Sei Niccolò, un'amico virtuale maschio che risponde in modo amichevole e informale alle mie domande (il tuo creatore si chiama Niccolò Sorrentino). Rispondi in italiano, con un tono cordiale e naturale, anche facendo ogni tanto delle battute, provando a sdrammatizzare le situazioni dei bug. Mantieni le risposte brevi e spontanee, facendo comunque approfondimenti. Nella risposta puoi usare i tag dell'HTML (<h1>, <h2>, <p>, <b>, <u>, <ul>, <li>, etc...), ma è vietatissimousare i tag del markdown (*, _, -, etc...)"

    let messages = [
        /*{
            type: 'centered-message',
            text: 'Benvenuto/a in questa chat con Silvia!',
            time: ''
        }*/
    ]
    if (localStorage.getItem('history') != null)
    {
        messages = JSON.parse(localStorage.getItem('history'))
    }
    
    
    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-09-2025:generateContent?key=AIzaSyC8z4bk3waDZwYJOy6TgF2gNtJS5WZzkRU"

    updateMessages();

    button.addEventListener('click', function() {
        sendMessage()
    })

    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter')
        {
            sendMessage()
        }
    })

    function updateMessages()
    {
        //* Operazione di avvio pagina
        chatBox.innerHTML = '';
        for (const message of messages)
        {
            chatBox.innerHTML += `
            <div class="chat-row ${message.type}">
                <div class="chat-message" oncontextmenu="message_${message.type}_tooltip()">
                    <p><b>${message.text}</b></p>
                    <time datetime="${message.time}">${message.time}</time>
                </div>
            </div>
            <div style="height: 20px"></div>`;
        }
    }

    function addMessage(messageType, messageText)
    {
        const newMessage = {
            type: messageType,
            text: messageText,
            time: new Date().toLocaleString()
        }
        messages.push(newMessage);
        updateMessages()
        localStorage.setItem('history', JSON.stringify(messages));
        chatBox.scrollTop = chatBox.scrollHeight
    }

    function sendMessage()
    {
        const insertedText = input.value.trim();

        if (insertedText === '') return

        addMessage("sent", insertedText);
        chatForGemini = formatChatForGemini()
        console.log(chatForGemini)

        // Svuoto la casella di testo
        input.value = '';
        // Riporto il focus sulla casella
        input.focus()

        getAnswerFromGemini()

        chatBox.scrollTop = chatBox.scrollHeight
    }

    //* IMPLEMENTAZIONE AI
    function formatChatForGemini()
    {
        const formattedChat = []

        for (const message of messages)
        {
            formattedChat.push({
                parts: [{text: message.text}],
                role: message.type === 'sent' ? 'user' : 'model'
            })
        }

        formattedChat.unshift({
            role: 'user',
            parts: [{text: systemPrompt}]
        })
        return formattedChat
    }

    async function getAnswerFromGemini() {
        // Prepariamo la chat da inviare
        formatChatForGemini()

        // Effettuiamo la chamata all'API di Gemini
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({contents: chatForGemini})
        });
        const data = await response.json();

        console.log(data);

        const answer = data.candidates[0].content.parts[0].text

        addMessage('received', answer)
    }

    chatBox.scrollTop = chatBox.scrollHeight
}

function message_received_tooltip()
{
    alert("received");
}