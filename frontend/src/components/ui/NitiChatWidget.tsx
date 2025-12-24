import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, ShieldCheck, FileSignature, MessageSquare } from 'lucide-react';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    action?: 'SHOW_DPDP_FORM' | 'SCROLL_PRICING' | 'SHOW_VERIFY_OPTIONS';
}

export const NitiChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hi! I'm Niti, your AI Compliance Assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-niti-widget', handleOpen);
        return () => window.removeEventListener('open-niti-widget', handleOpen);
    }, []);

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = { id: Date.now(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/niti/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMsg.text })
            });

            const data = await response.json();

            setTimeout(() => {
                const botMsg: Message = {
                    id: Date.now() + 1,
                    text: data.text,
                    sender: 'bot',
                    action: data.action
                };
                setMessages(prev => [...prev, botMsg]);
                setIsTyping(false);

                // Handle Actions
                if (data.action === 'SCROLL_PRICING') {
                    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }
            }, 1000); // Simulate thinking delay

        } catch (error) {
            console.error("Chat Error", error);
            setIsTyping(false);
        }
    };

    const handleSignDPDP = async () => {
        // Mock Signing Flow
        const signature = prompt("Please type your full name to digitally sign the DPDP Consent Form:");
        if (signature) {
            try {
                await fetch('/api/dpdp/sign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: 'guest_user', signature: signature }) // Signature would actually be a crypto hash in prod
                });
                setMessages(prev => [...prev, { id: Date.now(), text: "Consent Signed Successfully! Reference saved to Audit Log.", sender: 'bot' }]);
            } catch (e) {
                alert("Signing failed");
            }
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
                        style={{ maxHeight: '600px', height: '500px' }}
                    >
                        {/* Header */}
                        <div className="bg-emerald-600 p-4 flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    {/* Simple Robot SVGs could go here, using lucide for now */}
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Niti Assistant</h3>
                                    <p className="text-[10px] text-emerald-100 opacity-90">Powered by ComplianceDesk AI</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded transition">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                            ? 'bg-emerald-600 text-white rounded-tr-none'
                                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                                            }`}
                                    >
                                        {msg.text}
                                        {msg.action === 'SHOW_DPDP_FORM' && (
                                            <button
                                                onClick={handleSignDPDP}
                                                className="mt-3 flex items-center gap-2 w-full justify-center py-2 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100 transition text-xs"
                                            >
                                                <FileSignature size={14} /> Review & Sign Consent
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask about compliance..."
                                    className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputText.trim()}
                                    className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 mt-2">
                                DPDP Act 2023 Compliant • Audit Log Active
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Launcher Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center hover:bg-emerald-700 transition relative group"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}

                {/* Tooltip */}
                {!isOpen && (
                    <div className="absolute right-full mr-4 bg-white text-slate-800 px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                        Chat with Niti
                    </div>
                )}
            </motion.button>
        </div>
    );
};
