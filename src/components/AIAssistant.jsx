import React, { useState, useRef, useEffect } from 'react';
import './AIAssistant.css';

const AIAssistant = ({ currentSummary }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '안녕하세요! Future Predictor AI 비서입니다. 현재 시뮬레이션 상황에 대해 무엇이든 물어보세요.' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputVal.trim()) return;

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      setMessages(prev => [...prev, 
        { role: 'user', text: inputVal },
        { role: 'assistant', text: '죄송합니다. VITE_GEMINI_API_KEY가 설정되지 않았습니다. .env.local 파일에 봇의 구글 Gemini API 키를 적용해주세요.' }
      ]);
      setInputVal('');
      return;
    }

    const userMessage = inputVal;
    setInputVal('');
    
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    const systemInstruction = `
당신은 'Future Predictor AI'라는 실시간 투자 시뮬레이터를 보조하는 천재적인 AI 비서입니다. 
당신은 현재 시뮬레이터의 실시간 상태를 파악하고 있으며, 사용자가 시뮬레이션 상태나 금융/경제/사회 현상에 대해 질문하면 전문가처럼 날카롭고 직관적으로 답변해야 합니다.
답변은 꼭 간략하고 명확하게 한국어로 답변하세요.

[현재 시뮬레이션 실시간 요약 데이터]
- 틱(경과 시간): ${currentSummary?.tick || 0}
- 시장 심리 (0% 패닉 ~ 100% 과열): ${((currentSummary?.avgSentiment || 0) * 100).toFixed(1)}%
- 시장 변동성: ${((currentSummary?.volatility || 0) * 100).toFixed(1)}%
- 모멘텀 지표 (최근 분위기 증감): ${currentSummary?.momentum >= 0 ? '+' : ''}${((currentSummary?.momentum || 0) * 100).toFixed(2)}%
- 현재 투자 레이더 AI 신호: ${currentSummary?.investmentSignal?.text || '관망'}
- 미래 예측 시나리오: ${currentSummary?.prediction || '안정적 성장'}
- 최근 뉴스/이벤트 내용: ${currentSummary?.activeEvent ? currentSummary.activeEvent.title : '특이사항 없음'}
`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userMessage }]
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.error) {
          throw new Error(data.error.message);
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '응답을 이해하지 못했습니다.';
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', text: `오류가 발생했습니다: ${error.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className={`ai-assistant-container ${isOpen ? 'open' : 'closed'}`}>
      <button className="ai-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '비서 닫기 ▼' : 'AI 비서 호출 ▲'}
      </button>

      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <h3>미래 예측 AI 비서</h3>
            <span className="live-badge">Live 분석 중</span>
          </div>
          <div className="ai-chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.role}`}>
                <div className="bubble-content">
                    {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
                <div className="chat-bubble assistant typing">
                    <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="ai-chat-input-area">
            <input 
              type="text" 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="예: 지금 시장 폭락 전조야?" 
            />
            <button onClick={handleSend} disabled={isTyping}>전송</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
