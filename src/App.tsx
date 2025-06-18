import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, Pause, RotateCcw, Settings, TrendingUp, TrendingDown, AlertTriangle, Zap, Shield, Bomb, LogOut, User, HelpCircle, BookOpen, ArrowLeft, ExternalLink } from 'lucide-react';

// Netlify Identity Widget
declare global {
  interface Window {
    netlifyIdentity: any;
  }
}

// Import Netlify Identity
import netlifyIdentity from 'netlify-identity-widget';

interface Scenario {
  id: number;
  name: string;
  currentLevel: number;
  baseSize: number;
  totalExposure: number;
  isActive: boolean;
  direction: 'long' | 'short';
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  marginalCall: boolean;
  coordinated: boolean;
  whaleClient: boolean;
}

interface Alert {
  id: number;
  type: 'danger' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

interface ChartDataPoint {
  step: number;
  price: number;
  brokerPnL: number;
  exposure: number;
  hedgingCost: number;
}

// PROTECTION LEVEL PRESETS
const PROTECTION_LEVELS = {
  1: { 
    name: 'Minimal Protection',
    interventionLevel: 7,
    hedgeRatio: 0.3,
    hedgeStartLevel: 5,
    maxClientExposure: 1000000,
    description: 'High risk, high reward'
  },
  2: { 
    name: 'Low Protection',
    interventionLevel: 6,
    hedgeRatio: 0.5,
    hedgeStartLevel: 4,
    maxClientExposure: 750000,
    description: 'Moderate risk tolerance'
  },
  3: { 
    name: 'Balanced Protection',
    interventionLevel: 5,
    hedgeRatio: 0.7,
    hedgeStartLevel: 3,
    maxClientExposure: 500000,
    description: 'Balanced approach'
  },
  4: { 
    name: 'High Protection', 
    interventionLevel: 4,
    hedgeRatio: 0.85,
    hedgeStartLevel: 3,
    maxClientExposure: 300000,
    description: 'Conservative risk management'
  },
  5: { 
    name: 'Maximum Protection',
    interventionLevel: 3,
    hedgeRatio: 0.95,
    hedgeStartLevel: 2,
    maxClientExposure: 200000,
    description: 'Ultra-conservative, maximum safety'
  }
};

// COMPLETE HELP CONTENT
const HELP_SECTIONS = {
  overview: {
    title: 'Martingale War Room Overview',
    content: 'The Martingale War Room is a comprehensive risk management simulation for B-book brokers. It helps manage the unique risks posed by martingale trading strategies through real-time monitoring, advanced hedging, and stress testing.'
  },
  protection: {
    title: 'Protection Level System',
    content: 'The 5-level protection system ranges from Level 1 (Minimal) to Level 5 (Maximum). Level 3 (Balanced) is recommended for most operations, providing optimal risk-return balance.'
  },
  stress: {
    title: 'Stress Testing Scenarios',
    content: 'Three main scenarios: Black Swan (market gaps + crisis), Whale Attack (coordinated large accounts), and Perfect Storm (maximum chaos conditions).'
  },
  hedging: {
    title: 'Hedging Strategies',
    content: 'Advanced options-based hedging including dynamic put/call strategies, collar strategies, and synthetic positions to protect against martingale risks.'
  },
  metrics: {
    title: 'Key Performance Indicators',
    content: 'Monitor Net P&L, Total Exposure, Capital Utilization, Hedging Costs, and Client Threat Levels for comprehensive risk assessment.'
  },
  martingale: {
    title: 'Martingale Strategies',
    content: 'Understanding exponential position sizing (2^n formula), risk progression, and detection of coordinated attacks by professional trading groups.'
  }
};

// HELP BUTTON COMPONENT
const HelpButton: React.FC<{ section: string; className?: string }> = ({ section, className = "" }) => {
  const handleClick = () => {
    const helpContent = HELP_SECTIONS[section as keyof typeof HELP_SECTIONS];
    if (helpContent) {
      alert(` ${helpContent.title}\n\n${helpContent.content}\n\n This is a preview - full help system includes detailed examples, formulas, and best practices!`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors ${className}`}
      title={`Get help for ${section}`}
    >
      <HelpCircle className="w-4 h-4" />
    </button>
  );
};

// HELP DOCUMENTATION COMPONENT
const HelpDocumentation: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6 border border-blue-500">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-blue-400">WAR ROOM DOCUMENTATION</h1>
            </div>
            <button
              onClick={onBack}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to War Room
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(HELP_SECTIONS).map(([key, section]) => (
              <div 
                key={key}
                className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 rounded-lg border border-blue-600 cursor-pointer hover:from-blue-800 hover:to-blue-700 transition-all"
                onClick={() => alert(` ${section.title}\n\n${section.content}\n\n Full version includes detailed examples, mathematical formulas, implementation guides, and real-world case studies!`)}
              >
                <h3 className="text-xl font-bold text-blue-300 mb-4">{section.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{section.content.substring(0, 120)}...</p>
                <div className="flex items-center text-blue-400 text-sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Read Documentation
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gray-700 rounded-lg p-6 border border-gray-600">
            <h2 className="text-2xl font-bold text-white mb-4"> Quick Start Guide</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-blue-400 mb-3">For New Users</h3>
                <ol className="space-y-2 text-gray-300 text-sm">
                  <li>1. Start with <strong>Protection Level 3</strong> (balanced approach)</li>
                  <li>2. Enable <strong>hedging system</strong> with 70% ratio</li>
                  <li>3. Run <strong>Perfect Storm</strong> stress test</li>
                  <li>4. Monitor <strong>client threat levels</strong> in real-time</li>
                  <li>5. Review <strong>P&L vs hedging costs</strong> regularly</li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-3">Best Practices</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li> <strong>Daily monitoring:</strong> Check exposure levels each morning</li>
                  <li> <strong>Weekly stress tests:</strong> Run scenarios every Friday</li>
                  <li> <strong>Monthly reviews:</strong> Analyze protection level effectiveness</li>
                  <li> <strong>Emergency protocols:</strong> Have intervention procedures ready</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// LOGIN COMPONENT
const LoginScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    netlifyIdentity.open();
  };

  useEffect(() => {
    const handleAuth = () => {
      setIsLoading(false);
    };

    netlifyIdentity.on('login', handleAuth);
    netlifyIdentity.on('error', handleAuth);

    return () => {
      netlifyIdentity.off('login', handleAuth);
      netlifyIdentity.off('error', handleAuth);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full border border-red-500">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Bomb className="w-12 h-12 text-red-500" />
            <Shield className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-red-400 mb-2">MARTINGALE WAR ROOM</h1>
          <p className="text-gray-300 text-sm"> RESTRICTED ACCESS</p>
        </div>
        
        <div className="bg-red-950 border border-red-600 rounded-lg p-4 mb-6">
          <h3 className="text-red-300 font-bold mb-2"> AUTHORIZED PERSONNEL ONLY</h3>
          <p className="text-gray-300 text-sm">
            This is a classified risk management simulation system. 
            Access is restricted to authorized personnel only.
          </p>
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
            isLoading 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Authenticating...
            </>
          ) : (
            <>
              <User className="w-4 h-4 mr-2" />
              ACCESS WAR ROOM
            </>
          )}
        </button>
        
        <p className="text-gray-400 text-xs text-center mt-4">
          Only authorized email addresses can access this system.
        </p>
      </div>
    </div>
  );
};const MartingaleWarRoomSimulator: React.FC = () => {
  // Authentication state
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Help system state
  const [showHelp, setShowHelp] = useState(false);

  // Core state
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(500);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [brokerPnL, setBrokerPnL] = useState(0);
  const [hedgingEnabled, setHedgingEnabled] = useState(true);
  const [totalExposure, setTotalExposure] = useState(0);
  const [marketPrice, setMarketPrice] = useState(1.0850);
  const [volatility, setVolatility] = useState(0.0012);
  const [hedgingCost, setHedgingCost] = useState(0);
  const [interventionLevel, setInterventionLevel] = useState(5);
  
  // ENHANCED HEDGING CONTROLS - THESE WERE MISSING!
  const [hedgeRatio, setHedgeRatio] = useState(0.7);
  const [hedgeStartLevel, setHedgeStartLevel] = useState(3);
  const [hedgeStrategy, setHedgeStrategy] = useState<'calls' | 'puts' | 'collars' | 'dynamic'>('dynamic');
  const [maxClientExposure, setMaxClientExposure] = useState(500000);
  
  // PROTECTION LEVEL SYSTEM
  const [protectionLevel, setProtectionLevel] = useState(3);
  
  // War Room controls
  const [gapEventTrigger, setGapEventTrigger] = useState(false);
  const [whaleMode, setWhaleMode] = useState(false);
  const [coordinated, setCoordinated] = useState(false);
  const [simulateWins, setSimulateWins] = useState(false);
  const [crisisVolatility, setCrisisVolatility] = useState(false);
  
  // Performance tracking
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [capitalLimit] = useState(5000000);
  const [maxDrawdown, setMaxDrawdown] = useState(0);
  const [peakPnL, setPeakPnL] = useState(0);

  // Initialize Netlify Identity
  useEffect(() => {
    netlifyIdentity.init();
    
    const currentUser = netlifyIdentity.currentUser();
    setUser(currentUser);
    setIsLoading(false);

    const handleLogin = (user: any) => {
      setUser(user);
      netlifyIdentity.close();
    };

    const handleLogout = () => {
      setUser(null);
    };

    netlifyIdentity.on('login', handleLogin);
    netlifyIdentity.on('logout', handleLogout);

    return () => {
      netlifyIdentity.off('login', handleLogin);
      netlifyIdentity.off('logout', handleLogout);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    netlifyIdentity.logout();
  };

  // APPLY PROTECTION LEVEL SETTINGS - THIS WAS MISSING!
  const applyProtectionLevel = (level: number) => {
    const settings = PROTECTION_LEVELS[level as keyof typeof PROTECTION_LEVELS];
    setInterventionLevel(settings.interventionLevel);
    setHedgeRatio(settings.hedgeRatio);
    setHedgeStartLevel(settings.hedgeStartLevel);
    setMaxClientExposure(settings.maxClientExposure);
    setProtectionLevel(level);
    
    addAlert('info', ` Applied ${settings.name} - ${settings.description}`);
  };

  // Add alert
  const addAlert = useCallback((type: Alert['type'], message: string) => {
    const alert: Alert = {
      id: Date.now() + Math.random(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setAlerts(prev => [alert, ...prev.slice(0, 9)]);
  }, []);

  // Helper functions
  const calculatePositionSize = (level: number): number => Math.pow(2, level - 1);
  const calculateTotalExposure = (level: number, baseSize: number): number => baseSize * (Math.pow(2, level) - 1);

  // Initialize scenarios
  const initializeScenarios = useCallback(() => {
    const clientCount = whaleMode ? 8 : 12;
    const baseSize = whaleMode ? 100000 : 10000;
    
    const newScenarios: Scenario[] = [];
    for (let i = 0; i < clientCount; i++) {
      newScenarios.push({
        id: i + 1,
        name: whaleMode ? `Whale ${i + 1}` : `Client ${i + 1}`,
        currentLevel: 1,
        baseSize: baseSize,
        totalExposure: baseSize,
        isActive: Math.random() > 0.3,
        direction: Math.random() > 0.5 ? 'long' : 'short',
        entryPrice: 1.0850 + (Math.random() - 0.5) * 0.0020,
        currentPrice: 1.0850,
        pnl: 0,
        marginalCall: false,
        coordinated: coordinated && (i < clientCount * 0.6),
        whaleClient: whaleMode
      });
    }
    setScenarios(newScenarios);
  }, [whaleMode, coordinated]);

  // Market price update
  const updateMarketPrice = useCallback(() => {
    let priceChange = 0;
    
    if (gapEventTrigger && Math.random() > 0.98) {
      priceChange = (Math.random() > 0.5 ? 1 : -1) * 0.0200;
      addAlert('danger', ` MARKET GAP: 200 pips!`);
      setGapEventTrigger(false);
    } else {
      const currentVol = crisisVolatility ? volatility * 3 : volatility;
      priceChange = (Math.random() - 0.5) * currentVol * 2;
    }
    
    const newPrice = Math.max(0.5, marketPrice + priceChange);
    setMarketPrice(newPrice);
    return newPrice;
  }, [marketPrice, volatility, gapEventTrigger, crisisVolatility, addAlert]);

  // ENHANCED HEDGING COST CALCULATION - THIS WAS BROKEN!
  const calculateHedgingCost = (exposure: number, level: number, clientDirection: 'long' | 'short'): number => {
    if (!hedgingEnabled || level < hedgeStartLevel) return 0;
    
    const atmVolatility = volatility * Math.sqrt(252);
    const timeToExpiry = 0.083;
    const riskFreeRate = 0.05;
    
    const d1 = (Math.log(marketPrice / marketPrice) + (riskFreeRate + 0.5 * Math.pow(atmVolatility, 2)) * timeToExpiry) / (atmVolatility * Math.sqrt(timeToExpiry));
    const basePremium = marketPrice * 0.4 * Math.sqrt(timeToExpiry / (2 * Math.PI)) * Math.exp(-0.5 * d1 * d1);
    
    let strategyMultiplier = 1;
    switch(hedgeStrategy) {
      case 'calls':
        strategyMultiplier = clientDirection === 'short' ? 1.2 : 0.8;
        break;
      case 'puts':
        strategyMultiplier = clientDirection === 'long' ? 1.2 : 0.8;
        break;
      case 'collars':
        strategyMultiplier = 0.6;
        break;
      case 'dynamic':
        strategyMultiplier = 1.0;
        break;
    }
    
    const levelMultiplier = Math.pow(1.3, level - hedgeStartLevel);
    
    return exposure * basePremium * strategyMultiplier * levelMultiplier * hedgeRatio * 0.002;
  };

  // FIXED SIMULATION STEP - HEDGING WAS BROKEN!
  const simulationStep = useCallback(() => {
    if (scenarios.length === 0) return;
    
    setCurrentStep(prev => prev + 1);
    const newPrice = updateMarketPrice();
    let totalBrokerPnL = brokerPnL;
    let totalHedgingCost = hedgingCost;
    let totalExposureAmount = 0;
    
    const updatedScenarios = scenarios.map(scenario => {
      if (!scenario.isActive || scenario.marginalCall) return scenario;
      
      const priceChange = newPrice - scenario.currentPrice;
      const positionSize = calculatePositionSize(scenario.currentLevel);
      const currentExposure = scenario.baseSize * positionSize;
      
      const positionPnL = scenario.direction === 'long' ? 
        priceChange * currentExposure / scenario.entryPrice :
        -priceChange * currentExposure / scenario.entryPrice;
      
      const newPnL = scenario.pnl + positionPnL;
      totalExposureAmount += currentExposure;
      
      const winThreshold = simulateWins ? scenario.baseSize * 0.003 : scenario.baseSize * 0.01;
      const isWinning = Math.abs(newPnL) > winThreshold;
      const isLosing = newPnL < -scenario.baseSize * positionSize * 0.5;
      
      let updatedScenario = {
        ...scenario,
        currentPrice: newPrice,
        pnl: newPnL,
        totalExposure: calculateTotalExposure(scenario.currentLevel, scenario.baseSize)
      };
      
      if (isWinning) {
        const profit = scenario.totalExposure + scenario.baseSize;
        const hedgeProtection = hedgingEnabled && scenario.currentLevel >= hedgeStartLevel ? 
          profit * hedgeRatio : 0;
        const actualLoss = profit - hedgeProtection;
        totalBrokerPnL -= actualLoss;
        
        if (scenario.currentLevel >= 5) {
          addAlert('danger', `${scenario.name}: HIGH LEVEL WIN - Loss $${Math.round(actualLoss/1000)}k (Hedged: $${Math.round(hedgeProtection/1000)}k)`);
        }
        
        updatedScenario = {
          ...updatedScenario,
          currentLevel: 1,
          pnl: 0,
          entryPrice: newPrice,
          totalExposure: scenario.baseSize
        };
      } else if (isLosing) {
        if (scenario.currentLevel >= interventionLevel || scenario.totalExposure > maxClientExposure) {
          totalBrokerPnL += scenario.totalExposure;
          addAlert('info', `${scenario.name}: Margin call - Profit $${Math.round(scenario.totalExposure/1000)}k`);
          updatedScenario = {
            ...updatedScenario,
            marginalCall: true,
            isActive: false
          };
        } else {
          const newLevel = scenario.currentLevel + 1;
          
          if (newLevel >= 6) {
            addAlert('warning', `${scenario.name}:  CRITICAL LEVEL ${newLevel}`);
          }
          
          updatedScenario = {
            ...updatedScenario,
            currentLevel: newLevel,
            pnl: 0,
            entryPrice: newPrice,
            totalExposure: calculateTotalExposure(newLevel, scenario.baseSize)
          };
        }
      }
      
      // FIXED HEDGING CALCULATION!
      if (hedgingEnabled && updatedScenario.currentLevel >= hedgeStartLevel) {
        const hedgeCost = calculateHedgingCost(
          updatedScenario.totalExposure, 
          updatedScenario.currentLevel,
          updatedScenario.direction
        );
        totalHedgingCost += hedgeCost;
      }
      
      return updatedScenario;
    });
    
    const netPnL = totalBrokerPnL - totalHedgingCost;
    if (Math.abs(netPnL) > capitalLimit * 0.8) {
      addAlert('danger', ` CAPITAL WARNING: ${Math.round((Math.abs(netPnL) / capitalLimit) * 100)}% of limit`);
    }
    
    setScenarios(updatedScenarios);
    setBrokerPnL(totalBrokerPnL);
    setHedgingCost(totalHedgingCost);
    setTotalExposure(totalExposureAmount);
    
    const newDataPoint: ChartDataPoint = {
      step: currentStep,
      price: newPrice,
      brokerPnL: netPnL,
      exposure: totalExposureAmount,
      hedgingCost: totalHedgingCost
    };
    
    setChartData(prev => [...prev.slice(-99), newDataPoint]);
    
    if (netPnL > peakPnL) setPeakPnL(netPnL);
    const currentDrawdown = peakPnL - netPnL;
    if (currentDrawdown > maxDrawdown) setMaxDrawdown(currentDrawdown);
    
  }, [scenarios, brokerPnL, hedgingCost, updateMarketPrice, hedgingEnabled, interventionLevel, 
      simulateWins, capitalLimit, currentStep, peakPnL, addAlert, hedgeRatio, hedgeStartLevel, 
      hedgeStrategy, maxClientExposure]);

  // Auto-run
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(simulationStep, speed);
    return () => clearInterval(interval);
  }, [isRunning, speed, simulationStep]);

  // Initialize
  useEffect(() => {
    initializeScenarios();
  }, [initializeScenarios]);

  // Load stress scenarios
  const loadStressScenario = (scenarioType: string) => {
    switch(scenarioType) {
      case 'black_swan':
        setGapEventTrigger(true);
        setVolatility(0.0080);
        setCoordinated(true);
        setCrisisVolatility(true);
        break;
      case 'whale_attack':
        setWhaleMode(true);
        setCoordinated(true);
        setVolatility(0.0030);
        break;
      case 'perfect_storm':
        setCrisisVolatility(true);
        setSimulateWins(true);
        setVolatility(0.0100);
        setCoordinated(true);
        break;
    }
    addAlert('info', ` Loaded ${scenarioType.replace('_', ' ')} scenario`);
    setTimeout(initializeScenarios, 100);
  };

  // Reset
  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setBrokerPnL(0);
    setHedgingCost(0);
    setTotalExposure(0);
    setMarketPrice(1.0850);
    setChartData([]);
    setMaxDrawdown(0);
    setPeakPnL(0);
    setAlerts([]);
    setGapEventTrigger(false);
    setCrisisVolatility(false);
    setSimulateWins(false);
    setWhaleMode(false);
    setCoordinated(false);
    initializeScenarios();
  };

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Loading War Room...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  // Show help documentation
  if (showHelp) {
    return <HelpDocumentation onBack={() => setShowHelp(false)} />;
  }

  const netPnL = brokerPnL - hedgingCost;
  const capitalUtilization = Math.abs(netPnL) / capitalLimit;
  const activeClients = scenarios.filter(s => s.isActive);
  const currentProtection = PROTECTION_LEVELS[protectionLevel as keyof typeof PROTECTION_LEVELS];  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-900 min-h-screen text-white">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-6 border border-red-500">
        {/* Header with User Info and Help */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Bomb className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-red-400">MARTINGALE WAR ROOM</h1>
            <Shield className="w-8 h-8 text-blue-500" />
            <HelpButton section="overview" className="ml-2" />
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors font-semibold"
            >
              <BookOpen className="w-4 h-4 mr-2" />
               HELP & DOCUMENTATION
            </button>
            <div className="text-right text-sm">
              <p className="text-gray-300">Authorized User:</p>
              <p className="text-blue-400 font-semibold">{user.email}</p>
$appPart3 = @'
  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-900 min-h-screen text-white">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-6 border border-red-500">
        {/* Header with User Info and Help */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Bomb className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-red-400">MARTINGALE WAR ROOM</h1>
            <Shield className="w-8 h-8 text-blue-500" />
            <HelpButton section="overview" className="ml-2" />
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors font-semibold"
            >
              <BookOpen className="w-4 h-4 mr-2" />
               HELP & DOCUMENTATION
            </button>
            <div className="text-right text-sm">
              <p className="text-gray-300">Authorized User:</p>
              <p className="text-blue-400 font-semibold">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </button>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                isRunning 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isRunning ? 'CEASE FIRE' : 'ENGAGE'}
            </button>
            <button
              onClick={resetSimulation}
              className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              RESET
            </button>
          </div>
        </div>

        {/* PROTECTION LEVEL SELECTOR - RESTORED! */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg border border-blue-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-blue-300"> PROTECTION LEVEL SYSTEM</h3>
            <HelpButton section="protection" />
          </div>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(level => {
              const settings = PROTECTION_LEVELS[level as keyof typeof PROTECTION_LEVELS];
              return (
                <button
                  key={level}
                  onClick={() => applyProtectionLevel(level)}
                  className={`p-3 rounded-lg text-center transition-all ${
                    protectionLevel === level 
                      ? 'bg-blue-600 text-white border-2 border-blue-400' 
                      : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-bold text-lg">LEVEL {level}</div>
                  <div className="text-xs">{settings.name}</div>
                  <div className="text-xs mt-1 opacity-75">{settings.description}</div>
                </button>
              );
            })}
          </div>
          <div className="text-sm text-blue-200">
            <strong>Current:</strong> {currentProtection.name} | 
            <strong> Intervention:</strong> Level {interventionLevel} | 
            <strong> Hedge Ratio:</strong> {(hedgeRatio * 100).toFixed(0)}% | 
            <strong> Max Exposure:</strong> ${(maxClientExposure/1000).toFixed(0)}k
          </div>
        </div>

        {/* ADVANCED HEDGING CONTROLS - RESTORED! */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-900 to-blue-900 rounded-lg border border-green-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-green-300"> ADVANCED HEDGING CONTROLS</h3>
            <HelpButton section="hedging" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-green-800 p-3 rounded-lg border border-green-600">
              <label className="block text-xs font-medium text-green-300 mb-2">HEDGE RATIO</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={hedgeRatio}
                onChange={(e) => setHedgeRatio(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-green-200">{(hedgeRatio * 100).toFixed(0)}% hedged</span>
            </div>
            
            <div className="bg-blue-800 p-3 rounded-lg border border-blue-600">
              <label className="block text-xs font-medium text-blue-300 mb-2">HEDGE START LEVEL</label>
              <input
                type="range"
                min="1"
                max="5"
                value={hedgeStartLevel}
                onChange={(e) => setHedgeStartLevel(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-blue-200">Start at Level {hedgeStartLevel}</span>
            </div>
            
            <div className="bg-purple-800 p-3 rounded-lg border border-purple-600">
              <label className="block text-xs font-medium text-purple-300 mb-2">HEDGE STRATEGY</label>
              <select
                value={hedgeStrategy}
                onChange={(e) => setHedgeStrategy(e.target.value as any)}
                className="w-full bg-purple-700 text-white text-xs rounded p-1"
              >
                <option value="dynamic">Dynamic</option>
                <option value="calls">Call Options</option>
                <option value="puts">Put Options</option>
                <option value="collars">Collar Strategy</option>
              </select>
            </div>
            
            <div className="bg-orange-800 p-3 rounded-lg border border-orange-600">
              <label className="block text-xs font-medium text-orange-300 mb-2">MAX CLIENT EXPOSURE</label>
              <input
                type="range"
                min="100000"
                max="2000000"
                step="50000"
                value={maxClientExposure}
                onChange={(e) => setMaxClientExposure(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-orange-200">${(maxClientExposure/1000).toFixed(0)}k</span>
            </div>
          </div>
          
          <div className="p-3 bg-gray-800 rounded border border-gray-600">
            <strong className="text-gray-300"> TACTICAL RECOMMENDATIONS:</strong>
            <ul className="text-gray-400 text-sm mt-2 space-y-1">
              {capitalUtilization > 0.7 && <li>  CRITICAL: Capital utilization above 70% - Consider emergency intervention</li>}
              {!hedgingEnabled && totalExposure > 1000000 && <li>  WARNING: High exposure ($1M+) without hedging protection</li>}
              {hedgingEnabled && hedgingCost === 0 && totalExposure > 100000 && <li>  INFO: Hedging enabled but no costs yet - positions below hedge start level</li>}
              {scenarios.filter(s => s.coordinated && s.isActive).length > 3 && <li>  ALERT: Multiple coordinated accounts detected - Possible attack pattern</li>}
              {maxDrawdown > capitalLimit * 0.3 && <li>  RISK: Maximum drawdown exceeds 30% of capital limit</li>}
              {volatility > 0.008 && <li>  EXTREME: Crisis-level market volatility requires enhanced monitoring</li>}
              {protectionLevel <= 2 && <li>  RISK: Low protection level - Consider upgrading to Level 3+ for better safety</li>}
              {protectionLevel >= 4 && hedgingCost > netPnL * 0.5 && <li>  COST: High protection level may be over-hedging - consider Level 3 for better balance</li>}
              {scenarios.filter(s => s.currentLevel >= 5).length === 0 && capitalUtilization < 0.3 && totalExposure < 500000 && <li>  SAFE: All systems within normal operating parameters</li>}
            </ul>
          </div>
        </div>

        {/* Stress Test Arsenal */}
        <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-yellow-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-yellow-400"> STRESS TEST ARSENAL</h3>
            <HelpButton section="stress" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => loadStressScenario('black_swan')}
              className="p-3 bg-gray-600 hover:bg-red-600 rounded-lg text-left transition-colors border border-gray-500"
            >
              <div className="font-semibold text-sm text-red-300"> Black Swan Event</div>
              <div className="text-xs text-gray-300">Market gap + crisis volatility + coordination</div>
            </button>
            <button
              onClick={() => loadStressScenario('whale_attack')}
              className="p-3 bg-gray-600 hover:bg-blue-600 rounded-lg text-left transition-colors border border-gray-500"
            >
              <div className="font-semibold text-sm text-blue-300"> Whale Attack</div>
              <div className="text-xs text-gray-300">Multiple coordinated $100k+ accounts</div>
            </button>
            <button
              onClick={() => loadStressScenario('perfect_storm')}
              className="p-3 bg-gray-600 hover:bg-purple-600 rounded-lg text-left transition-colors border border-gray-500"
            >
              <div className="font-semibold text-sm text-purple-300"> Perfect Storm</div>
              <div className="text-xs text-gray-300">Extreme volatility + forced wins + coordination</div>
            </button>
          </div>
        </div>

        {/* Control Panel - RESTORED! */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-900 p-3 rounded-lg border border-blue-600">
            <label className="block text-xs font-medium text-blue-300 mb-2">SIMULATION SPEED</label>
            <input
              type="range"
              min="100"
              max="2000"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-blue-200">{speed}ms</span>
          </div>
          
          <div className="bg-green-900 p-3 rounded-lg border border-green-600">
            <label className="block text-xs font-medium text-green-300 mb-2">HEDGING SYSTEM</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={hedgingEnabled}
                onChange={(e) => setHedgingEnabled(e.target.checked)}
                className="w-4 h-4 text-green-600"
              />
              <span className="ml-2 text-xs text-green-200">
                {hedgingEnabled ? 'ACTIVE' : 'OFFLINE'}
              </span>
            </div>
            <div className="text-xs text-green-300 mt-1">
              Strategy: {hedgeStrategy.toUpperCase()}
            </div>
          </div>
          
          <div className="bg-yellow-900 p-3 rounded-lg border border-yellow-600">
            <label className="block text-xs font-medium text-yellow-300 mb-2">INTERVENTION LEVEL</label>
            <input
              type="range"
              min="3"
              max="8"
              value={interventionLevel}
              onChange={(e) => setInterventionLevel(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-yellow-200">Level {interventionLevel}</span>
          </div>
          
          <div className="bg-purple-900 p-3 rounded-lg border border-purple-600">
            <label className="block text-xs font-medium text-purple-300 mb-2">MARKET VOLATILITY</label>
            <input
              type="range"
              min="0.0005"
              max="0.0100"
              step="0.0001"
              value={volatility}
              onChange={(e) => setVolatility(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-purple-200">{(volatility * 100).toFixed(3)}%</span>
          </div>
        </div>

        {/* Scenario Triggers - RESTORED! */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => setGapEventTrigger(!gapEventTrigger)}
            className={`p-2 rounded-lg text-sm font-medium transition-colors ${
              gapEventTrigger ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'
            }`}
          >
            <Zap className="w-4 h-4 inline mr-1" />
            GAP EVENT {gapEventTrigger ? 'ARMED' : 'SAFE'}
          </button>
          
          <button
            onClick={() => setWhaleMode(!whaleMode)}
            className={`p-2 rounded-lg text-sm font-medium transition-colors ${
              whaleMode ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
            }`}
          >
             WHALE MODE {whaleMode ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={() => setCoordinated(!coordinated)}
            className={`p-2 rounded-lg text-sm font-medium transition-colors ${
              coordinated ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300'
            }`}
          >
             COORDINATED {coordinated ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={() => setSimulateWins(!simulateWins)}
            className={`p-2 rounded-lg text-sm font-medium transition-colors ${
              simulateWins ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
            }`}
          >
             FORCE WINS {simulateWins ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white"> KEY PERFORMANCE INDICATORS</h3>
            <HelpButton section="metrics" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg border border-blue-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-xs">MARKET PRICE</p>
                  <p className="text-xl font-bold">{marketPrice.toFixed(4)}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-blue-300" />
              </div>
            </div>
            
            <div className={`${netPnL >= 0 ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-red-600 to-red-700'} text-white p-4 rounded-lg border ${netPnL >= 0 ? 'border-green-400' : 'border-red-400'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-xs opacity-90">NET P&L</p>
                  <p className="text-xl font-bold">${Math.round(netPnL/1000)}k</p>
                </div>
                {netPnL >= 0 ? <TrendingUp className="w-6 h-6 opacity-90" /> : <TrendingDown className="w-6 h-6 opacity-90" />}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-4 rounded-lg border border-orange-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-200 text-xs">TOTAL EXPOSURE</p>
                  <p className="text-xl font-bold">${Math.round(totalExposure/1000)}k</p>
                  <p className="text-xs text-orange-200">{(totalExposure/capitalLimit * 100).toFixed(1)}% of capital</p>
                </div>
                <AlertTriangle className="w-6 h-6 text-orange-300" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-lg border border-purple-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-xs">HEDGE COST</p>
                  <p className="text-xl font-bold">${Math.round(hedgingCost/1000)}k</p>
                  <p className="text-xs text-purple-200">{hedgingCost > 0 ? `${(hedgeRatio * 100).toFixed(0)}% ratio` : 'No hedging'}</p>
                </div>
                <Settings className="w-6 h-6 text-purple-300" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4 rounded-lg border border-gray-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-200 text-xs">ACTIVE CLIENTS</p>
                  <p className="text-xl font-bold">{activeClients.length}</p>
                  <p className="text-xs text-gray-300">{scenarios.filter(s => s.currentLevel >= 5).length} critical</p>
                </div>
                <div className="text-2xl"></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 rounded-lg border border-indigo-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-200 text-xs">PROTECTION</p>
                  <p className="text-xl font-bold">LVL {protectionLevel}</p>
                  <p className="text-xs text-indigo-200">{currentProtection.name}</p>
                </div>
                <Shield className="w-6 h-6 text-indigo-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Live Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 bg-black rounded-lg border border-red-500 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-red-400 font-bold flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                 LIVE THREAT ASSESSMENT
              </h3>
              <HelpButton section="overview" />
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {alerts.slice(0, 5).map(alert => (
                <div
                  key={alert.id}
                  className={`text-xs p-2 rounded flex justify-between ${
                    alert.type === 'danger' ? 'bg-red-900 text-red-200 border-l-4 border-red-600' :
                    alert.type === 'warning' ? 'bg-yellow-900 text-yellow-200 border-l-4 border-yellow-600' :
                    'bg-blue-900 text-blue-200 border-l-4 border-blue-600'
                  }`}
                >
                  <span>{alert.message}</span>
                  <span className="text-gray-400">{alert.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 p-4 border border-gray-600 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-400"> BROKER P&L vs HEDGING COST</h3>
              <HelpButton section="metrics" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="step" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === 'brokerPnL') return [`${Math.round(Number(value)/1000)}k`, 'Net P&L'];
                    if (name === 'hedgingCost') return [`${Math.round(Number(value)/1000)}k`, 'Hedge Cost'];
                    return [value, name];
                  }}
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#ffffff' }}
                />
                <Line type="monotone" dataKey="brokerPnL" stroke="#EF4444" strokeWidth={2} name="brokerPnL" />
                <Line type="monotone" dataKey="hedgingCost" stroke="#8B5CF6" strokeWidth={2} name="hedgingCost" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-gray-800 p-4 border border-gray-600 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-400"> MARKET PRICE MOVEMENT</h3>
              <HelpButton section="martingale" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="step" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(value: any) => [Number(value).toFixed(4), 'Price']} 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#ffffff' }}
                />
                <Line type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Client Status Table */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-red-400"> CLIENT COMBAT STATUS</h3>
              <HelpButton section="martingale" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Threat Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Exposure</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">P&L</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Direction</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Hedge Status</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {scenarios.slice(0, 10).map((scenario) => {
                  const threatLevel = scenario.currentLevel >= 6 ? 'CRITICAL' : 
                                    scenario.currentLevel >= 4 ? 'HIGH' : 
                                    scenario.currentLevel >= 3 ? 'MEDIUM' : 'LOW';
                  const threatColor = scenario.currentLevel >= 6 ? 'text-red-400' : 
                                    scenario.currentLevel >= 4 ? 'text-orange-400' : 
                                    scenario.currentLevel >= 3 ? 'text-yellow-400' : 'text-green-400';
                  
                  const isHedged = hedgingEnabled && scenario.currentLevel >= hedgeStartLevel;
                  
                  return (
                    <tr key={scenario.id} className={scenario.isActive ? '' : 'bg-gray-700 opacity-60'}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                        {scenario.name}
                        {scenario.whaleClient && <span className="ml-1 text-blue-400"></span>}
                        {scenario.coordinated && <span className="ml-1 text-red-400"></span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          scenario.marginalCall 
                            ? 'bg-red-900 text-red-300 border border-red-600' 
                            : scenario.isActive 
                            ? 'bg-green-900 text-green-300 border border-green-600' 
                            : 'bg-gray-700 text-gray-300 border border-gray-600'
                        }`}>
                          {scenario.marginalCall ? 'KIA' : scenario.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-sm font-bold ${threatColor}`}>
                          LVL {scenario.currentLevel} - {threatLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        ${Math.round(scenario.totalExposure/1000)}k
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                        scenario.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${Math.round(scenario.pnl/1000)}k
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          scenario.direction === 'long' ? 'bg-blue-900 text-blue-300' : 'bg-orange-900 text-orange-300'
                        }`}>
                          {scenario.direction.toUpperCase()}
</span>
                     </td>
                     <td className="px-4 py-3 whitespace-nowrap text-sm">
                       <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                         isHedged ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
                       }`}>
                         {isHedged ? ` ${(hedgeRatio * 100).toFixed(0)}%` : 'UNHEDGED'}
                       </span>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
         </div>
       </div>

       {/* War Room Intelligence Summary */}
       <div className="mt-6 bg-red-950 border border-red-500 rounded-lg p-4">
         <div className="flex items-center justify-between mb-3">
           <h3 className="text-lg font-semibold text-red-400 flex items-center">
             <Shield className="w-5 h-5 mr-2" />
              BATTLEFIELD INTELLIGENCE
           </h3>
           <HelpButton section="overview" />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
           <div className="bg-red-900 p-3 rounded border border-red-600">
             <strong className="text-red-300">THREAT ASSESSMENT:</strong> 
             <p className="text-gray-300 mt-1">
               {scenarios.filter(s => s.currentLevel >= 6).length} clients at critical levels (6+).
               Capital utilization: {(capitalUtilization * 100).toFixed(1)}%.
               {capitalUtilization > 0.5 && "  HIGH RISK"}
               {capitalUtilization <= 0.3 && scenarios.filter(s => s.currentLevel >= 6).length === 0 && "  SAFE"}
             </p>
           </div>
           <div className="bg-blue-900 p-3 rounded border border-blue-600">
             <strong className="text-blue-300">HEDGING STATUS:</strong>
             <p className="text-gray-300 mt-1">
               System {hedgingEnabled ? 'ONLINE' : 'OFFLINE'}.
               Strategy: {hedgeStrategy.toUpperCase()}.
               Ratio: {(hedgeRatio * 100).toFixed(0)}%.
               {hedgingCost > 0 ? ` Cost: ${(hedgingCost/1000).toFixed(0)}k` : ' No costs yet'}
             </p>
           </div>
           <div className="bg-green-900 p-3 rounded border border-green-600">
             <strong className="text-green-300">MARKET CONDITIONS:</strong>
             <p className="text-gray-300 mt-1">
               Volatility: {(volatility * 100).toFixed(3)}%
               {volatility > 0.005 && " (EXTREME)"}
               {gapEventTrigger && " |  GAP ARMED"}
               {crisisVolatility && " |  CRISIS MODE"}
               {!gapEventTrigger && !crisisVolatility && volatility <= 0.003 && " |  NORMAL"}
             </p>
           </div>
           <div className="bg-purple-900 p-3 rounded border border-purple-600">
             <strong className="text-purple-300">PROTECTION STATUS:</strong>
             <p className="text-gray-300 mt-1">
               {currentProtection.name} active.
               Intervention at Level {interventionLevel}.
               Max exposure: ${(maxClientExposure/1000).toFixed(0)}k.
               Hedge starts: Level {hedgeStartLevel}.
             </p>
           </div>
         </div>
       </div>
     </div>
   </div>
 );
};

export default MartingaleWarRoomSimulator;
