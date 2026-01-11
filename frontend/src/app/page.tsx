"use client";

import { useState, useRef, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  amazon_url: string;
  image_url: string;
  skin_types: string[];
  benefits: string[];
  description: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Ciao! Sono BeautyGPT, la tua consulente skincare personale. Dimmi di te: qual e il tuo tipo di pelle? Hai problemi specifici che vorresti risolvere? Ti aiutero a trovare i prodotti perfetti per te!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Prepara history (escludi il messaggio iniziale del bot)
      const history = messages.slice(1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: history,
        }),
      });

      if (!response.ok) {
        throw new Error("Errore nella risposta");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        products: data.products,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Errore:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Mi dispiace, c'e stato un errore. Riprova tra poco!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Ho la pelle grassa, cosa mi consigli?",
    "Cerco un siero vitamina C sotto i 30 euro",
    "Quale SPF per pelle acneica?",
    "Routine anti-age per principianti",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  BeautyGPT
                </h1>
                <p className="text-xs text-gray-500">La tua consulente skincare AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm text-gray-500">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="max-w-4xl mx-auto px-4 pb-32">
        {/* Messages */}
        <div className="py-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-2xl rounded-br-md"
                    : "bg-white border border-pink-100 shadow-sm rounded-2xl rounded-bl-md"
                } px-4 py-3`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-xs">✨</span>
                    </div>
                    <span className="text-xs font-medium text-pink-500">BeautyGPT</span>
                  </div>
                )}
                <div
                  className={`text-sm leading-relaxed whitespace-pre-wrap ${
                    message.role === "user" ? "text-white" : "text-gray-700"
                  }`}
                >
                  {message.content}
                </div>

                {/* Product Cards */}
                {message.products && message.products.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {message.products.map((product) => (
                      <a
                        key={product.id}
                        href={product.amazon_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-3 border border-pink-100 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                            {product.category === "detergente" && "🧴"}
                            {product.category === "siero" && "💧"}
                            {product.category === "crema" && "🧴"}
                            {product.category === "spf" && "☀️"}
                            {product.category === "maschera" && "🎭"}
                            {product.category === "tonico" && "💦"}
                            {product.category === "contorno_occhi" && "👁️"}
                            {product.category === "esfoliante" && "✨"}
                            {product.category === "olio" && "🫒"}
                            {product.category === "labbra" && "💋"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.brand}</p>
                              </div>
                              <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                €{product.price.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {product.benefits.slice(0, 3).map((benefit, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-white/80 text-purple-600 px-2 py-0.5 rounded-full"
                                >
                                  {benefit}
                                </span>
                              ))}
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-xs text-pink-500 group-hover:text-pink-600">
                              <span>Acquista su Amazon</span>
                              <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-pink-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-xs">✨</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-3">Domande frequenti:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(q);
                  }}
                  className="bg-white border border-pink-200 text-pink-600 px-3 py-2 rounded-full text-sm hover:bg-pink-50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-pink-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Scrivi il tuo messaggio..."
              className="flex-1 bg-white border border-pink-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-gray-700 placeholder-gray-400"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                loading || !input.trim()
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:scale-105"
              }`}
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            BeautyGPT puo commettere errori. Consulta sempre un dermatologo per problemi seri.
          </p>
        </div>
      </div>
    </div>
  );
}
