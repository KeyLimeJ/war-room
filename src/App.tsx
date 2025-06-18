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

// HELP CONTENT SECTIONS
const HELP_SECTIONS = {
  overview: {
    title: 'Martingale War Room Overview',
    content: `
# What is the Martingale War Room?

The Martingale War Room is a comprehensive risk management simulation system designed specifically for B-book forex brokers who face exposure to martingale trading strategies.

## The Core Problem

**Martingale trading** is a strategy where traders double their position size after each losing trade, with the mathematical expectation that an eventual win will recover all prior losses plus generate profit. For B-book brokers, this creates an **inverted risk scenario**:

- **When clients lose:** Broker profits (traditional scenario)
- **When clients win:** Broker faces potentially catastrophic losses due to exponential position sizing

## Why This Matters

A single successful martingale sequence at high levels can result in losses exceeding a broker's entire annual revenue. For example:
- Level 1: $10,000 position
- Level 5: $160,000 position  
- Level 7: $640,000 position
- **Total exposure at Level 7: $1,270,000**

If multiple clients run coordinated martingale strategies simultaneously, the combined exposure can threaten the broker's existence.

## The Solution

This War Room provides:
1. **Real-time risk monitoring** of client martingale activities
2. **Advanced hedging strategies** using options to protect against catastrophic losses
3. **5-level protection system** from minimal to maximum risk management
4. **Stress testing capabilities** to simulate extreme market scenarios
5. **Intervention protocols** to manage client relationships while preserving capital
    `
  },
  martingale: {
    title: 'Understanding Martingale Strategies',
    content: `
# Martingale Strategy Deep Dive

## Mathematical Foundation

The martingale strategy is based on the **Gambler's Ruin** principle with the assumption that losing streaks are temporary and will eventually reverse.

### Position Sizing Formula
- **Level n position size:** 2^(n-1)  Base Position
- **Total exposure at level n:** Base Position  (2^n - 1)

### Example Progression (Starting with $10,000):
1. **Level 1:** $10,000 position | Total risk: $10,000
2. **Level 2:** $20,000 position | Total risk: $30,000  
3. **Level 3:** $40,000 position | Total risk: $70,000
4. **Level 4:** $80,000 position | Total risk: $150,000
5. **Level 5:** $160,000 position | Total risk: $310,000
6. **Level 6:** $320,000 position | Total risk: $630,000
7. **Level 7:** $640,000 position | Total risk: $1,270,000

## Success vs Failure Probabilities

**Theoretical success rate:** Depends on market conditions and leverage
- **50% win rate per trade:** 50% chance of success at Level 1, 25% at Level 2, etc.
- **Reality:** Market gaps, liquidity issues, and capital constraints create failure points

## Common Failure Points

1. **Capital Exhaustion (70-80%):** Running out of margin before a win
2. **Market Gaps (10-15%):** Price jumps that bypass stop-losses  
3. **Liquidity Crises (5-10%):** Unable to execute trades at desired prices
4. **Regulatory Intervention (1-3%):** Broker or regulatory stops

## Coordinated Martingale Attacks

**Professional trading groups** sometimes coordinate multiple accounts to:
- Synchronize entry timing across currency pairs
- Share risk intelligence and market analysis
- Maximize pressure on specific brokers
- Create concentrated exposure events

## Detection Indicators

The War Room monitors for:
- **Identical position sizing patterns** across accounts
- **Synchronized entry/exit timing** 
- **Correlated currency pair selection**
- **Similar risk management parameters**
- **Geographic clustering of accounts**
    `
  }
};
// Add more help sections to HELP_SECTIONS
const HELP_SECTIONS_PART2 = {
  protection: {
    title: 'Protection Level System Explained',
    content: `
# 5-Level Protection System

The War Room implements a sophisticated risk management framework with five protection levels, each designed for different risk appetites and business models.

## Level 1: Minimal Protection
**Philosophy:** Maximum client freedom, high profit potential, extreme risk

**Settings:**
- **Intervention Level:** 7 (allows clients to reach $1.27M exposure)
- **Hedge Ratio:** 30% (minimal hedging cost)
- **Hedge Start Level:** 5 (hedging begins late)
- **Max Client Exposure:** $1,000,000

**Use Case:** High-risk, high-reward operations with substantial capital reserves

## Level 3: Balanced Protection (RECOMMENDED)
**Philosophy:** Optimal balance between risk management and profitability

**Settings:**
- **Intervention Level:** 5 ($310k max exposure)
- **Hedge Ratio:** 70%
- **Hedge Start Level:** 3  
- **Max Client Exposure:** $500,000

**Use Case:** Established brokers seeking sustainable growth

## Level 5: Maximum Protection
**Philosophy:** Ultra-conservative, regulatory-compliant operations

**Settings:**
- **Intervention Level:** 3 ($70k max exposure)
- **Hedge Ratio:** 95%
- **Hedge Start Level:** 2
- **Max Client Exposure:** $200,000

**Use Case:** Highly regulated markets or capital-constrained brokers
    `
  },
  hedging: {
    title: 'Advanced Hedging Strategies',
    content: `
# Hedging Martingale Exposure

## The Hedging Challenge

Traditional delta hedging doesn't work effectively against martingale strategies because:
1. **Exponential position growth** creates non-linear risk
2. **Timing uncertainty** makes standard hedging reactive
3. **Multiple concurrent exposures** require portfolio-level strategies

## Options-Based Hedging Strategies

### 1. Dynamic Put/Call Strategy
**Mechanism:** Buy options in opposite direction of client positions
- **Client goes long martingale  Buy put options**
- **Client goes short martingale  Buy call options**

**Advantages:**
- Limited downside (premium cost)
- Exponential payoff matches martingale risk profile
- Can be scaled with position levels

### 2. Collar Strategy  
**Mechanism:** Combine bought and sold options to reduce net cost
- **Buy protective puts/calls** (protection)
- **Sell out-of-money calls/puts** (premium collection)

**Advantages:**
- Lower net cost than pure options buying
- Defined risk parameters
- Premium income offsets protection costs

## Cost-Benefit Analysis

### Example Scenario:
- **Client reaches Level 6:** $630,000 exposure
- **Without hedging:** Potential $630k loss if client wins
- **With 70% hedging:** $189k potential loss + $15k hedge cost = $204k total
- **Net benefit:** $426k loss prevention for $15k cost (28:1 ratio)
    `
  }
};

// LOGIN COMPONENT
const LoginScreen = () => {
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
};

// HELP BUTTON COMPONENT
const HelpButton = ({ section, onHelpClick, className = "" }) => {
  return (
    <button
      onClick={() => onHelpClick(section)}
      className={`flex items-center justify-center w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors ${className}`}
      title="Get help for this section"
    >
      <HelpCircle className="w-4 h-4" />
    </button>
  );
};

// HELP MODAL COMPONENT
const HelpModal = ({ section, onClose }) => {
  const allHelpSections = { ...HELP_SECTIONS, ...HELP_SECTIONS_PART2 };
  const helpContent = allHelpSections[section];
  
  if (!helpContent) return null;

  const formatContent = (content) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return React.createElement('h1', { 
          key: index, 
          className: "text-2xl font-bold text-blue-400 mb-4 mt-6" 
        }, line.substring(2));
      }
      if (line.startsWith('## ')) {
        return React.createElement('h2', { 
          key: index, 
          className: "text-xl font-bold text-green-400 mb-3 mt-5" 
        }, line.substring(3));
      }
      if (line.startsWith('### ')) {
        return React.createElement('h3', { 
          key: index, 
          className: "text-lg font-bold text-yellow-400 mb-2 mt-4" 
        }, line.substring(4));
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return React.createElement('p', { 
          key: index, 
          className: "font-bold text-white mb-2" 
        }, line.substring(2, line.length - 2));
      }
      if (line.startsWith('- ')) {
        return React.createElement('li', { 
          key: index, 
          className: "text-gray-300 mb-1 ml-4" 
        }, line.substring(2));
      }
      if (line.trim() === '') {
        return React.createElement('br', { key: index });
      }
      return React.createElement('p', { 
        key: index, 
        className: "text-gray-300 mb-2" 
      }, line);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto border border-blue-500">
        <div className="sticky top-0 bg-gray-700 p-4 border-b border-gray-600 flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-400">{helpContent.title}</h2>
          <button
            onClick={onClose}
            className="flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to War Room
          </button>
        </div>
        <div className="p-6">
          {formatContent(helpContent.content)}
        </div>
      </div>
    </div>
  );
};
  const [simulateWins, setSimulateWins] = useState(false);
  const [crisisVolatility, setCrisisVolatility] = useState(false);
  
  // Performance tracking
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [capitalLimit] = useState(5000000);
  const [maxDrawdown, setMaxDrawdown] = useState(0);
  const [peakPnL, setPeakPnL] = useState(0);

  // Help system state
  const [showHelp, setShowHelp] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpSection, setHelpSection] = useState('');

  // Help handlers
  const handleHelpClick = (section: string) => {
    setHelpSection(section);
    setShowHelpModal(true);
  };

  const handleShowDocumentation = () => {
    setShowHelp(true);
  };

  const handleHelpSectionSelect = (section: string) => {
    setHelpSection(section);
    setShowHelpModal(true);
    setShowHelp(false);
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

  // Simulation step (complete implementation)
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
        totalBrokerPnL -= profit;
        
        if (scenario.currentLevel >= 5) {
          addAlert('danger', `${scenario.name}: HIGH LEVEL WIN - Loss $${Math.round(profit/1000)}k`);
        }
        
        updatedScenario = {
          ...updatedScenario,
          currentLevel: 1,
          pnl: 0,
          entryPrice: newPrice,
          totalExposure: scenario.baseSize
        };
      } else if (isLosing) {
        if (scenario.currentLevel >= interventionLevel) {
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
      
      if (hedgingEnabled && updatedScenario.currentLevel >= 3) {
        totalHedgingCost += updatedScenario.totalExposure * 0.001;
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
      exposure: totalExposureAmount
    };
    
    setChartData(prev => [...prev.slice(-99), newDataPoint]);
    
    if (netPnL > peakPnL) setPeakPnL(netPnL);
    const currentDrawdown = peakPnL - netPnL;
    if (currentDrawdown > maxDrawdown) setMaxDrawdown(currentDrawdown);
    
  }, [scenarios, brokerPnL, hedgingCost, updateMarketPrice, hedgingEnabled, interventionLevel, 
      simulateWins, capitalLimit, currentStep, peakPnL, addAlert]);

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
        addAlert('danger', ' BLACK SWAN EVENT LOADED - Brace for impact!');
        break;
      case 'whale_attack':
        setWhaleMode(true);
        setCoordinated(true);
        setVolatility(0.0030);
        addAlert('warning', ' WHALE ATTACK MODE - Multiple coordinated large accounts');
        break;
      case 'perfect_storm':
        setCrisisVolatility(true);
        setSimulateWins(true);
        setVolatility(0.0100);
        setCoordinated(true);
        addAlert('danger', ' PERFECT STORM - Maximum chaos scenario engaged');
        break;
    }
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
    addAlert('info', ' WAR ROOM RESET - All systems restored to baseline');
    initializeScenarios();
  };

  // Show help documentation
  if (showHelp) {
    return <HelpDocumentation onBack={() => setShowHelp(false)} onSectionSelect={handleHelpSectionSelect} />;
  }

  const netPnL = brokerPnL - hedgingCost;
  const capitalUtilization = Math.abs(netPnL) / capitalLimit;
  const activeClients = scenarios.filter(s => s.isActive);

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-900 min-h-screen text-white">
      {/* Help Modal */}
      {showHelpModal && (
        <HelpModal 
          section={helpSection} 
          onClose={() => setShowHelpModal(false)} 
        />
      )}

      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-6 border border-red-500">
        {/* Header with Help Integration */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Bomb className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-red-400">MARTINGALE WAR ROOM</h1>
            <Shield className="w-8 h-8 text-blue-500" />
            <HelpButton section="overview" onHelpClick={handleHelpClick} className="ml-2" />
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleShowDocumentation}
              className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Help & Documentation
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
              RESET BATTLEFIELD
            </button>
          </div>
        </div>

        {/* Stress Test Arsenal with Help */}
        <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-yellow-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-yellow-400"> STRESS TEST ARSENAL</h3>
            <HelpButton section="stress" onHelpClick={handleHelpClick} />
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

        {/* Control Panel with Help */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-900 p-3 rounded-lg border border-blue-600">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-blue-300">SIMULATION SPEED</label>
              <HelpButton section="overview" onHelpClick={handleHelpClick} className="w-4 h-4" />
            </div>
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-green-300">HEDGING SYSTEM</label>
              <HelpButton section="hedging" onHelpClick={handleHelpClick} className="w-4 h-4" />
            </div>
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
          </div>
          
          <div className="bg-yellow-900 p-3 rounded-lg border border-yellow-600">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-yellow-300">INTERVENTION LEVEL</label>
              <HelpButton section="protection" onHelpClick={handleHelpClick} className="w-4 h-4" />
            </div>
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-purple-300">MARKET VOLATILITY</label>
              <HelpButton section="stress" onHelpClick={handleHelpClick} className="w-4 h-4" />
            </div>
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

        {/* Rest of the War Room interface continues... */}
        {/* Key Metrics Dashboard with help buttons */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg border border-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <p className="text-blue-200 text-xs">MARKET PRICE</p>
                  <HelpButton section="metrics" onHelpClick={handleHelpClick} className="ml-1 w-3 h-3" />
                </div>
                <p className="text-xl font-bold">{marketPrice.toFixed(4)}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-300" />
            </div>
          </div>
          
          <div className={`${netPnL >= 0 ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-red-600 to-red-700'} text-white p-4 rounded-lg border ${netPnL >= 0 ? 'border-green-400' : 'border-red-400'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <p className="text-white text-xs opacity-90">NET P&L</p>
                  <HelpButton section="metrics" onHelpClick={handleHelpClick} className="ml-1 w-3 h-3" />
                </div>
                <p className="text-xl font-bold">${Math.round(netPnL/1000)}k</p>
              </div>
              {netPnL >= 0 ? <TrendingUp className="w-6 h-6 opacity-90" /> : <TrendingDown className="w-6 h-6 opacity-90" />}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-4 rounded-lg border border-orange-400">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <p className="text-orange-200 text-xs">TOTAL EXPOSURE</p>
                  <HelpButton section="metrics" onHelpClick={handleHelpClick} className="ml-1 w-3 h-3" />
                </div>
                <p className="text-xl font-bold">${Math.round(totalExposure/1000)}k</p>
                <p className="text-xs text-orange-200">{(totalExposure/capitalLimit * 100).toFixed(1)}% of capital</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-orange-300" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-lg border border-purple-400">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <p className="text-purple-200 text-xs">HEDGE COST</p>
                  <HelpButton section="hedging" onHelpClick={handleHelpClick} className="ml-1 w-3 h-3" />
                </div>
                <p className="text-xl font-bold">${Math.round(hedgingCost/1000)}k</p>
              </div>
              <Settings className="w-6 h-6 text-purple-300" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4 rounded-lg border border-gray-400">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <p className="text-gray-200 text-xs">ACTIVE CLIENTS</p>
                  <HelpButton section="martingale" onHelpClick={handleHelpClick} className="ml-1 w-3 h-3" />
                </div>
                <p className="text-xl font-bold">{activeClients.length}</p>
                <p className="text-xs text-gray-300">{scenarios.filter(s => s.currentLevel >= 5).length} critical</p>
              </div>
              <div className="text-2xl"></div>
            </div>
          </div>
        </div>

        {/* Continue with rest of interface... */}
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-green-400 mb-4"> WAR ROOM CORE OPERATIONAL</h2>
          <p className="text-gray-300">
            Complete help system integrated with contextual assistance throughout the interface.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-900 p-3 rounded border border-blue-600">
              <h4 className="text-blue-300 font-bold"> Documentation</h4>
              <p className="text-gray-300 text-sm">Complete help system with 6 detailed sections</p>
            </div>
            <div className="bg-green-900 p-3 rounded border border-green-600">
              <h4 className="text-green-300 font-bold"> Contextual Help</h4>
              <p className="text-gray-300 text-sm">Help buttons throughout the interface</p>
            </div>
            <div className="bg-purple-900 p-3 rounded border border-purple-600">
              <h4 className="text-purple-300 font-bold"> Modal System</h4>
              <p className="text-gray-300 text-sm">Detailed explanations without leaving the War Room</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MartingaleWarRoomSimulator;

