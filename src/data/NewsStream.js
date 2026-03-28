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

/**
 * Keyword-based Korean financial sentiment analyzer.
 * High-weight keywords (±0.12) for major market-moving words,
 * medium-weight (±0.06) for general positive/negative signals.
 * Cap: ±0.35 to allow meaningful non-zero impact on most news.
 */
const analyzeSentiment = (text) => {
  // Strip HTML tags, normalize to lowercase
  const clean = text.replace(/<[^>]*>/g, ' ').toLowerCase();

  const POSITIVE_HIGH = [
    "급등", "폭등", "사상 최고", "최고가", "신고가", "대폭 상승", "어닝 서프라이즈",
    "강세 전환", "급반등", "돌파 성공", "수출 급증", "흑자 전환", "대규모 수주",
  ];
  const POSITIVE_MED = [
    "상승", "성장", "돌파", "성공", "체결", "협력", "낙관", "도약", "안정", "회복",
    "개선", "확대", "증가", "호조", "흑자", "수주", "투자 확대", "실적 개선",
    "반등", "강세", "호재", "상향", "수혜", "매수", "기대감", "훈풍", "상향 조정",
    "견조", "양호", "긍정적", "선방", "역대 최대", "최대 실적",
  ];
  const NEGATIVE_HIGH = [
    "폭락", "급락", "패닉", "파산", "디폴트", "붕괴", "쇼크", "대폭 하락",
    "위기 심화", "대규모 적자", "긴급 구제", "시장 붕괴", "뱅크런",
  ];
  const NEGATIVE_MED = [
    "하락", "갈등", "위기", "침체", "감소", "둔화", "분쟁", "전쟁", "대립",
    "제재", "악화", "적자", "손실", "부진", "우려", "경고", "긴축", "불안",
    "약세", "리스크", "급감", "충격", "불확실", "경기 하강", "매도", "투매",
    "손실 확대", "부도", "경기 침체", "물가 급등", "금리 인상", "역성장",
  ];

  let score = 0;
  POSITIVE_HIGH.forEach(w => { if (clean.includes(w)) score += 0.12; });
  POSITIVE_MED.forEach(w => { if (clean.includes(w)) score += 0.06; });
  NEGATIVE_HIGH.forEach(w => { if (clean.includes(w)) score -= 0.12; });
  NEGATIVE_MED.forEach(w => { if (clean.includes(w)) score -= 0.06; });

  return Math.max(-0.35, Math.min(0.35, score));
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
          if (filterKeywords.some(keyword => text.includes(keyword))) return false;

          // X(트위터) 출처 뉴스 차단
          const link = (item.link || item.guid || "").toLowerCase();
          const source = (item.author || item.source || "").toLowerCase();
          if (link.includes("x.com") || link.includes("twitter.com")) return false;
          if (source.includes("x.com") || source.includes("twitter.com") || source === "x") return false;

          return true;
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
    // HTML 태그 제거 후 분류
    const t = text.replace(/<[^>]*>/g, ' ').toLowerCase();

    // 금융 — 주가·실적·시장 관련 키워드 대폭 확장
    if (t.includes("경제") || t.includes("금리") || t.includes("시장") || t.includes("환율") ||
        t.includes("코스피") || t.includes("kospi") || t.includes("증시") || t.includes("지수") ||
        t.includes("주가") || t.includes("주식") || t.includes("실적") || t.includes("매출") ||
        t.includes("영업이익") || t.includes("순이익") || t.includes("반도체") || t.includes("배터리") ||
        t.includes("상장") || t.includes("etf") || t.includes("펀드") || t.includes("채권") ||
        t.includes("투자") || t.includes("증권") || t.includes("코스닥") || t.includes("ipo")) return "금융";

    // 지정학 — 정치·외교·안보 키워드
    if (t.includes("국정") || t.includes("정부") || t.includes("정치") || t.includes("전쟁") ||
        t.includes("외교") || t.includes("제재") || t.includes("무역") || t.includes("관세") ||
        t.includes("분쟁") || t.includes("국방") || t.includes("안보") || t.includes("대통령")) return "지정학";

    // 과학/기술
    if (t.includes("과학") || t.includes("기술") || t.includes("메타") || t.includes("ai") ||
        t.includes("인공지능") || t.includes("반도체") || t.includes("로봇") || t.includes("우주") ||
        t.includes("특허") || t.includes("연구") || t.includes("개발")) return "과학";

    // 사회
    if (t.includes("사회") || t.includes("환경") || t.includes("시민") || t.includes("복지")) return "사회";

    return "사회";
  }

  async fetchStockNews(stockName) {
    try {
      const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(stockName + ' 주식')}&hl=ko&gl=KR&ceid=KR:ko`;
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
      const data = await res.json();

      // API 오류 또는 빈 결과 처리
      if (data.status !== 'ok' || !data.items || data.items.length === 0) {
        console.warn(`종목 뉴스 없음 (${stockName}):`, data.message || 'no items');
        return [];
      }

      const filtered = data.items.filter(item => {
        const link   = (item.link || item.guid || "").toLowerCase();
        const source = (item.author || item.source || "").toLowerCase();
        if (link.includes("x.com") || link.includes("twitter.com")) return false;
        if (source.includes("x.com") || source.includes("twitter.com") || source === "x") return false;
        return true;
      });

      return filtered.slice(0, 15).map(item => {
        // " - 언론사명" 형태의 접미사를 모두 제거 (Google 뉴스, 한국경제, 조선일보 등)
        const cleanTitle = (item.title || '').replace(/\s*-\s*[^-]+$/, '').trim();
        const fullText   = cleanTitle + ' ' + (item.content || '');
        return {
          title:     cleanTitle,
          impact:    analyzeSentiment(fullText),
          type:      this.categorize(fullText),
          id:        item.guid || Math.random().toString(36),
          timestamp: new Date().toLocaleTimeString(),
        };
      });
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
