/**
 * Represents an autonomous agent in the simulation.
 * Each agent has unique personality traits and social behavioral logic.
 */
export class Agent {
  constructor(id, traits = {}) {
    this.id = id;
    this.name = `에이전트 ${id}`; // Translated
    
    // Core Traits (0.0 to 1.0)
    this.traits = {
      riskTolerance: traits.riskTolerance || Math.random(),
      socialInfluence: traits.socialInfluence || Math.random(),
      curiosity: traits.curiosity || Math.random(),
      empathy: traits.empathy || Math.random(),
      idealism: traits.idealism || Math.random(),
    };

    // State
    this.state = {
      sentiment: 0.5, // 0 (Panic) to 1 (Euphoria)
      wealth: 1000,
      knowledge: 0,
      lastAction: '관찰 중', // Translated
      socialNetwork: [], 
    };

    this.memory = []; 
  }

  /**
   * Perceive a world event and adjust internal state.
   */
  perceive(event) {
    const impact = event.impact || 0;
    const type = event.type; 
    
    // Personality-based perception
    let multiplier = 1;
    // Fix categorization mismatch (NewsStream uses Korean)
    if (type === 'financial' || type === '금융') multiplier = this.traits.riskTolerance;
    if (type === 'geopolitical' || type === '지정학') multiplier = 1 - this.traits.empathy;

    const delta = impact * multiplier;
    this.state.sentiment = Math.max(0, Math.min(1, this.state.sentiment + delta));
    
    this.memory.push({
      timestamp: Date.now(),
      event: event.title,
      reaction: delta > 0 ? '긍정' : '부정' // Translated
    });

    if (this.memory.length > 50) this.memory.shift();
  }

  /**
   * Interact with another agent. (Social Evolution)
   */
  interact(other) {
    const influenceDiff = this.traits.socialInfluence - other.traits.socialInfluence;
    
    // Soften convergence (don't instantly average, move incrementally)
    const rate = 0.1 + (Math.random() * 0.1); 
    
    if (influenceDiff > 0) {
      const shift = (this.state.sentiment - other.state.sentiment) * rate;
      other.state.sentiment = Math.max(0, Math.min(1, other.state.sentiment + shift));
      this.state.lastAction = `${other.name}에게 영향력을 행사함`; // Translated
    } else {
      const shift = (other.state.sentiment - this.state.sentiment) * rate;
      this.state.sentiment = Math.max(0, Math.min(1, this.state.sentiment + shift));
      this.state.lastAction = `${other.name}의 의견에 동조함`; // Translated
    }
    
    if (Math.random() > 0.95) {
      this.state.knowledge += 1;
    }
  }

  /**
   * Decide next action based on current state and news.
   */
  step() {
    // 1. Mean Reversion (Sentiment slowly drifts back towards 0.5)
    // 2. Random Noise (Market volatility creation)
    const meanReversionRate = 0.005; 
    const noise = (Math.random() - 0.5) * 0.02 * this.traits.curiosity;
    
    this.state.sentiment += (0.5 - this.state.sentiment) * meanReversionRate + noise;
    
    // Contrarian behavior: Extreme panic might suddenly cause a bounce (buying the dip)
    if (this.state.sentiment < 0.1 && Math.random() < this.traits.riskTolerance * 0.1) {
       this.state.sentiment += 0.2; // Buy the dip
       this.state.lastAction = '저점 매수 (Contrarian Buy)';
    } else if (this.state.sentiment > 0.9 && Math.random() < this.traits.riskTolerance * 0.1) {
       this.state.sentiment -= 0.2; // Take profit
       this.state.lastAction = '차익 실현 (Take Profit)';
    } else {
        // Normal bounds
        this.state.sentiment = Math.max(0, Math.min(1, this.state.sentiment));
        
        if (this.state.sentiment < 0.2) {
          this.state.lastAction = '패닉 셀링 / 방어적 자산 보호'; // Translated
        } else if (this.state.sentiment > 0.8) {
          this.state.lastAction = '적극적 투자 / 자산 확장'; // Translated
        } else {
          this.state.lastAction = '커뮤니티 내 사회적 소통 활동'; // Translated
        }
    }
  }
}
