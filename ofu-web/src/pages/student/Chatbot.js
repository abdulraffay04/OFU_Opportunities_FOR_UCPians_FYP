import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import StudentLayout from '../../components/StudentLayout';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { Mic } from 'lucide-react';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const isSpeechSupported = !!SpeechRecognition;

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `# 👋 Welcome to OFU AI Career Mentor

I can help you with:

- Career Guidance
- Internships
- Scholarships
- Resume Building
- UCP Information
- Alumni Mentorship

How can I assist you today?`,
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, isTyping]);

  async function handleSend() {
    const trimmedMessage = inputMessage.trim();

    if (!trimmedMessage) return;

    const userMessage = {
      role: 'user',
      text: trimmedMessage,
    };

    setMessages((prev) => [...prev, userMessage]);

    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await api.post('/ai/chat', {
        message: trimmedMessage,
      });

      const botText =
        response?.data?.data?.response ||
        'I received your message.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: botText,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: '⚠️ Sorry, I am having trouble connecting right now. Please try again later.',
        },
      ]);
    }

    setIsTyping(false);
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function startListening() {
    if (!isSpeechSupported) {
      toast.error(
        'Voice input is not supported in this browser.'
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const spokenText =
        event.results[0][0].transcript;

      setInputMessage((prev) =>
        prev ? prev + ' ' + spokenText : spokenText
      );
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error === 'not-allowed') {
        toast.error(
          'Microphone permission denied.'
        );
      } else {
        toast.error(
          'Could not hear you clearly.'
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  return (
    <StudentLayout>
      <div className="h-[calc(100vh-120px)] flex flex-col">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Career Mentor
          </h1>

          <p className="text-gray-500 mt-1">
            Ask anything about careers, internships,
            scholarships, resume building, or UCP.
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="space-y-6">

              {messages.map((message, index) => {
                const isBot =
                  message.role === 'bot';

                return (
                  <div
                    key={index}
                    className={`flex ${
                      isBot
                        ? 'justify-start'
                        : 'justify-end'
                    }`}
                  >
                    {isBot ? (
                      <div className="flex gap-3 max-w-[85%]">

                        {/* AI Avatar */}
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                          AI
                        </div>

                        {/* AI Message */}
                        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">

                          <div className="prose prose-sm max-w-none text-gray-800">
                            <ReactMarkdown>
                              {message.text}
                            </ReactMarkdown>
                          </div>

                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[70%] bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-sm">
                        <p className="whitespace-pre-wrap leading-7">
                          {message.text}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">

                  <div className="flex gap-3">

                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                      AI
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
                      <div className="flex gap-1">
                        <span className="animate-bounce">
                          ●
                        </span>
                        <span
                          className="animate-bounce"
                          style={{
                            animationDelay: '0.1s',
                          }}
                        >
                          ●
                        </span>
                        <span
                          className="animate-bounce"
                          style={{
                            animationDelay: '0.2s',
                          }}
                        >
                          ●
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              <div ref={chatEndRef}></div>

            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4">

            {isListening && (
              <p className="text-sm text-indigo-600 mb-2">
                🎤 Listening...
              </p>
            )}

            <div className="flex items-center gap-3">

              <input
                type="text"
                value={inputMessage}
                onChange={(e) =>
                  setInputMessage(e.target.value)
                }
                onKeyDown={handleKeyPress}
                placeholder="Ask your question..."
                disabled={isTyping}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />

              <button
                onClick={startListening}
                disabled={isTyping}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                  isListening
                    ? 'bg-red-100 text-red-500 animate-pulse'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>

              <button
                onClick={handleSend}
                disabled={
                  isTyping ||
                  !inputMessage.trim()
                }
                className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center disabled:opacity-50"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>

            </div>
          </div>

        </div>
      </div>
    </StudentLayout>
  );
}

export default Chatbot;