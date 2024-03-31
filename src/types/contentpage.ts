export interface Contentpages {
    _title: string;
    _activeDate: string;
    lastModified: string;
    _locale: string;
    loginmessage: Loginmessage;
    survivalmessage: Loginmessage;
    athenamessage: Loginmessage;
    subgameselectdata: Subgameselectdata;
    savetheworldnews: Loginmessage;
    battlepassaboutmessages: Battlepassaboutmessages;
    playlistinformation: Playlistinformation;
    tournamentinformation: Tournamentinformation;
    emergencynotice: Emergencynotice;
    emergencynoticev2: Emergencynoticev2;
    koreancafe: Koreancafe;
    creativeAds: CreativeAds;
    playersurvey: Playersurvey;
    creativeFeatures: CreativeFeatures;
    specialoffervideo: Specialoffervideo2;
    subgameinfo: Subgameinfo;
    lobby: Lobby;
    battleroyalenews: Battleroyalenews;
    dynamicbackgrounds: Dynamicbackgrounds;
    shopSections: ShopSections;
    creativenews: Creativenews;
    _suggestedPrefetch: any[];
    [key: string]: any;
  }
  
  interface Creativenews {
    news: News3;
    _title: string;
    header: string;
    style: string;
    _noIndex: boolean;
    alwaysShow: boolean;
    _activeDate: string;
    lastModified: string;
    _locale: string;
  }
  
  interface News3 {
    _type: string;
    messages: Message4[];
  }
  
  interface ShopSections {
    _title: string;
    sectionList: SectionList;
    _noIndex: boolean;
    _activeDate: string;
    lastModified: string;
    _locale: string;
    _templateName: string;
  }
  
  interface SectionList {
    _type: string;
    sections: Section[];
  }
  
  interface Section {
    bSortOffersByOwnership: boolean;
    bShowIneligibleOffersIfGiftable: boolean;
    bEnableToastNotification: boolean;
    background: Background;
    _type: string;
    landingPriority: number;
    bHidden: boolean;
    sectionId: string;
    bShowTimer: boolean;
    sectionDisplayName: string;
    bShowIneligibleOffers: boolean;
  }
  
  interface Dynamicbackgrounds {
    backgrounds: Backgrounds;
    _title: string;
    _noIndex: boolean;
    _activeDate: string;
    lastModified: string;
    _locale: string;
  }
  
  interface Backgrounds {
    backgrounds: Background[];
    _type: string;
  }
  
  interface Background {
    backgroundimage?: string;
    stage: string;
    _type: string;
    key: string;
  }
  
  interface Battleroyalenews {
    news: News2;
    _title: string;
    header: string;
    style: string;
    _noIndex: boolean;
    alwaysShow: boolean;
    _activeDate: string;
    lastModified: string;
    _locale: string;
  }
  
  interface News2 {
    platform_messages: Platformmessage[];
    _type: string;
    messages: Message4[];
  }
  
  interface Message4 {
    image: string;
    hidden: boolean;
    _type: string;
    adspace: string;
    title: string;
    body: string;
    spotlight: boolean;
  }
  
  interface Platformmessage {
    hidden: boolean;
    _type: string;
    message: Message3;
    platform: string;
  }
  
  interface Message3 {
    image: string;
    hidden: boolean;
    _type: string;
    subgame: string;
    title: string;
    body: string;
    spotlight: boolean;
  }
  
  interface Lobby {
    backgroundimage: string;
    stage: string;
    _title: string;
    _activeDate: string;
    lastModified: string;
    _locale: string;
  }
  
  interface Subgameinfo {
    battleroyale: Battleroyale;
    savetheworld: Savetheworld;
    _title: string;
    _noIndex: boolean;
    creative: Creative;
    _activeDate: string;
    lastModified: string;
    _locale: string;
  }
  
  interface Creative {
    image: string;
    color: string;
    _type: string;
    description: Title;
    subgame: string;
    title: Title;
    standardMessageLine1: string;
  }
  
  interface Savetheworld {
    image: string;
    color: string;
    specialMessage: string;
    _type: string;
    description: Title;
    subgame: string;
    title: Title;
  }
  
  interface Battleroyale {
    image: string;
    color: string;
    _type: string;
    description: Title;
    subgame: string;
    standardMessageLine2: string;
    title: Title;
    standardMessageLine1: string;
  }
  
  interface Specialoffervideo2 {
    _activeDate: string;
    _locale: string;
    _noIndex: boolean;
    _title: string;
    bSpecialOfferEnabled: boolean;
    'jcr:baseVersion': string;
    'jcr:isCheckedOut': boolean;
    lastModified: string;
    specialoffervideo: Specialoffervideo;
  }
  
  interface Specialoffervideo {
    _type: string;
    bCheckAutoPlay: boolean;
    bStreamingEnabled: boolean;
    videoString: string;
    videoUID: string;
  }
  
  interface CreativeFeatures {
    ad_info: Adinfo2;
    _title: string;
    _activeDate: string;
    lastModified: string;
    _locale: string;
  }
  
  interface Adinfo2 {
    _type: string;
  }
  
  interface Playersurvey {
    s: Loginmessage;
    _title: string;
    _noIndex: boolean;
    _activeDate: string;
    lastModified: string;
    _locale: string;
  }
  
  interface CreativeAds {
    ad_info: Adinfo;
    _title: string;
    _activeDate: string;
    lastModified: string;
    _locale: string;
  }
  
  interface Adinfo {
    ads: any[];
    _type: string;
  }
  
  interface Koreancafe {
    _title: string;
    cafe_info: Cafeinfo;
    _activeDate: string;
    lastModified: string;
    _locale: string;
  }
  
  interface Cafeinfo {
    cafes: Cafe[];
    _type: string;
  }
  
  interface Cafe {
    korean_cafe: string;
    korean_cafe_description: string;
    _type: string;
    korean_cafe_header: string;
  }
  
  interface Emergencynoticev2 {
    'jcr:isCheckedOut': boolean;
    _title: string;
    _noIndex: boolean;
    'jcr:baseVersion': string;
    emergencynotices: Loginmessage;
    _activeDate: string;
    lastModified: string;
    _locale: string;
  }
  
  interface Emergencynotice {
    news: Loginmessage;
    _title: string;
    _noIndex: boolean;
    alwaysShow: boolean;
    _activeDate: string;
    lastModified: string;
    _locale: string;
  }
  
  interface Tournamentinformation {
    tournament_info: Tournamentinfo;
    _title: string;
    _noIndex: boolean;
    _activeDate: string;
    lastModified: string;
    _locale: string;
  }
  
  interface Tournamentinfo {
    tournaments: any[];
    _type: string;
  }
  
  interface Playlistinformation {
    frontend_matchmaking_header_style: string;
    _title: string;
    frontend_matchmaking_header_text: string;
    playlist_info: Playlistinfo;
    _noIndex: boolean;
    _activeDate: string;
    lastModified: string;
    _locale: string;
  }
  
  interface Playlistinfo {
    _type: string;
    playlists: Playlist[];
  }
  
  interface Playlist {
    image?: string;
    playlist_name: string;
    _type: string;
    hidden?: boolean;
    special_border?: string;
  }
  
  interface Battlepassaboutmessages {
    news: News;
    _title: string;
    _noIndex: boolean;
    _activeDate: string;
    lastModified: string;
    _locale: string;
  }
  
  interface News {
    _type: string;
    messages: Message2[];
  }
  
  interface Message2 {
    layout?: string;
    image: string;
    hidden: boolean;
    _type: string;
    title: string;
    body: string;
    spotlight: boolean;
  }
  
  interface Subgameselectdata {
    [key: string]: any;
    saveTheWorldUnowned: Loginmessage;
    _title: string;
    battleRoyale: BattleRoyale;
    creative: BattleRoyale;
    saveTheWorld: Loginmessage;
    _activeDate: string;
    lastModified: string;
    _locale: string;
  }
  
  interface BattleRoyale {
    _type: string;
    message: Message;
  }
  
  interface Message {
    image: string;
    hidden: boolean;
    messagetype: string;
    _type: string;
    title: Title;
    body: Title;
    spotlight: boolean;
  }
  
  interface Title {
    de: string;
    ru: string;
    ko: string;
    en: string;
    it: string;
    fr: string;
    es: string;
    ar: string;
    ja: string;
    pl: string;
    'es-419': string;
    tr: string;
  }
  
  interface Loginmessage {
  }