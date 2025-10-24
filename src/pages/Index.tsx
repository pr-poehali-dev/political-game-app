import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

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

interface Player {
  id: number;
  name: string;
  avatar: string;
  vote: string | null;
  isOpposition: boolean;
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
    color: 'bg-success',
  },
  {
    id: 'security',
    name: 'Безопасность',
    icon: 'Shield',
    effects: { security: 20, economy: -5 },
    color: 'bg-primary',
  },
  {
    id: 'diplomacy',
    name: 'Дипломатия',
    icon: 'Handshake',
    effects: { diplomacy: 18, security: -5 },
    color: 'bg-accent',
  },
  {
    id: 'social',
    name: 'Социальное',
    icon: 'Heart',
    effects: { social: 20, economy: -5 },
    color: 'bg-destructive',
  },
];

const playerNames = ['Иван', 'Мария', 'Дмитрий', 'Анна'];
const avatarColors = ['bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-purple-500'];

export default function Index() {
  const initializePlayers = () => {
    const oppositionIndex = Math.floor(Math.random() * playerNames.length);
    return playerNames.map((name, index) => ({
      id: index,
      name,
      avatar: avatarColors[index],
      vote: null,
      isOpposition: index === oppositionIndex,
    }));
  };

  const [gameState, setGameState] = useState<GameState>(initialState);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentCrisis, setCurrentCrisis] = useState<Crisis>(crises[0]);
  const [gameOver, setGameOver] = useState(false);
  const [players, setPlayers] = useState<Player[]>(initializePlayers());
  const [hasVoted, setHasVoted] = useState(false);
  const [isDiversionMode, setIsDiversionMode] = useState(false);

  useEffect(() => {
    if (gameOver) return;

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
  }, [isPlaying, gameOver]);

  const handleRoundEnd = () => {
    if (currentRound >= 5) {
      setGameOver(true);
      return;
    }

    setCurrentRound((prev) => prev + 1);
    setCurrentCrisis(crises[Math.floor(Math.random() * crises.length)]);
    setHasVoted(false);
    
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => ({ ...player, vote: null }))
    );
    
    setGameState((prev) => ({
      economy: Math.max(0, Math.min(100, prev.economy - 10)),
      security: Math.max(0, Math.min(100, prev.security - 5)),
      diplomacy: Math.max(0, Math.min(100, prev.diplomacy - 5)),
      social: Math.max(0, Math.min(100, prev.social - 10)),
    }));
  };

  const handleAction = (action: Action) => {
    if (gameOver || hasVoted) return;

    const effectMultiplier = isDiversionMode ? -1 : 1;
    
    setGameState((prev) => {
      const newState = { ...prev };
      Object.entries(action.effects).forEach(([key, value]) => {
        newState[key as keyof GameState] = Math.max(
          0,
          Math.min(100, newState[key as keyof GameState] + value * effectMultiplier)
        );
      });
      return newState;
    });

    setPlayers((prevPlayers) => {
      const updatedPlayers = prevPlayers.map((player, index) => {
        if (index === 0) {
          return { ...player, vote: action.id };
        }
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        return { ...player, vote: randomAction.id };
      });
      return updatedPlayers;
    });

    setHasVoted(true);
  };

  const startGame = () => {
    const newPlayers = initializePlayers();
    setPlayers(newPlayers);
    setIsDiversionMode(false);
    setGameOver(false);
    setCurrentRound(1);
    setTimeLeft(60);
    setGameState(initialState);
    setCurrentCrisis(crises[0]);
    setHasVoted(false);
  };

  const getResultMessage = () => {
    const total = Object.values(gameState).reduce((sum, val) => sum + val, 0);
    const average = total / 4;
    
    if (average >= 70) return { title: '🏆 ПОБЕДА МИНИСТРОВ', color: 'text-success' };
    if (average >= 50) return { title: '⚖️ СТАБИЛЬНОСТЬ', color: 'text-accent' };
    if (average >= 30) return { title: '⚠️ КРИЗИС', color: 'text-orange-500' };
    return { title: '💥 КРАХ ГОСУДАРСТВА', color: 'text-destructive' };
  };

  if (gameOver) {
    const result = getResultMessage();
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 space-y-6">
          <h1 className={`text-4xl font-bold text-center ${result.color}`}>
            {result.title}
          </h1>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="DollarSign" size={20} className="text-success" />
                <span className="text-sm text-muted-foreground">Экономика</span>
              </div>
              <div className="text-3xl font-bold">{Math.round(gameState.economy)}%</div>
              <Progress value={gameState.economy} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="Shield" size={20} className="text-primary" />
                <span className="text-sm text-muted-foreground">Безопасность</span>
              </div>
              <div className="text-3xl font-bold">{Math.round(gameState.security)}%</div>
              <Progress value={gameState.security} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="Handshake" size={20} className="text-accent" />
                <span className="text-sm text-muted-foreground">Дипломатия</span>
              </div>
              <div className="text-3xl font-bold">{Math.round(gameState.diplomacy)}%</div>
              <Progress value={gameState.diplomacy} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="Heart" size={20} className="text-destructive" />
                <span className="text-sm text-muted-foreground">Социальное</span>
              </div>
              <div className="text-3xl font-bold">{Math.round(gameState.social)}%</div>
              <Progress value={gameState.social} className="h-2" />
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={startGame} size="lg" className="flex-1">
              <Icon name="RotateCcw" size={20} className="mr-2" />
              Играть снова
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center flex-1">
              <div className="text-4xl font-bold text-foreground">{String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}</div>
              <div className="text-sm text-muted-foreground">Раунд {currentRound}/5</div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg">
            <span className="text-sm font-medium">Режим диверсии</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {isDiversionMode ? 'Вредить государству' : 'Помогать государству'}
              </span>
              <Switch
                checked={isDiversionMode}
                onCheckedChange={setIsDiversionMode}
                disabled={hasVoted}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="grid grid-cols-4 gap-2">
              {players.map((player) => {
                const voteAction = actions.find((a) => a.id === player.vote);
                const isCurrentPlayer = player.id === 0;
                return (
                  <div key={player.id} className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <Avatar className={`h-12 w-12 border-2 ${isCurrentPlayer ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}>
                        <AvatarFallback className={player.avatar}>
                          {player.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      {player.vote && voteAction && (
                        <div className={`absolute -bottom-1 -right-1 ${voteAction.color} rounded-full p-1`}>
                          <Icon name={voteAction.icon} size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{player.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Icon name="DollarSign" size={16} className="text-success" />
                <span className="text-xs text-muted-foreground">Экономика</span>
                <span className="text-sm font-bold ml-auto">{Math.round(gameState.economy)}%</span>
              </div>
              <Progress value={gameState.economy} className="h-2" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Icon name="Shield" size={16} className="text-primary" />
                <span className="text-xs text-muted-foreground">Безопасность</span>
                <span className="text-sm font-bold ml-auto">{Math.round(gameState.security)}%</span>
              </div>
              <Progress value={gameState.security} className="h-2" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Icon name="Handshake" size={16} className="text-accent" />
                <span className="text-xs text-muted-foreground">Дипломатия</span>
                <span className="text-sm font-bold ml-auto">{Math.round(gameState.diplomacy)}%</span>
              </div>
              <Progress value={gameState.diplomacy} className="h-2" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Icon name="Heart" size={16} className="text-destructive" />
                <span className="text-xs text-muted-foreground">Социальное</span>
                <span className="text-sm font-bold ml-auto">{Math.round(gameState.social)}%</span>
              </div>
              <Progress value={gameState.social} className="h-2" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-lg bg-destructive/10">
              <Icon name={currentCrisis.icon} size={24} className="text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">КРИЗИС: {currentCrisis.title}</h2>
              <p className="text-sm text-muted-foreground">{currentCrisis.description}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              onClick={() => handleAction(action)}
              className={`h-24 flex-col gap-2 ${action.color} hover:opacity-90 ${hasVoted ? 'opacity-50 cursor-not-allowed' : ''}`}
              size="lg"
              disabled={hasVoted}
            >
              <Icon name={action.icon} size={32} />
              <span className="text-base font-semibold">{action.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}