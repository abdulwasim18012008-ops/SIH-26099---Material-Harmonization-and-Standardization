import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

export const MaterialAssistantScreen: React.FC = () => {
  const { setActiveScreen, showToast } = useApp();

  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState('');

    const sendMessage = async (preset?: string) => {
    const value = (preset ?? input).trim();

    if (!value) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      text: value,
    };

    setMessages(previous => [
      ...previous,
      userMessage,
    ]);

    setInput('');

    try {
      const { portalApi } = await import(
        '../services/apiClient'
      );

      const response =
        await portalApi.askAssistant(value);
        console.log('ASSISTANT BACKEND RESPONSE:', response);

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text:
          response?.answer ||
          'I could not generate an answer.',
      };

      setMessages(previous => [
        ...previous,
        assistantMessage,
      ]);

    } catch (error) {
      console.error(
        'Assistant request failed:',
        error
      );

      setMessages(previous => [
        ...previous,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text:
            'Unable to connect to the Material Intelligence Assistant.',
        },
      ]);

      showToast(
        'Assistant connection failed.',
        'error'
      );
    }
  };

  const quickQueries = [
  'What is material standardization?',
  'How does material matching work?',
  'What is classification?',
  'How does AI detect near duplicates?',
  'What is the national code?',
  'How does ERP migration work?',
];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full pb-16"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <button
            type="button"
            onClick={() => setActiveScreen('erp')}
            className="text-xs font-bold text-[#4a7c59] mb-2 hover:underline"
          >
            ← Back to ERP Integration
          </button>

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a5555a]">
              smart_toy
            </span>

            <h1 className="text-2xl font-serif font-bold text-[#2e3230]">
              Material Intelligence Assistant
            </h1>
          </div>

          <p className="text-sm text-[#4a4e4a] mt-1">
            Search and explain material intelligence from the unified master.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-full bg-[#c8e8d0] text-[#2a6038] text-[10px] font-bold">
          MATERIAL DATABASE CONNECTED
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <section className="bg-white rounded-2xl border border-[#e4e0d8] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#eae6de] bg-[#f0ece4]">
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#4a4e4a]">
              Material Intelligence
            </p>

            <h2 className="font-bold mt-1">
              Ask about your material master
            </h2>
          </div>

          <div className="p-5 min-h-[430px] max-h-[520px] overflow-y-auto space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    message.role === 'user'
                      ? 'bg-[#a5555a] text-white'
                      : 'bg-[#f5f1ea] border border-[#e4e0d8] text-[#2e3230]'
                  }`}
                >
                  <p className="text-[9px] uppercase font-bold opacity-70 mb-1">
                    {message.role === 'user'
                      ? 'You'
                      : 'Material Assistant'}
                  </p>

                  <p className="leading-relaxed">
                    {message.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-[#eae6de]">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') sendMessage();
                }}
                placeholder="Ask about a material, mapping or AI decision..."
                className="flex-1 px-4 py-3 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8] text-sm focus:outline-none"
              />

              <button
                type="button"
                onClick={() => sendMessage()}
                className="px-4 rounded-xl bg-[#a5555a] text-white"
              >
                <span className="material-symbols-outlined">
                  send
                </span>
              </button>
            </div>
          </div>
        </section>

        <aside className="bg-white rounded-2xl border border-[#e4e0d8] shadow-sm p-5 h-fit">
          <h2 className="font-bold">Suggested Queries</h2>

          <div className="mt-4 space-y-2">
            {quickQueries.map(query => (
              <button
                key={query}
                type="button"
                onClick={() => sendMessage(query)}
                className="w-full text-left p-3 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8] hover:bg-[#f0ece4] transition-colors"
              >
                <span className="material-symbols-outlined text-[17px] text-[#a5555a]">
                  search
                </span>

                <p className="text-[11px] font-semibold mt-1">
                  {query}
                </p>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => setActiveScreen('catalog')}
          className="px-5 py-2.5 rounded-xl bg-[#a5555a] text-white text-xs font-bold"
        >
          Return to Unified Catalog →
        </button>
      </div>

      <div className="hidden">
        <button
          type="button"
          onClick={() =>
            showToast('Assistant connection checked.', 'info')
          }
        />
      </div>
    </motion.div>
  );
};