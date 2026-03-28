import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';
import {
  saveWorldState,
  subscribeToWorld,
  addNewsEvent,
  subscribeToNews
} from '../firebase/simulationService';
import { World } from '../engine/World';
import { NewsStream } from '../data/NewsStream';
import { STOCK_LIST } from '../data/StockList';
import InvestmentRadarChart from './InvestmentRadarChart';
import AIAssistant from './AIAssistant';

// 종목 뉴스 기반 에이전트 심리 분석
const getStockAnalysis = (stockNews) => {
  if (!stockNews || stockNews.length === 0) return null;
  const avgImpact = stockNews.reduce((sum, n) => sum + (n.impact || 0), 0) / stockNews.length;
  const posCount = stockNews.filter(n => (n.impact || 0) > 0.02).length;
  const negCount = stockNews.filter(n => (n.impact || 0) < -0.02).length;
  let signal, signalType, reason;
  if (avgImpact > 0.04) {
    signal = '매수 추천';
    signalType = 'success';
    reason = `긍정 신호 ${posCount}건 감지 — 상승 모멘텀 포착`;
  } else if (avgImpact < -0.04) {
    signal = '매도 추천';
    signalType = 'danger';
    reason = `부정 신호 ${negCount}건 감지 — 하방 리스크 주의`;
  } else {
    signal = '관망 추천';
    signalType = 'neutral';
    reason = `혼조 신호 (긍정 ${posCount} / 부정 ${negCount}) — 추세 확인 필요`;
  }
  return { signal, signalType, reason, avgImpact, posCount, negCount };
};

const Dashboard = () => {
  const [world, setWorld] = useState(null);
  const [news, setNews] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [tick, setTick] = useState(0);
  const [version] = useState("v2.0.0"); // Agent Roles + Confidence Upgrade

  // 종목 검색 상태
  const [stockQuery, setStockQuery] = useState('');
  const [stockDropdown, setStockDropdown] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockNews, setStockNews] = useState([]);
  const [stockAnalysis, setStockAnalysis] = useState(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);

  const worldRef = useRef(null);
  const newsStreamRef = useRef(new NewsStream());
  const timerRef = useRef(null);

  useEffect(() => {
    const newWorld = new World();
    worldRef.current = newWorld;
    setWorld(newWorld);

    const unsubscribeWorld = subscribeToWorld((data) => {
      if (data && worldRef.current) {
        setTick(data.tick || 0);
        worldRef.current.tickCount = data.tick || 0;
        
        if (data.agents) {
          worldRef.current.agents.forEach((agent, i) => {
            if (data.agents[i]) {
                agent.state.sentiment = data.agents[i].sentiment ?? agent.state.sentiment;
                agent.state.wealth = data.agents[i].wealth ?? agent.state.wealth;
                agent.state.knowledge = data.agents[i].knowledge ?? agent.state.knowledge;
            }
          });
        }
      }
    });

    const unsubscribeNews = subscribeToNews((newsData) => {
      if (Array.isArray(newsData)) {
        setNews(newsData);
      }
    });

    return () => {
      unsubscribeWorld();
      unsubscribeNews();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleTick = async () => {
    if (!worldRef.current) return;

    const summary = worldRef.current.tick();
    
    if (Math.random() < 0.20) {
      const nextNews = await newsStreamRef.current.generateNext();
      if (nextNews) {
        await addNewsEvent(nextNews);
        worldRef.current.addEvent(nextNews);
      }
    }

    const worldState = {
      tick: worldRef.current.tickCount,
      socialTemperature: summary.avgSentiment,
      societalKnowledge: summary.avgKnowledge,
      volatility: summary.volatility,
      momentum: summary.momentum,
      forecast: {
        probability: summary.avgSentiment > 0.5 ? 0.7 : 0.3,
        description: summary.prediction
      },
      investmentSignal: summary.investmentSignal,
      agents: worldRef.current.agents.map(a => ({
        id: a.id,
        sentiment: a.state.sentiment,
        wealth: a.state.wealth,
        knowledge: a.state.knowledge
      }))
    };
    
    await saveWorldState(worldState);
    setTick(worldRef.current.tickCount);
  };

  // 종목 검색 핸들러
  const handleStockQueryChange = (e) => {
    const q = e.target.value;
    setStockQuery(q);
    if (q.trim().length > 0) {
      setStockDropdown(STOCK_LIST.filter(s => s.name.includes(q.trim())).slice(0, 6));
    } else {
      setStockDropdown([]);
      setSelectedStock(null);
      setStockNews([]);
      setStockAnalysis(null);
    }
  };

  const selectStock = async (stock) => {
    setStockQuery(stock.name);
    setStockDropdown([]);
    setSelectedStock(stock);
    setIsLoadingStock(true);
    setStockNews([]);
    setStockAnalysis(null);
    const fetchedNews = await newsStreamRef.current.fetchStockNews(stock.name);
    setStockNews(fetchedNews);
    setStockAnalysis(getStockAnalysis(fetchedNews));
    setIsLoadingStock(false);
  };

  const clearStock = () => {
    setStockQuery('');
    setStockDropdown([]);
    setSelectedStock(null);
    setStockNews([]);
    setStockAnalysis(null);
  };

  const toggleSimulation = () => {
    if (isSimulating) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsSimulating(false);
    } else {
      setIsSimulating(true);
      timerRef.current = setInterval(handleTick, 3000);
    }
  };

  if (!world) return <div className="loading-screen">투자 예측 엔진 가동 준비 중...</div>;

  const currentSummary = worldRef.current.getSummary();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="title-area">
          <h1>FUTURE PREDICTOR <span>AI</span></h1>
          <span className="version-tag">{version}</span>
        </div>
        <div className="global-stats">
          <div className="stat-item">
            <span className="label">월드 틱(시간):</span>
            <span className="value glow">{tick}</span>
          </div>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="panel summary-panel">
          <div className="panel-header">
            <h2>세계 상태 및 분석 제어</h2>
          </div>
          
          <div className="controls active">
            <button 
              className={`btn-main ${isSimulating ? 'pulse' : ''}`}
              onClick={toggleSimulation}
            >
              {isSimulating ? '데이터 수집 중단' : '실시간 시뮬레이션 시작'}
            </button>
          </div>

          <div className="metrics-group">
            <div className="metric-card">
              <label>시장 심리 (Fear & Greed Index)</label>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${currentSummary.avgSentiment * 100}%` }}
                ></div>
              </div>
              <span className="metric-value">{(currentSummary.avgSentiment * 100).toFixed(1)}%</span>
            </div>

            <div className="metric-card">
                <label>시장 변동성 (Market Volatility)</label>
                <span className={`metric-value ${currentSummary.volatility > 0.15 ? 'neg' : 'pos'}`}>
                    {(currentSummary.volatility * 100).toFixed(2)}%
                </span>
            </div>
          </div>

          <div className="investment-radar">
              <div className="investment-radar-header">
                <h3>실시간 종합 분석 레이더</h3>
                <div className={`radar-display-pill ${currentSummary.investmentSignal.type}`}>
                    <span className="radar-signal">{currentSummary.investmentSignal.text}</span>
                    <span className="radar-momentum">
                        (모멘텀: <span className={currentSummary.momentum >= 0 ? 'pos' : 'neg'}>
                            {currentSummary.momentum >= 0 ? '▲' : '▼'}{(Math.abs(currentSummary.momentum) * 100).toFixed(2)}%
                        </span>)
                    </span>
                </div>
              </div>
              <div className="radar-canvas-container">
                  <InvestmentRadarChart summary={currentSummary} />
              </div>
          </div>

          <div className="forecast-box">
            <h3>미래 시나리오 예측</h3>
            <div className="probability-display">
                <div className="prob-circle">
                    <span className="prob-pct">{(currentSummary.avgSentiment > 0.5 ? 70 : 30)}%</span>
                </div>
                <p className="prob-desc">{currentSummary.prediction}</p>
            </div>
          </div>
        </section>

        <section className="panel news-panel">
          <div className="panel-header">
            <h2>{selectedStock ? `${selectedStock.name} 종목 뉴스` : '실시간 마켓 데이터 주입'}</h2>
            <div className="live-indicator">라이브</div>
          </div>
          <div className="news-feed">
            {selectedStock ? (
              isLoadingStock ? (
                <div className="news-empty">종목 뉴스 로딩 중...</div>
              ) : stockNews.length === 0 ? (
                <div className="news-empty">관련 뉴스를 찾을 수 없습니다.</div>
              ) : (
                stockNews.map((item, i) => (
                  <div key={item.id || i} className={`news-item ${item.type || 'social'}`}>
                    <div className="news-meta">
                      <span className="news-type">{
                          item.type === '금융' ? '금융지표' :
                          item.type === '지정학' ? '정치/국방' :
                          item.type === '과학' ? '기술혁신' : '사회동향'
                      }</span>
                      <span className="news-time">{item.timestamp}</span>
                    </div>
                    <p className="news-title">{item.title}</p>
                    <div className="news-impact">
                      종목 영향력: <span className={(item.impact || 0) >= 0 ? 'pos' : 'neg'}>
                        {((item.impact || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))
              )
            ) : (
              news.length === 0 ? (
                <div className="news-empty">글로벌 투자 이벤트를 기다리는 중...</div>
              ) : (
                news.map((item, i) => (
                  <div key={item.id || i} className={`news-item ${item.type || 'social'}`}>
                    <div className="news-meta">
                      <span className="news-type">{
                          item.type === '금융' ? '금융지표' :
                          item.type === '지정학' ? '정치/국방' :
                          item.type === '과학' ? '기술혁신' : '사회동향'
                      }</span>
                      <span className="news-time">{item.timestamp}</span>
                    </div>
                    <p className="news-title">{item.title}</p>
                    <div className="news-impact">
                      시장 영향력: <span className={(item.impact || 0) >= 0 ? 'pos' : 'neg'}>
                        {((item.impact || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </section>

        <section className="panel agents-panel">
          <div className="panel-header">
            <h2>에이전트 모니터링 (상위 세력)</h2>
          </div>

          {/* 종목 검색창 */}
          <div className="stock-search-section">
            <div className="stock-search-input-wrap">
              <input
                className="stock-search-input"
                type="text"
                placeholder="종목명 검색 (예: 삼성전자, 현대차)"
                value={stockQuery}
                onChange={handleStockQueryChange}
              />
              {selectedStock && (
                <button className="stock-clear-btn" onClick={clearStock}>✕</button>
              )}
            </div>
            {stockDropdown.length > 0 && (
              <div className="stock-dropdown">
                {stockDropdown.map(s => (
                  <div
                    key={s.code}
                    className="stock-dropdown-item"
                    onClick={() => selectStock(s)}
                  >
                    <span className="stock-dropdown-name">{s.name}</span>
                    <span className="stock-dropdown-market">{s.market}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 종목 에이전트 심리 분석 */}
          {selectedStock && (
            <div className="stock-analysis-card">
              <div className="stock-analysis-title">
                <span>{selectedStock.name}</span>
                <span className="stock-analysis-market">{selectedStock.market} · {selectedStock.code}</span>
              </div>
              {isLoadingStock ? (
                <div className="stock-analysis-loading">에이전트 심리 분석 중...</div>
              ) : stockAnalysis ? (
                <>
                  <div className={`stock-signal-badge ${stockAnalysis.signalType}`}>
                    {stockAnalysis.signal}
                  </div>
                  <div className="stock-analysis-reason">{stockAnalysis.reason}</div>
                  <div className="stock-analysis-stats">
                    <span>긍정 뉴스 <b className="pos">{stockAnalysis.posCount}</b>건</span>
                    <span>부정 뉴스 <b className="neg">{stockAnalysis.negCount}</b>건</span>
                    <span>평균 영향력 <b className={(stockAnalysis.avgImpact || 0) >= 0 ? 'pos' : 'neg'}>
                      {((stockAnalysis.avgImpact || 0) * 100).toFixed(1)}%
                    </b></span>
                  </div>
                </>
              ) : (
                <div className="stock-analysis-loading">분석 데이터 없음</div>
              )}
            </div>
          )}

          <div className="agent-list">
            {world.agents.slice(0, 10).map(agent => {
              const confidence = agent.getConfidence();
              return (
                <div key={agent.id} className="agent-card">
                  <div className="agent-info">
                    <div className="agent-name-wrap">
                      <span className="agent-name">{agent.roleLabel || `에이전트 ${agent.id}`}</span>
                      <span className="agent-id-badge">#{agent.id}</span>
                    </div>
                    <span className={`agent-mood ${confidence >= 65 ? 'happy' : confidence <= 35 ? 'sad' : ''}`}>
                      신뢰도: {confidence}%
                    </span>
                  </div>
                  <div className="agent-action">{agent.state.lastAction}</div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      
      <AIAssistant currentSummary={currentSummary} />
    </div>
  );
};

export default Dashboard;
