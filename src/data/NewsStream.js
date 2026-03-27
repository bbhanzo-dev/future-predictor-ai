const RSS_FEEDS = [
  "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=ko&gl=KR&ceid=KR:ko", // 구글 뉴스 - 경제
  "https://news.google.com/rss/headlines/section/topic/POLITICS?hl=ko&gl=KR&ceid=KR:ko", // 구글 뉴스 - 정치
  "https://news.google.com/rss/headlines/section/topic/WORLD?hl=ko&gl=KR&ceid=KR:ko",    // 구글 뉴스 - 국제
  "https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=01&plink=RSSREADER",          // SBS - 정치
  "https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=02&plink=RSSREADER",          // SBS - 경제
  "https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=08&plink=RSSREADER",          // SBS - 국제
  "https://www.mk.co.kr/rss/30100041/",                                                  // 매일경제 - 경제
  "https://www.mk.co.kr/rss/30200030/",                                                  // 매일경제 - 정치
  "https://rss.hankookilbo.com/daily/all.xml",                                           // 한국일보 - 전체
  "https://news.google.com/rss/search?q=KOSPI&hl=ko&gl=KR&ceid=KR:ko",                    // KOSPI (English Search)
  "https://news.google.com/rss/search?q=%EC%BD%94%EC%8A%A4%ED%94%BC&hl=ko&gl=KR&ceid=KR:ko" // 코스피 (Korean Search)
];

// Simple keyword-based sentiment analyzer for Korean
const analyzeSentiment = (text) => {
  const positive = ["상승", "성장", "돌파", "성공", "체결", "협력", "낙관", "급등", "도약", "안정"];
  const negative = ["하락", "갈등", "위기", "폭락", "패닉", "침체", "감소", "둔화", "분쟁", "전쟁", "대립"];

  let score = 0;
  
  positive.forEach(word => {
    if (text.includes(word)) score += 0.05;
  });
  negative.forEach(word => {
    if (text.includes(word)) score -= 0.05;
  });

  return Math.max(-0.2, Math.min(0.2, score));
};

export class NewsStream {
  constructor() {
    this.history = [];
    this.realNewsBuffer = [];
  }

  async fetchRealNews() {
    try {
      // 볼륨을 늘리기 위해 한번에 3개의 랜덤 피드를 동시에 호출합니다 (중복 방지 셔플)
      const shuffled = [...RSS_FEEDS].sort(() => 0.5 - Math.random());
      const selectedFeeds = shuffled.slice(0, 3);
      
      const fetchPromises = selectedFeeds.map(feedUrl => 
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`)
          .then(res => res.json())
          .then(data => data.items ? data.items.map(item => ({...item, _feedUrl: feedUrl})) : [])
          .catch(err => { console.error("피드 로드 에러:", err); return []; })
      );

      const results = await Promise.all(fetchPromises);
      const allItems = results.flat();
      
      if (allItems && allItems.length > 0) {
        const filterKeywords = [
          "로제", "아파트", "apt", "연예", "가수", "배우", "아이돌", "블랙핑크", "방탄소년단", "bts", "드라마", "영화", "콘서트", "예능", "뮤직비디오", "컴백", "엔터", "걸그룹", "보이그룹", "스타", "빌보드", "음원", "음반", "k팝", "k-pop",
          "날씨", "기온", "강수량", "미세먼지", "초미세먼지", "폭염", "장마", "일교차", "한파", "특보", "주의보", "태풍", "비가", "눈이", "흐림",
          "스포츠", "슛", "골", "경기", "프로야구", "프로축구", "프리미어리그", "k리그", "올림픽", "월드컵", "감독", "선수", "우승", "메달", "홈런", "토트넘", "양궁", "탁구", "마라톤"
        ];
        
        let filteredItems = allItems.filter(item => {
          const text = (item.title + " " + (item.content || "")).toLowerCase();
          return !filterKeywords.some(keyword => text.includes(keyword));
        });

        // 셔플하여 특정 피드에 안 쏠리게 조정
        filteredItems = filteredItems.sort(() => 0.5 - Math.random());

        this.realNewsBuffer = filteredItems.map(item => {
          let title = item.title;
          return {
            title: title,
            impact: analyzeSentiment(item.title + " " + item.content),
            type: this.categorize(item.title + " " + item.content),
            id: item.guid || Math.random().toString(36),
            timestamp: new Date().toLocaleTimeString()
          };
        });
        console.log(`성공적으로 ${this.realNewsBuffer.length}개의 최신 뉴스 수집 (3개 소스 통합).`);
      }
    } catch (err) {
      console.error("뉴스 수집 실패:", err);
    }
  }

  categorize(text) {
    const t = text.toLowerCase();
    if (t.includes("경제") || t.includes("금리") || t.includes("시장") || t.includes("환율") || 
        t.includes("코스피") || t.includes("kospi") || t.includes("증시") || t.includes("지수")) return "금융";
    if (t.includes("국정") || t.includes("정부") || t.includes("정치") || t.includes("전쟁")) return "지정학";
    if (t.includes("사회") || t.includes("환경") || t.includes("시민")) return "사회";
    if (t.includes("과학") || t.includes("기술") || t.includes("메타") || t.includes("AI")) return "과학";
    return "사회";
  }

  async fetchStockNews(stockName) {
    try {
      const feedUrl = `https://news.google.com/rss/search?q=${stockName}+주식&hl=ko&gl=KR&ceid=KR:ko`;
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
      const data = await res.json();
      if (!data.items || data.items.length === 0) return [];
      return data.items.slice(0, 15).map(item => ({
        title: item.title.replace(/ - Google 뉴스.*/, ''),
        impact: analyzeSentiment(item.title + ' ' + (item.content || '')),
        type: this.categorize(item.title + ' ' + (item.content || '')),
        id: item.guid || Math.random().toString(36),
        timestamp: new Date().toLocaleTimeString()
      }));
    } catch (err) {
      console.error('종목 뉴스 수집 실패:', err);
      return [];
    }
  }

  async generateNext() {
    if (this.realNewsBuffer.length === 0) {
      await this.fetchRealNews();
    }

    if (this.realNewsBuffer.length === 0) {
        return {
            title: "시스템 안정화: 실시간 데이터 네트워크 동기화 중",
            impact: 0.02,
            type: "social",
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString()
        };
    }

    const event = this.realNewsBuffer.shift();
    this.history.push(event);
    if (this.history.length > 20) this.history.shift();
    return event;
  }
}
