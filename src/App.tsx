import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plane, Hotel, MapPin, Calendar, Plus, Trash2, Users, 
  Clock, AlertCircle, Sparkles, ChevronRight,
  X, Globe, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Trip, TripItem, ItemType, getLocalRecommendations } from './services/localService';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STORAGE_KEY = 'travel_trip_data';

export default function App() {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<TripItem>>({
    type: 'activity',
    title: '',
    details: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedName = localStorage.getItem('travel_user_name');
    if (savedName) {
      setUserName(savedName);
      setIsLoggedIn(true);
    }

    const savedTrip = localStorage.getItem(STORAGE_KEY);
    if (savedTrip) {
      setTrip(JSON.parse(savedTrip));
    } else {
      const initialTrip: Trip = {
        id: 'local-trip',
        name: 'Мое путешествие',
        items: [],
        proposals: []
      };
      setTrip(initialTrip);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTrip));
    }
  }, []);

  // Save to LocalStorage whenever trip changes
  useEffect(() => {
    if (trip) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
    }
  }, [trip]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      localStorage.setItem('travel_user_name', userName);
      setIsLoggedIn(true);
    }
  };

  const addItem = (isProposal = false) => {
    if (!newItem.title || !trip) return;
    
    const item: TripItem = {
      ...(newItem as any),
      id: uuidv4(),
      creator: userName,
      timestamp: Date.now()
    };

    if (isProposal) {
      setTrip({ ...trip, proposals: [...(trip.proposals || []), { ...item, votes: [] }] as any });
    } else {
      setTrip({ ...trip, items: [...trip.items, item] });
    }

    setShowAddModal(false);
    setNewItem({
      type: 'activity',
      title: '',
      details: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const deleteItem = (id: string) => {
    if (!trip) return;
    setTrip({ ...trip, items: trip.items.filter(i => i.id !== id) });
  };

  const voteProposal = (id: string) => {
    if (!trip) return;
    const newProposals = trip.proposals.map((p: any) => {
      if (p.id === id) {
        const votes = p.votes || [];
        if (!votes.includes(userName)) {
          return { ...p, votes: [...votes, userName] };
        }
      }
      return p;
    });
    setTrip({ ...trip, proposals: newProposals });
  };

  const acceptProposal = (id: string) => {
    if (!trip) return;
    const proposal = trip.proposals.find(p => p.id === id);
    if (proposal) {
      const newItem = { ...proposal, id: uuidv4() };
      delete (newItem as any).votes;
      setTrip({
        ...trip,
        items: [...trip.items, newItem],
        proposals: trip.proposals.filter(p => p.id !== id)
      });
    }
  };

  const fetchRecommendations = () => {
    if (!trip) return;
    setLoadingRecs(true);
    // Simulate network delay
    setTimeout(() => {
      const recs = getLocalRecommendations(trip.name);
      setRecommendations(recs);
      setLoadingRecs(false);
    }, 800);
  };

  const sortedItems = useMemo(() => {
    if (!trip) return [];
    return [...trip.items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [trip]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-black/5"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
              <Sparkles className="text-white w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Семья — это главное</h1>
          <p className="text-gray-500 text-center mb-8">Введите ваше имя, чтобы начать планирование (Локально)</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Ваше имя"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              required
            />
            <button 
              type="submit"
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Начать работу
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#141414] font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Globe className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{trip?.name || 'Загрузка...'}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Users className="w-3 h-3" />
                <span>Вы: {userName}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="text-blue-600 font-medium">Локальный режим</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchRecommendations}
              disabled={loadingRecs}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <Sparkles className={cn("w-4 h-4 text-purple-600", loadingRecs && "animate-pulse")} />
              Идеи
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
            >
              <Plus className="w-4 h-4" />
              Добавить
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Timeline */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold flex items-center gap-2 italic font-serif">
              План маршрута
              <span className="text-xs font-sans not-italic font-normal bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                {trip?.items.length || 0} событий
              </span>
            </h2>
          </div>

          {/* Proposals section */}
          {trip?.proposals && trip.proposals.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-orange-600">
                <AlertCircle className="w-5 h-5" />
                Предложения на обсуждение
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trip.proposals.map((prop: any) => (
                  <div key={prop.id} className="bg-orange-50 border border-orange-200 p-4 rounded-2xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm">{prop.title}</h4>
                      <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-[10px] font-bold border border-orange-100">
                        <Users className="w-3 h-3" />
                        {prop.votes?.length || 0}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">{prop.details}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => voteProposal(prop.id)}
                        disabled={prop.votes?.includes(userName)}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase transition-all",
                          prop.votes?.includes(userName) 
                            ? "bg-orange-200 text-orange-800 cursor-default" 
                            : "bg-white border border-orange-200 text-orange-600 hover:bg-orange-100"
                        )}
                      >
                        {prop.votes?.includes(userName) ? 'Голос учтен' : 'Поддержать'}
                      </button>
                      <button 
                        onClick={() => acceptProposal(prop.id)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-bold uppercase hover:bg-orange-700 transition-all"
                      >
                        Принять
                      </button>
                    </div>
                    <div className="mt-3 pt-3 border-t border-orange-100 flex items-center justify-between text-[9px] text-orange-400 font-bold uppercase">
                      <span>От: {prop.creator}</span>
                      <span>{format(new Date(prop.date), 'd MMM')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-200">
            <AnimatePresence mode="popLayout">
              {sortedItems.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative pl-12 group"
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center z-10 shadow-sm group-hover:border-black transition-colors">
                    {item.type === 'flight' && <Plane className="w-5 h-5 text-blue-500" />}
                    {item.type === 'hotel' && <Hotel className="w-5 h-5 text-orange-500" />}
                    {item.type === 'activity' && <MapPin className="w-5 h-5 text-green-500" />}
                    {item.type === 'transport' && <Calendar className="w-5 h-5 text-purple-500" />}
                  </div>
                  
                  <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-all group-hover:border-black/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">
                          {format(new Date(item.date), 'd MMMM, EEEE', { locale: ru })}
                        </span>
                        <h3 className="font-bold text-lg">{item.title}</h3>
                      </div>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{item.details}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                          {item.creator.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-500">Добавил: {item.creator}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {sortedItems.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-gray-300 w-8 h-8" />
                </div>
                <p className="text-gray-500">Пока ничего не запланировано. Начните добавлять билеты или отели!</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recommendations Card */}
          <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Локальные идеи
              </h3>
              {!recommendations.length && (
                <button 
                  onClick={fetchRecommendations}
                  disabled={loadingRecs}
                  className="text-xs text-purple-600 font-semibold hover:underline"
                >
                  Обновить
                </button>
              )}
            </div>

            <div className="space-y-4">
              {loadingRecs ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : recommendations.length > 0 ? (
                recommendations.map((rec, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 group cursor-pointer hover:bg-purple-50 transition-colors"
                  >
                    <h4 className="font-bold text-sm text-purple-900 mb-1">{rec.title}</h4>
                    <p className="text-xs text-purple-700 leading-relaxed mb-3">{rec.details}</p>
                    <button 
                      onClick={() => {
                        setNewItem({
                          type: 'activity',
                          title: rec.title,
                          details: rec.details,
                          date: sortedItems[0]?.date || new Date().toISOString().split('T')[0]
                        });
                        setShowAddModal(true);
                      }}
                      className="text-[10px] font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                      Добавить в план <ChevronRight className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-gray-400 mb-4">Нажмите кнопку, чтобы получить идеи для вашего путешествия</p>
                  <button 
                    onClick={fetchRecommendations}
                    className="px-4 py-2 bg-purple-600 text-white rounded-full text-xs font-bold hover:bg-purple-700 transition-colors"
                  >
                    Показать идеи
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-[#151619] text-white rounded-3xl p-6 shadow-xl">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              История действий
            </h3>
            <div className="space-y-4">
              {trip?.items.slice(-3).reverse().map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {item.creator.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs leading-relaxed">
                      Вы добавили {item.type === 'flight' ? 'рейс' : item.type === 'hotel' ? 'отель' : 'событие'} 
                      <span className="italic"> "{item.title}"</span>
                    </p>
                    <span className="text-[10px] text-gray-500">{format(new Date(item.timestamp), 'HH:mm')}</span>
                  </div>
                </div>
              ))}
              {!trip?.items.length && <p className="text-xs text-gray-500 text-center py-4">Активности пока нет</p>}
            </div>
          </div>
        </div>
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold">Добавить в план</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-4 gap-2">
                  {(['flight', 'hotel', 'activity', 'transport'] as ItemType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewItem(prev => ({ ...prev, type }))}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                        newItem.type === type 
                          ? "border-black bg-black text-white" 
                          : "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      {type === 'flight' && <Plane className="w-5 h-5" />}
                      {type === 'hotel' && <Hotel className="w-5 h-5" />}
                      {type === 'activity' && <MapPin className="w-5 h-5" />}
                      {type === 'transport' && <Calendar className="w-5 h-5" />}
                      <span className="text-[10px] font-bold uppercase tracking-tighter">
                        {type === 'flight' ? 'Рейс' : type === 'hotel' ? 'Отель' : type === 'activity' ? 'Место' : 'Путь'}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Название</label>
                    <input 
                      type="text" 
                      value={newItem.title}
                      onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Напр: Рейс SU-123 или Отель Hilton"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Дата</label>
                      <input 
                        type="date" 
                        value={newItem.date}
                        onChange={(e) => setNewItem(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Время (опц)</label>
                      <input 
                        type="time" 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Детали</label>
                    <textarea 
                      value={newItem.details}
                      onChange={(e) => setNewItem(prev => ({ ...prev, details: e.target.value }))}
                      placeholder="Дополнительная информация, номера бронирования и т.д."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => addItem(true)}
                    className="flex-1 bg-white border border-gray-200 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Предложить вариант
                  </button>
                  <button 
                    onClick={() => addItem(false)}
                    className="flex-[2] bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
                  >
                    Добавить в маршрут
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
