# 🛍️ Northwind Gourmet Market & Jev IA (TypeSafe AI)

Plataforma de e-commerce moderna desenvolvida sobre a base histórica de dados da **Northwind Traders**, integrada ao modelo de inteligência artificial **Jev (TypeSafe AI - System One)** para recomendações dinâmicas de cross-sell e harmonização gastronômica em tempo real conforme o cliente adiciona itens à cesta.

---

## 🌟 Destaques do Projeto

- **Catálogo Gourmet Completo**: 77 produtos artesanais distribuídos nas 8 categorias clássicas da Northwind (Bebidas, Condimentos, Confeitos, Laticínios, Grãos & Cereais, Carnes & Aves, Hortifrúti e Frutos do Mar).
- **Motor de Decisão Jev IA (System One)**:
  - Implementação fiel das primitivas do TypeSafe AI:
    - `Choice`: Seleção do melhor produto complementar com distribuição calibrada de probabilidades e índice de confiança (`confidence`).
    - `Score`: Avaliação de 1 a 4 da nota de harmonização gastronômica com a cesta atual.
    - `Noul`: Estimativa da probabilidade direta de aceitação da compra casada (`upsell`).
- **Arquitetura Híbrida de Alta Disponibilidade**:
  - Comunica-se com a nuvem da TypeSafe AI via endpoint oficial (`https://api.typesafe.ai/v1/systemone`) caso a chave `TYPESAFE_API_KEY` esteja presente.
  - Possui motor local calibrado de inferência matemática System One alimentado pelas 16.282 compras e 609.283 registros de `Order Details` do Northwind, garantindo que o sistema funcione 100% offline, com zero latência e sem quebrar.
- **Painel Inspector TypeSafe**:
  - Modal interativo para inspecionar os payloads brutos de requisição e resposta do System One, tokens utilizados e gráficos de probabilidade, exatamente como no playground oficial da TypeSafe.
- **Frontend Gourmet & Dark Mode**:
  - Interface rica com glassmorphism, gradientes HSL sob medida, micro-animações, gaveta de carrinho animada e barra de frete grátis progressiva.

---

## 🚀 Como Executar

### 1. Pré-requisitos
- Python 3.10+ (utiliza apenas bibliotecas nativas, sem necessidade de `pip install` externo).

### 2. Iniciar o Servidor
```bash
cd northwind-market-jev
python3 server.py
```
Acesse a loja no seu navegador em: `http://localhost:8080`

### 3. (Opcional) Configurar Chave da TypeSafe AI
Adicione sua chave no arquivo `.env`:
```env
TYPESAFE_API_KEY=ts_live_...
```
Ou configure e teste diretamente na interface web através do botão **Jev IA** no canto superior direito.

---

## 🏗️ Estrutura de Pastas

```
northwind-market-jev/
├── data/
│   ├── catalog.json          # 77 produtos enriquecidos com tags e emojis
│   └── affinity.json         # Matriz de co-ocorrência dos 16.282 pedidos
├── src/
│   └── jev_engine.py         # Motor de Recomendação TypeSafe System One
├── static/
│   ├── index.html            # Interface de e-commerce
│   ├── styles.css            # Design System Gourmet Dark Mode
│   └── app.js                # Lógica reativa do carrinho e chamadas de IA
├── server.py                 # Servidor HTTP e API REST
├── Dockerfile                # Containerização para deploy na nuvem
├── .env.example              # Variáveis de ambiente de exemplo
└── README.md                 # Documentação técnica do projeto
```
