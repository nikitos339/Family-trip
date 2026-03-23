export interface TripItem {
  id: string;
  type: 'flight' | 'hotel' | 'activity' | 'transport';
  title: string;
  details: string;
  date: string;
  creator: string;
  timestamp: number;
}

export interface Trip {
  id: string;
  name: string;
  items: TripItem[];
  proposals: TripItem[];
}

export type ItemType = TripItem['type'];

// Local Smart Engine (Replacement for Gemini AI)
export function getLocalRecommendations(tripName: string) {
  const suggestions = [
    { title: "Посетить местный рынок", details: "Лучшее место, чтобы почувствовать атмосферу города и купить сувениры.", type: "activity" },
    { title: "Ужин в ресторане с видом", details: "Забронируйте столик заранее, чтобы насладиться закатом.", type: "activity" },
    { title: "Пешая экскурсия по центру", details: "Узнайте историю главных достопримечательностей от местного гида.", type: "activity" },
    { title: "Аренда велосипедов", details: "Отличный способ исследовать парки и набережные.", type: "activity" },
    { title: "Посещение музея искусств", details: "Ознакомьтесь с коллекцией работ местных мастеров.", type: "activity" }
  ];
  
  // Return 3 random suggestions
  return suggestions.sort(() => 0.5 - Math.random()).slice(0, 3);
}
