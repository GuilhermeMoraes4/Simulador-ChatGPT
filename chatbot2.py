# Importação de bibliotecas necessárias
from flask import Flask, render_template, request, jsonify
import openai
from decouple import config

# Configuração do aplicativo Flask
app = Flask(__name__, static_url_path='/static')

# Configuração da chave de API do GPT-3
openai.api_key = config("chave_api")

# Rota index
@app.route('/')
def index():
    # Rota de índice renderiza o template 'index.html'
    return render_template('index.html')

# Rota para processar as solicitações do usuário
@app.route('/process', methods=['POST'])
def process():
    user_input = request.json.get('user_input')

    # Adiciona a pergunta do usuário às mensagens
    messages = [{"role": "user", "content": user_input}]

    # Configurações da API para GPT-3.5-turbo
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-1106",
        messages=messages,
        temperature=0.7,
        max_tokens=2000
    )

    # Obtém a saída do modelo GPT-3.5-turbo
    model_output = response['choices'][0]['message']['content']

    response = {"role": "system", "content": model_output}
    return jsonify(response)

# Executa o aplicativo Flask
if __name__ == '__main__':
    app.run(config('host'), port=8000, debug=True)
