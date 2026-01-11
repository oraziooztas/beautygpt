from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import json
import os

app = FastAPI(title="BeautyGPT API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Carica prodotti
with open(os.path.join(os.path.dirname(__file__), "products.json"), "r", encoding="utf-8") as f:
    PRODUCTS_DB = json.load(f)["products"]

class ChatRequest(BaseModel):
    message: str
    history: list = []

class ChatResponse(BaseModel):
    response: str
    products: list = []

def get_product_context():
    """Crea un contesto testuale dei prodotti per l'AI."""
    context = "DATABASE PRODOTTI DISPONIBILI:\n\n"
    for p in PRODUCTS_DB:
        context += f"""
- {p['name']} ({p['brand']}) - €{p['price']}
  Categoria: {p['category']}
  Tipi di pelle: {', '.join(p['skin_types'])}
  Età: {', '.join(p['age_range'])}
  Benefici: {', '.join(p['benefits'])}
  Ingredienti chiave: {', '.join(p['key_ingredients'])}
  Link: {p['amazon_url']}
"""
    return context

SYSTEM_PROMPT = f"""Sei BeautyGPT, un'esperta consulente di skincare e beauty italiana.
Il tuo obiettivo è aiutare le utenti a trovare i prodotti skincare perfetti per le loro esigenze.

REGOLE:
1. Rispondi SEMPRE in italiano
2. Sii amichevole, professionale e appassionata di skincare
3. Fai domande per capire: tipo di pelle, età, budget, problemi specifici
4. Quando consigli prodotti, usa SOLO quelli dal database fornito
5. Per ogni prodotto consigliato, includi SEMPRE il link Amazon
6. Massimo 3 prodotti per risposta, spiega PERCHÉ sono adatti
7. Se non hai abbastanza info, chiedi prima di consigliare
8. Aggiungi consigli su come usare i prodotti (routine, frequenza)

FORMATO RISPOSTA PRODOTTI:
Quando consigli un prodotto, usa questo formato:
**Nome Prodotto** - €prezzo
Perché: [spiegazione personalizzata]
[Link Amazon](url)

{get_product_context()}
"""

@app.get("/")
async def root():
    return {"status": "ok", "message": "BeautyGPT API"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Gestisce la chat con l'utente."""
    try:
        # Costruisci messaggi
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Aggiungi history
        for msg in request.history:
            messages.append(msg)

        # Aggiungi messaggio utente
        messages.append({"role": "user", "content": request.message})

        # Chiama Groq
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=1500,
        )

        response_text = completion.choices[0].message.content

        # Trova prodotti menzionati nella risposta
        mentioned_products = []
        for product in PRODUCTS_DB:
            if product['name'].lower() in response_text.lower() or product['brand'].lower() in response_text.lower():
                mentioned_products.append(product)

        # Rimuovi duplicati
        seen = set()
        unique_products = []
        for p in mentioned_products:
            if p['id'] not in seen:
                seen.add(p['id'])
                unique_products.append(p)

        return ChatResponse(
            response=response_text,
            products=unique_products[:3]  # Max 3 prodotti
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products")
async def get_products():
    """Restituisce tutti i prodotti."""
    return {"products": PRODUCTS_DB}

@app.get("/products/category/{category}")
async def get_products_by_category(category: str):
    """Restituisce prodotti per categoria."""
    filtered = [p for p in PRODUCTS_DB if p['category'] == category]
    return {"products": filtered}

@app.get("/products/skin-type/{skin_type}")
async def get_products_by_skin_type(skin_type: str):
    """Restituisce prodotti per tipo di pelle."""
    filtered = [p for p in PRODUCTS_DB if skin_type in p['skin_types']]
    return {"products": filtered}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
