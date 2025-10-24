import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

type Screen = 'auth' | 'menu' | 'game' | 'stats' | 'settings' | 'results';

interface GameState {
  economy: number;
  security: number;
  diplomacy: number;
  social: number;
}

interface Crisis {
  title: string;
  description: string;
  icon: string;
}

interface Action {
  id: string;
  name: string;
  icon: string;
  effects: Partial<GameState>;
  color: string;
}

interface UserProfile {
  nickname: string;
  level: number;
  gamesPlayed: number;
  wins: number;
  avatar: string;
}

const initialState: GameState = {
  economy: 60,
  security: 80,
  diplomacy: 20,
  social: 50,
};

const crises: Crisis[] = [
  {
    title: 'Экономический спад',
    description: 'Экономика -25% | Социальная стабильность -10%',
    icon: 'TrendingDown',
  },
  {
    title: 'Угроза безопасности',
    description: 'Безопасность -30% | Дипломатия +5%',
    icon: 'ShieldAlert',
  },
  {
    title: 'Международный конфликт',
    description: 'Дипломатия -40% | Экономика -15%',
    icon: 'Globe',
  },
  {
    title: 'Социальные протесты',
    description: 'Социальное -35% | Безопасность -10%',
    icon: 'Users',
  },
  {
    title: 'Энергетический кризис',
    description: 'Экономика -20% | Социальное -15%',
    icon: 'Zap',
  },
];

const actions: Action[] = [
  {
    id: 'economy',
    name: 'Экономика',
    icon: 'DollarSign',
    effects: { economy: 15, social: -5 },
    color: 'bg-green-600',
  },
  {
    id: 'security',
    name: 'Безопасность',
    icon: 'Shield',
    effects: { security: 20, economy: -5 },
    color: 'bg-blue-600',
  },
  {
    id: 'diplomacy',
    name: 'Дипломатия',
    icon: 'Handshake',
    effects: { diplomacy: 18, security: -5 },
    color: 'bg-purple-600',
  },
  {
    id: 'social',
    name: 'Социальное',
    icon: 'Heart',
    effects: { social: 20, economy: -5 },
    color: 'bg-pink-600',
  },
];

export default function Index() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    nickname: '',
    level: 1,
    gamesPlayed: 0,
    wins: 0,
    avatar: 'bg-blue-500',
  });

  const [gameState, setGameState] = useState<GameState>(initialState);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentCrisis, setCurrentCrisis] = useState<Crisis>(crises[0]);
  const [hasVoted, setHasVoted] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');

  useEffect(() => {
    if (currentScreen !== 'game') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleRoundEnd();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentScreen, currentRound]);

  const handleRoundEnd = () => {
    if (currentRound >= 5) {
      setCurrentScreen('results');
      return;
    }

    setCurrentRound((prev) => prev + 1);
    setCurrentCrisis(crises[Math.floor(Math.random() * crises.length)]);
    setHasVoted(false);

    setGameState((prev) => ({
      economy: Math.max(0, Math.min(100, prev.economy - 10)),
      security: Math.max(0, Math.min(100, prev.security - 5)),
      diplomacy: Math.max(0, Math.min(100, prev.diplomacy - 5)),
      social: Math.max(0, Math.min(100, prev.social - 10)),
    }));
  };

  const handleAction = (action: Action) => {
    if (hasVoted) return;

    setGameState((prev) => {
      const newState = { ...prev };
      Object.entries(action.effects).forEach(([key, value]) => {
        newState[key as keyof GameState] = Math.max(
          0,
          Math.min(100, newState[key as keyof GameState] + value)
        );
      });
      return newState;
    });

    setHasVoted(true);
  };

  const startGame = () => {
    setGameState(initialState);
    setCurrentRound(1);
    setTimeLeft(60);
    setCurrentCrisis(crises[0]);
    setHasVoted(false);
    setCurrentScreen('game');
  };

  const handleAuth = (method: 'nickname' | 'guest') => {
    if (method === 'nickname' && nicknameInput.trim() === '') return;
    
    setUserProfile({
      ...userProfile,
      nickname: method === 'guest' ? 'Гость' : nicknameInput,
    });
    setCurrentScreen('menu');
  };

  const getResultMessage = () => {
    const total = Object.values(gameState).reduce((sum, val) => sum + val, 0);
    const average = total / 4;

    if (average >= 70) return { title: 'ПОБЕДА МИНИСТРОВ', color: 'text-green-600', icon: 'Trophy' };
    if (average >= 50) return { title: 'СТАБИЛЬНОСТЬ', color: 'text-blue-600', icon: 'Scale' };
    if (average >= 30) return { title: 'КРИЗИС', color: 'text-orange-600', icon: 'AlertTriangle' };
    return { title: 'КРАХ ГОСУДАРСТВА', color: 'text-red-600', icon: 'Bomb' };
  };

  if (currentScreen === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 space-y-8 bg-slate-800/90 border-slate-700 shadow-2xl">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Icon name="Building2" size={40} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Statemate</h1>
            <p className="text-slate-400 text-sm">Политическая стратегия</p>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Введите nickname"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              className="h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
            
            <Button
              onClick={() => handleAuth('nickname')}
              disabled={nicknameInput.trim() === ''}
              size="lg"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Продолжить
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="text-slate-500 text-xs">или</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-slate-600 hover:bg-slate-700">
                <Icon name="Mail" size={20} className="text-slate-400" />
              </Button>
              <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-slate-600 hover:bg-slate-700">
                <Icon name="Chrome" size={20} className="text-slate-400" />
              </Button>
              <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-slate-600 hover:bg-slate-700">
                <Icon name="Github" size={20} className="text-slate-400" />
              </Button>
            </div>

            <Button
              onClick={() => handleAuth('guest')}
              variant="ghost"
              className="w-full text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              Гостевой вход
            </Button>
          </div>

          <div className="pt-4 flex items-center justify-center gap-2 text-slate-500">
            <Icon name="MapPin" size={16} />
            <span className="text-xs">Схематичная карта государства</span>
          </div>
        </Card>
      </div>
    );
  }

  if (currentScreen === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <Card className="p-4 bg-slate-800/90 border-slate-700 shadow-xl">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className={`${userProfile.avatar} text-white text-xl font-bold`}>
                  {userProfile.nickname[0]?.toUpperCase() || 'G'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{userProfile.nickname}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Icon name="Star" size={16} className="text-yellow-500" />
                    <span className="text-sm text-slate-300">Уровень {userProfile.level}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Coins" size={16} className="text-amber-500" />
                    <span className="text-sm text-slate-300">1250</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={startGame}
              size="lg"
              className="w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg font-bold shadow-lg"
            >
              <Icon name="Zap" size={24} className="mr-2" />
              Быстрая игра
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full h-14 border-slate-600 hover:bg-slate-800 text-white"
            >
              <Icon name="Users" size={20} className="mr-2" />
              С друзьями
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setCurrentScreen('stats')}
                variant="outline"
                size="lg"
                className="h-14 border-slate-600 hover:bg-slate-800 text-white"
              >
                <Icon name="BarChart3" size={20} className="mr-2" />
                Статистика
              </Button>

              <Button
                onClick={() => setCurrentScreen('settings')}
                variant="outline"
                size="lg"
                className="h-14 border-slate-600 hover:bg-slate-800 text-white"
              >
                <Icon name="Settings" size={20} className="mr-2" />
                Настройки
              </Button>
            </div>
          </div>

          <Card className="p-6 bg-slate-800/90 border-slate-700">
            <div className="flex items-center justify-between text-slate-300">
              <div className="text-center">
                <Icon name="Gamepad2" size={24} className="mx-auto mb-1 text-blue-400" />
                <div className="text-2xl font-bold text-white">{userProfile.gamesPlayed}</div>
                <div className="text-xs">Игр</div>
              </div>
              <div className="text-center">
                <Icon name="Trophy" size={24} className="mx-auto mb-1 text-yellow-500" />
                <div className="text-2xl font-bold text-white">{userProfile.wins}</div>
                <div className="text-xs">Побед</div>
              </div>
              <div className="text-center">
                <Icon name="TrendingUp" size={24} className="mx-auto mb-1 text-green-400" />
                <div className="text-2xl font-bold text-white">
                  {userProfile.gamesPlayed > 0 ? Math.round((userProfile.wins / userProfile.gamesPlayed) * 100) : 0}%
                </div>
                <div className="text-xs">Винрейт</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (currentScreen === 'game') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
        <div className="bg-slate-800/90 border-b border-slate-700 p-4 shadow-lg">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentScreen('menu')}
                  className="text-slate-400 hover:text-white"
                >
                  <Icon name="ArrowLeft" size={20} />
                </Button>
                <div className="text-slate-400 text-sm">Раунд {currentRound}/5</div>
              </div>
              <div className="text-3xl font-bold text-white tabular-nums">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-3">
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={[
                  { subject: 'Экономика', value: gameState.economy, fullMark: 100 },
                  { subject: 'Безопасность', value: gameState.security, fullMark: 100 },
                  { subject: 'Дипломатия', value: gameState.diplomacy, fullMark: 100 },
                  { subject: 'Социальное', value: gameState.social, fullMark: 100 },
                ]}>
                  <PolarGrid stroke="#475569" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Radar name="Показатели" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
          <Card className="p-6 bg-red-950/50 border-red-800 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name={currentCrisis.icon} size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">КРИЗИС: {currentCrisis.title}</h3>
                <p className="text-red-200 text-sm">{currentCrisis.description}</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3 flex-1">
            {actions.map((action) => (
              <Button
                key={action.id}
                onClick={() => handleAction(action)}
                disabled={hasVoted}
                className={`h-full min-h-[120px] ${action.color} hover:opacity-90 disabled:opacity-50 flex flex-col items-center justify-center gap-2 text-white font-bold text-lg shadow-lg`}
              >
                <Icon name={action.icon} size={32} />
                <span>{action.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'stats') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentScreen('menu')}
              className="text-slate-400 hover:text-white"
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-2xl font-bold text-white">Статистика</h1>
          </div>

          <Card className="p-6 bg-slate-800/90 border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4">Общая статистика</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Всего игр</span>
                <span className="text-2xl font-bold text-white">{userProfile.gamesPlayed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Побед</span>
                <span className="text-2xl font-bold text-green-500">{userProfile.wins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Винрейт</span>
                <span className="text-2xl font-bold text-blue-500">
                  {userProfile.gamesPlayed > 0 ? Math.round((userProfile.wins / userProfile.gamesPlayed) * 100) : 0}%
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-800/90 border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4">Достижения</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                <Icon name="Trophy" size={32} className="mx-auto mb-2 text-yellow-500" />
                <div className="text-xs text-slate-400">Новичок</div>
              </div>
              <div className="text-center p-3 bg-slate-700/30 rounded-lg opacity-50">
                <Icon name="Medal" size={32} className="mx-auto mb-2 text-slate-500" />
                <div className="text-xs text-slate-400">Стратег</div>
              </div>
              <div className="text-center p-3 bg-slate-700/30 rounded-lg opacity-50">
                <Icon name="Crown" size={32} className="mx-auto mb-2 text-slate-500" />
                <div className="text-xs text-slate-400">Легенда</div>
              </div>
            </div>
          </Card>

          <Button
            onClick={() => setCurrentScreen('menu')}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Назад в меню
          </Button>
        </div>
      </div>
    );
  }

  if (currentScreen === 'settings') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentScreen('menu')}
              className="text-slate-400 hover:text-white"
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-2xl font-bold text-white">Настройки</h1>
          </div>

          <Card className="p-6 bg-slate-800/90 border-slate-700 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">Звук</div>
                <div className="text-sm text-slate-400">Музыка и эффекты</div>
              </div>
              <Button variant="outline" size="sm" className="border-slate-600">
                <Icon name="Volume2" size={16} className="text-slate-400" />
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">Уведомления</div>
                <div className="text-sm text-slate-400">Push-уведомления</div>
              </div>
              <Button variant="outline" size="sm" className="border-slate-600">
                <Icon name="Bell" size={16} className="text-slate-400" />
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">Язык</div>
                <div className="text-sm text-slate-400">Русский</div>
              </div>
              <Button variant="outline" size="sm" className="border-slate-600">
                <Icon name="Languages" size={16} className="text-slate-400" />
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-slate-800/90 border-slate-700 space-y-4">
            <Button variant="outline" className="w-full justify-start border-slate-600 hover:bg-slate-700 text-white">
              <Icon name="HelpCircle" size={20} className="mr-2" />
              Помощь и поддержка
            </Button>
            <Button variant="outline" className="w-full justify-start border-slate-600 hover:bg-slate-700 text-white">
              <Icon name="Info" size={20} className="mr-2" />
              О приложении
            </Button>
            <Button variant="outline" className="w-full justify-start border-red-600 hover:bg-red-950 text-red-500">
              <Icon name="LogOut" size={20} className="mr-2" />
              Выйти
            </Button>
          </Card>

          <Button
            onClick={() => setCurrentScreen('menu')}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Назад в меню
          </Button>
        </div>
      </div>
    );
  }

  if (currentScreen === 'results') {
    const result = getResultMessage();
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 space-y-6 bg-slate-800/90 border-slate-700">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
              <Icon name={result.icon} size={40} className="text-white" />
            </div>
            <h1 className={`text-3xl font-bold ${result.color}`}>
              {result.title}
            </h1>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={[
                { subject: 'Экономика', value: gameState.economy, fullMark: 100 },
                { subject: 'Безопасность', value: gameState.security, fullMark: 100 },
                { subject: 'Дипломатия', value: gameState.diplomacy, fullMark: 100 },
                { subject: 'Социальное', value: gameState.social, fullMark: 100 },
              ]}>
                <PolarGrid stroke="#475569" strokeWidth={1.5} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 13, fontWeight: 600 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Radar name="Показатели" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.7} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-slate-300">Экономика: {Math.round(gameState.economy)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-slate-300">Безопасность: {Math.round(gameState.security)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-slate-300">Дипломатия: {Math.round(gameState.diplomacy)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                <span className="text-sm text-slate-300">Социальное: {Math.round(gameState.social)}%</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                startGame();
              }}
              size="lg"
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Icon name="RotateCcw" size={20} className="mr-2" />
              Играть снова
            </Button>
            <Button
              onClick={() => setCurrentScreen('menu')}
              variant="outline"
              size="lg"
              className="flex-1 border-slate-600 hover:bg-slate-700 text-white"
            >
              Меню
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}