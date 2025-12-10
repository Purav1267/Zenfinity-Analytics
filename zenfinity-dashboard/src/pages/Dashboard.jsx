import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import TempChart from '../components/TempChart';
import KPICard from '../components/KPICard';
import { 
  ArrowLeft, Clock, Zap, Activity, Thermometer, 
  Navigation, AlertTriangle, CheckCircle, Battery, Gauge, Car, TrendingUp,
  Search, BarChart3, Shield, TrendingDown, Award, Target, Filter, X,
  Download, Info, RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ComposedChart,
} from 'recharts';

const Dashboard = () => {
  const { imei } = useParams();
  const [selectedCycleId, setSelectedCycleId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [minCycleNumber, setMinCycleNumber] = useState('');
  const [maxCycleNumber, setMaxCycleNumber] = useState('');
  const [minDuration, setMinDuration] = useState('');
  const [maxDuration, setMaxDuration] = useState('');

  const { data: cycleList, isLoading: listLoading } = useQuery({
    queryKey: ['snapshots', imei],
    queryFn: () => api.getSnapshots(imei),
  });

  // Don't auto-select a cycle - let user choose or view all cycles overview

  // Get cycles list for keyboard navigation
  const cycles = cycleList?.items ?? [];
  
  // Keyboard shortcuts for cycle navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return; // Don't interfere with input fields
      }

      if (cycles.length === 0) return;

      const currentIndex = selectedCycleId 
        ? cycles.findIndex(c => c.cycle_number === selectedCycleId)
        : -1;
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          setSelectedCycleId(cycles[currentIndex - 1].cycle_number);
        } else if (currentIndex === -1 && cycles.length > 0) {
          // If no cycle selected, select the last one
          setSelectedCycleId(cycles[cycles.length - 1].cycle_number);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex >= 0 && currentIndex < cycles.length - 1) {
          setSelectedCycleId(cycles[currentIndex + 1].cycle_number);
        } else if (currentIndex === -1 && cycles.length > 0) {
          // If no cycle selected, select the first one
          setSelectedCycleId(cycles[0].cycle_number);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        if (cycles.length > 0) {
          setSelectedCycleId(cycles[0].cycle_number);
        }
      } else if (e.key === 'End') {
        e.preventDefault();
        if (cycles.length > 0) {
          setSelectedCycleId(cycles[cycles.length - 1].cycle_number);
        }
      } else if (e.key === 'Escape' && selectedCycleId) {
        e.preventDefault();
        setSelectedCycleId(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cycles, selectedCycleId]);

  const { data: cycleDetails, isLoading: detailsLoading, dataUpdatedAt } = useQuery({
    queryKey: ['cycle', imei, selectedCycleId],
    queryFn: () => api.getCycleDetails(imei, selectedCycleId),
    enabled: !!selectedCycleId,
  });

  // CSV Export function for single cycle
  const exportToCSV = () => {
    if (!cycleDetails) return;
    
    const headers = [
      'Cycle Number', 'Start Time', 'End Time', 'Duration (hours)',
      'SOH Drop (%)', 'Avg SOH (%)', 'Min SOH (%)', 'Max SOH (%)',
      'Avg SOC (%)', 'Min SOC (%)', 'Max SOC (%)',
      'Avg Temperature (°C)', 'Avg Voltage (V)', 'Min Voltage (V)', 'Max Voltage (V)',
      'Avg Current (A)', 'Total Distance (km)', 'Avg Speed (km/h)', 'Max Speed (km/h)',
      'Data Points', 'Charging Instances', 'Warnings', 'Protections'
    ];
    
    const row = [
      cycleDetails.cycle_number,
      new Date(cycleDetails.cycle_start_time).toISOString(),
      new Date(cycleDetails.cycle_end_time).toISOString(),
      cycleDetails.cycle_duration_hours?.toFixed(2) ?? '',
      cycleDetails.soh_drop ?? 0,
      cycleDetails.average_soh?.toFixed(2) ?? '',
      cycleDetails.min_soh?.toFixed(2) ?? '',
      cycleDetails.max_soh?.toFixed(2) ?? '',
      cycleDetails.average_soc?.toFixed(2) ?? '',
      cycleDetails.min_soc ?? '',
      cycleDetails.max_soc ?? '',
      cycleDetails.average_temperature?.toFixed(2) ?? '',
      cycleDetails.voltage_avg?.toFixed(2) ?? '',
      cycleDetails.voltage_min?.toFixed(2) ?? '',
      cycleDetails.voltage_max?.toFixed(2) ?? '',
      cycleDetails.current_avg?.toFixed(2) ?? '',
      cycleDetails.total_distance?.toFixed(2) ?? '',
      cycleDetails.average_speed?.toFixed(2) ?? '',
      cycleDetails.max_speed ?? '',
      cycleDetails.data_points_count ?? '',
      cycleDetails.charging_instances_count ?? 0,
      cycleDetails.warning_count ?? 0,
      cycleDetails.protection_count ?? 0,
    ];
    
    const csvContent = [
      headers.join(','),
      row.map(val => `"${val}"`).join(',')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cycle-${cycleDetails.cycle_number}-${imei}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export function for all cycles
  const exportAllCyclesToCSV = () => {
    if (filteredCycles.length === 0) return;
    
    const headers = [
      'Cycle Number', 'Start Time', 'End Time', 'Duration (hours)',
      'SOH Drop (%)', 'Avg SOH (%)', 'Min SOH (%)', 'Max SOH (%)',
      'Avg SOC (%)', 'Min SOC (%)', 'Max SOC (%)',
      'Avg Temperature (°C)', 'Avg Voltage (V)', 'Min Voltage (V)', 'Max Voltage (V)',
      'Avg Current (A)', 'Total Distance (km)', 'Avg Speed (km/h)', 'Max Speed (km/h)',
      'Data Points', 'Charging Instances', 'Warnings', 'Protections'
    ];
    
    const rows = filteredCycles.map(cycle => [
      cycle.cycle_number,
      new Date(cycle.cycle_start_time).toISOString(),
      new Date(cycle.cycle_end_time).toISOString(),
      cycle.cycle_duration_hours?.toFixed(2) ?? '',
      cycle.soh_drop ?? 0,
      cycle.average_soh?.toFixed(2) ?? '',
      cycle.min_soh?.toFixed(2) ?? '',
      cycle.max_soh?.toFixed(2) ?? '',
      cycle.average_soc?.toFixed(2) ?? '',
      cycle.min_soc ?? '',
      cycle.max_soc ?? '',
      cycle.average_temperature?.toFixed(2) ?? '',
      cycle.voltage_avg?.toFixed(2) ?? '',
      cycle.voltage_min?.toFixed(2) ?? '',
      cycle.voltage_max?.toFixed(2) ?? '',
      cycle.current_avg?.toFixed(2) ?? '',
      cycle.total_distance?.toFixed(2) ?? '',
      cycle.average_speed?.toFixed(2) ?? '',
      cycle.max_speed ?? '',
      cycle.data_points_count ?? '',
      cycle.charging_instances_count ?? 0,
      cycle.warning_count ?? 0,
      cycle.protection_count ?? 0,
    ].map(val => `"${val}"`).join(','));
    
    const csvContent = [
      headers.join(','),
      ...rows
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const filterSuffix = filteredCycles.length < cycles.length ? `-filtered-${filteredCycles.length}` : '';
    link.setAttribute('download', `all-cycles-${imei}${filterSuffix}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Detect anomalies - will be defined after filteredCycles

  if (listLoading) return <div className="p-10 text-center text-slate-900 dark:text-white">Loading battery data...</div>;
  
  // Filter cycles based on search query, time period, and cycle number range
  const filteredCycles = cycles.filter((cycle) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        cycle.cycle_number.toString().includes(query) ||
        new Date(cycle.cycle_start_time).toLocaleDateString().toLowerCase().includes(query)
      );
      if (!matchesSearch) return false;
    }

    // Time period filter
    if (timeFilter !== 'all') {
      const cycleDate = new Date(cycle.cycle_start_time);
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (timeFilter) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          cutoffDate = null;
      }
      
      if (cutoffDate && cycleDate < cutoffDate) return false;
    }

    // Cycle number range filter
    if (minCycleNumber && cycle.cycle_number < parseInt(minCycleNumber)) return false;
    if (maxCycleNumber && cycle.cycle_number > parseInt(maxCycleNumber)) return false;

    // Duration filter (cycle duration in hours)
    const cycleDuration = cycle.cycle_duration_hours ?? 0;
    if (minDuration && cycleDuration < parseFloat(minDuration)) return false;
    if (maxDuration && cycleDuration > parseFloat(maxDuration)) return false;

    return true;
  });

  // Get min and max cycle numbers for range inputs
  const cycleNumbers = cycles.map(c => c.cycle_number).sort((a, b) => a - b);
  const minAvailableCycle = cycleNumbers[0] ?? 1;
  const maxAvailableCycle = cycleNumbers[cycleNumbers.length - 1] ?? 100;

  // Get min and max durations for range inputs
  const durations = cycles.map(c => c.cycle_duration_hours ?? 0).filter(d => d > 0).sort((a, b) => a - b);
  const minAvailableDuration = durations[0] ?? 0;
  const maxAvailableDuration = durations[durations.length - 1] ?? 0;

  // Detect anomalies
  const detectAnomalies = (cycle) => {
    if (!cycle) return [];
    const anomalies = [];
    
    // High SOH drop
    if (cycle.soh_drop > 5) {
      anomalies.push({ type: 'warning', message: 'High SOH drop detected' });
    }
    
    // High temperature
    if (cycle.average_temperature > 40) {
      anomalies.push({ type: 'warning', message: 'High average temperature' });
    }
    
    // Low SOH
    if (cycle.average_soh < 80) {
      anomalies.push({ type: 'critical', message: 'Low battery health (SOH < 80%)' });
    }
    
    // High protection count
    if (cycle.protection_count > 0) {
      anomalies.push({ type: 'critical', message: 'Protection events triggered' });
    }
    
    // Unusual duration
    if (filteredCycles.length > 0) {
      const avgDuration = filteredCycles.reduce((sum, c) => sum + (c.cycle_duration_hours ?? 0), 0) / filteredCycles.length;
      if (cycle.cycle_duration_hours && Math.abs(cycle.cycle_duration_hours - avgDuration) > avgDuration * 0.5) {
        anomalies.push({ type: 'info', message: 'Unusual cycle duration' });
      }
    }
    
    return anomalies;
  };

  // Calculate aggregate stats based on filtered cycles
  const aggregateStats = filteredCycles.length > 0 ? {
    totalCycles: filteredCycles.length,
    avgSOH: filteredCycles.reduce((sum, c) => sum + (c.average_soh ?? 0), 0) / filteredCycles.length,
    totalDistance: filteredCycles.reduce((sum, c) => sum + (c.total_distance ?? 0), 0),
    totalWarnings: filteredCycles.reduce((sum, c) => sum + (c.warning_count ?? 0), 0),
    totalProtections: filteredCycles.reduce((sum, c) => sum + (c.protection_count ?? 0), 0),
    avgTemp: filteredCycles.reduce((sum, c) => sum + (c.average_temperature ?? 0), 0) / filteredCycles.length,
  } : null;

  // Calculate battery health score (0-100)
  const calculateHealthScore = (cycle) => {
    if (!cycle) return null;
    let score = 100;
    const soh = cycle.average_soh ?? 100;
    const sohDrop = cycle.soh_drop ?? 0;
    const warnings = cycle.warning_count ?? 0;
    const protections = cycle.protection_count ?? 0;
    
    score -= (100 - soh) * 0.5; // SOH impact
    score -= sohDrop * 2; // SOH drop impact
    score -= warnings * 3; // Warning impact
    score -= protections * 10; // Protection impact
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const trendData = filteredCycles.map((cycle) => ({
    cycle: cycle.cycle_number,
    soh_avg: cycle.average_soh ?? cycle.max_soh ?? cycle.min_soh ?? null,
    soh_drop: cycle.soh_drop ?? null,
    soc: cycle.average_soc ?? null,
    temp: cycle.average_temperature ?? null,
    distance: cycle.total_distance ?? null,
    speed: cycle.average_speed ?? null,
    warnings: cycle.warning_count ?? 0,
    protections: cycle.protection_count ?? 0,
    voltage: cycle.voltage_avg ?? null,
    current: cycle.current_avg ?? null,
  }));
  const formatCycleLabel = (value) => `#${value}`;

  // Get previous cycle for comparison
  const currentIndex = cycles.findIndex(c => c.cycle_number === selectedCycleId);
  const previousCycle = currentIndex > 0 ? cycles[currentIndex - 1] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      <aside className="w-full md:w-72 bg-white/90 text-slate-900 border-r border-slate-200 backdrop-blur-lg h-screen overflow-y-auto sticky top-0 dark:bg-slate-900/70 dark:text-slate-100 dark:border-slate-800">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-300 mb-4">
            <ArrowLeft size={16} className="mr-2" /> Back
          </Link>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">Cycle History</h2>
          <p className="text-xs text-slate-500 dark:text-slate-500">IMEI: {imei}</p>
          <p className="text-xs text-slate-500 mt-1 dark:text-slate-500">
            Showing {filteredCycles.length} of {cycleList?.count ?? cycles.length} cycles
          </p>
          
          {/* Export All Cycles Button */}
          {filteredCycles.length > 0 && (
            <button
              onClick={exportAllCyclesToCSV}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
              title={`Export ${filteredCycles.length} cycle(s) to CSV`}
            >
              <Download size={14} />
              Export All ({filteredCycles.length}) to CSV
            </button>
          )}
          
          <p className="text-xs text-slate-400 dark:text-slate-600 mt-2 flex items-center gap-1">
            <Info size={12} />
            Use ← → keys to navigate
          </p>
          
          {/* Search Input */}
          <div className="mt-4 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search cycles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Filters Section */}
          <div className="mt-4 space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Filter size={16} />
              <span>Filters</span>
            </div>

            {/* Time Period Filter */}
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Time Period</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            {/* Cycle Number Range Filter */}
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Cycle Number Range</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    placeholder={`Min (${minAvailableCycle})`}
                    value={minCycleNumber}
                    onChange={(e) => setMinCycleNumber(e.target.value)}
                    min={minAvailableCycle}
                    max={maxAvailableCycle}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder={`Max (${maxAvailableCycle})`}
                    value={maxCycleNumber}
                    onChange={(e) => setMaxCycleNumber(e.target.value)}
                    min={minAvailableCycle}
                    max={maxAvailableCycle}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Cycle Duration (hours)</label>
              
              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-3 gap-1 mb-2">
                <button
                  onClick={() => {
                    setMinDuration('');
                    setMaxDuration('1');
                  }}
                  className="px-2 py-1 text-xs rounded border border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  &lt; 1h
                </button>
                <button
                  onClick={() => {
                    setMinDuration('1');
                    setMaxDuration('24');
                  }}
                  className="px-2 py-1 text-xs rounded border border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  1-24h
                </button>
                <button
                  onClick={() => {
                    setMinDuration('24');
                    setMaxDuration('');
                  }}
                  className="px-2 py-1 text-xs rounded border border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  24h+
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={`Min (${minAvailableDuration.toFixed(1)})`}
                    value={minDuration}
                    onChange={(e) => setMinDuration(e.target.value)}
                    min={0}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={`Max (${maxAvailableDuration.toFixed(1)})`}
                    value={maxDuration}
                    onChange={(e) => setMaxDuration(e.target.value)}
                    min={0}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Filter by cycle duration
              </p>
            </div>

            {/* Clear Filters Button */}
            {(timeFilter !== 'all' || minCycleNumber || maxCycleNumber || minDuration || maxDuration || searchQuery) && (
              <button
                onClick={() => {
                  setTimeFilter('all');
                  setMinCycleNumber('');
                  setMaxCycleNumber('');
                  setMinDuration('');
                  setMaxDuration('');
                  setSearchQuery('');
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={14} />
                Clear All Filters
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          {filteredCycles.length === 0 ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
              No cycles found
            </div>
          ) : (
            filteredCycles.map((cycle) => {
            const isSelected = selectedCycleId === cycle.cycle_number;
            return (
            <button
              key={cycle.cycle_number}
              onClick={() => {
                // Toggle: if already selected, deselect; otherwise select
                setSelectedCycleId(isSelected ? null : cycle.cycle_number);
              }}
                className={`p-4 text-left border-b border-slate-200 transition-colors dark:border-slate-800 ${
                  isSelected ? 'bg-sky-50 border-l-4 border-l-sky-400 text-slate-900 dark:bg-sky-500/10 dark:text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Cycle #{cycle.cycle_number}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(cycle.cycle_start_time).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {cycle.cycle_duration_hours?.toFixed(1)}h
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Activity size={14} className="text-sky-500 dark:text-sky-400" />
                  Avg Temp {cycle.average_temperature?.toFixed(1)}°C
              </div>
            </button>
            );
          }))}
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="space-y-8">
          {/* ========== CYCLE-SPECIFIC INFORMATION (TOP) ========== */}
          {selectedCycleId && (
            detailsLoading || !cycleDetails ? (
              <div className="p-10">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
            
            {/* Cycle Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-slate-500 text-sm dark:text-slate-400">Battery IMEI • {imei}</p>
                  {dataUpdatedAt && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <RefreshCw size={12} />
                      Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">Cycle #{cycleDetails.cycle_number}</h1>
                <p className="text-slate-500 text-sm dark:text-slate-400">
                  {new Date(cycleDetails.cycle_start_time).toLocaleString()} — {new Date(cycleDetails.cycle_end_time).toLocaleString()}
                </p>
                
                {/* Anomaly Indicators */}
                {(() => {
                  const anomalies = detectAnomalies(cycleDetails);
                  if (anomalies.length > 0) {
                    return (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {anomalies.map((anomaly, idx) => (
                          <span
                            key={idx}
                            className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                              anomaly.type === 'critical' 
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                : anomaly.type === 'warning'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}
                          >
                            <AlertTriangle size={12} />
                            {anomaly.message}
                          </span>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <button
                onClick={() => setSelectedCycleId(null)}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
                title="Deselect cycle and view all cycles overview"
              >
                <X size={16} />
                Deselect Cycle
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3">
                {/* Export Button */}
                <button
                  onClick={exportToCSV}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm flex items-center gap-2 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
                  title="Export cycle data to CSV"
                >
                  <Download size={14} />
                  Export CSV
                </button>
                {/* Battery Health Score */}
                {(() => {
                  const healthScore = calculateHealthScore(cycleDetails);
                  let healthColorClass = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
                  if (healthScore < 60) {
                    healthColorClass = 'bg-red-500/10 text-red-700 dark:text-red-300';
                  } else if (healthScore < 80) {
                    healthColorClass = 'bg-amber-500/10 text-amber-700 dark:text-amber-300';
                  }
                  return (
                    <span className={`px-3 py-1 rounded-full ${healthColorClass} text-sm flex items-center gap-2`}>
                      <Award size={16} /> Health: {healthScore ?? '—'}
                    </span>
                  );
                })()}
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-sm flex items-center gap-2 dark:text-emerald-300">
                  <Battery size={16} /> SOH Drop: {cycleDetails.soh_drop ?? 0}%
                </span>
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 text-sm flex items-center gap-2 dark:text-indigo-200">
                  <Clock size={16} /> {cycleDetails.cycle_duration_hours?.toFixed(2)} hrs
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative group">
                <KPICard title="Avg Voltage" value={cycleDetails.voltage_avg?.toFixed(1)} unit="V" color="orange" icon={Zap} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-slate-900 text-white text-xs rounded-lg px-2 py-1 shadow-lg max-w-xs">
                    Average voltage during the cycle. Normal range: 3.0V - 4.2V per cell.
                    <div className="absolute -bottom-1 right-4 w-2 h-2 bg-slate-900 rotate-45"></div>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <KPICard title="Avg Temp" value={cycleDetails.average_temperature?.toFixed(1)} unit="°C" color="red" icon={Thermometer} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="bg-slate-900 text-white text-xs rounded-lg px-2 py-1 shadow-lg max-w-xs">
                    Average battery temperature. Optimal: 20-30°C. High temps reduce battery life.
                    <div className="absolute -bottom-1 right-4 w-2 h-2 bg-slate-900 rotate-45"></div>
                  </div>
                </div>
              </div>
              <KPICard title="Max Speed" value={cycleDetails.max_speed} unit="km/h" color="green" icon={Navigation} />
              <KPICard title="Distance" value={cycleDetails.total_distance?.toFixed(1)} unit="km" color="blue" icon={Car} />
            </div>

            {/* Cycle Stats - Moved up for better visibility */}
            <div className="rounded-2xl border p-6 bg-white shadow-sm text-slate-900 border-slate-200 dark:bg-slate-900/70 dark:border-slate-800 dark:text-white backdrop-blur">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <Clock size={18} className="mr-2 text-purple-500 dark:text-purple-300" /> Cycle Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                <div className="bg-slate-50 rounded-xl p-3 text-slate-900 border border-slate-200 dark:bg-slate-800/70 dark:text-white dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400">Cycle Number</p>
                  <p className="font-mono font-semibold">{cycleDetails.cycle_number}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-slate-900 border border-slate-200 dark:bg-slate-800/70 dark:text-white dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400">Data Points</p>
                  <p className="font-mono font-semibold">{cycleDetails.data_points_count?.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-slate-900 border border-slate-200 dark:bg-slate-800/70 dark:text-white dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400">Start Time</p>
                  <p className="font-mono text-xs">{new Date(cycleDetails.cycle_start_time).toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-slate-900 border border-slate-200 dark:bg-slate-800/70 dark:text-white dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400">End Time</p>
                  <p className="font-mono text-xs">{new Date(cycleDetails.cycle_end_time).toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-slate-900 border border-slate-200 dark:bg-slate-800/70 dark:text-white dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400">Duration</p>
                  <p className="font-mono font-semibold">{cycleDetails.cycle_duration_hours?.toFixed(2)} hrs</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-slate-900 border border-slate-200 dark:bg-slate-800/70 dark:text-white dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400">SOH Drop</p>
                  <p className="font-mono font-semibold">{cycleDetails.soh_drop ?? 0}%</p>
                </div>
              </div>
            </div>

            {/* Cycle Comparison & Performance - Cycle Specific */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cycle Comparison */}
              {previousCycle && (
                <div className="rounded-2xl border p-6 bg-white shadow-sm text-slate-900 border-slate-200 dark:bg-slate-900/70 dark:border-slate-800 dark:text-white backdrop-blur">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                    <BarChart3 size={18} className="mr-2 text-purple-500 dark:text-purple-300" /> vs Previous Cycle
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">SOH Drop</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-900 dark:text-white">
                          {previousCycle.soh_drop?.toFixed(2) ?? 0}%
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">→</span>
                        <span className={`font-mono ${(cycleDetails.soh_drop ?? 0) > (previousCycle.soh_drop ?? 0) ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {cycleDetails.soh_drop?.toFixed(2) ?? 0}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Avg Temp</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-900 dark:text-white">
                          {previousCycle.average_temperature?.toFixed(1) ?? '—'}°C
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">→</span>
                        <span className="font-mono text-slate-900 dark:text-white">
                          {cycleDetails.average_temperature?.toFixed(1) ?? '—'}°C
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Distance</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-900 dark:text-white">
                          {previousCycle.total_distance?.toFixed(1) ?? '—'} km
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">→</span>
                        <span className="font-mono text-slate-900 dark:text-white">
                          {cycleDetails.total_distance?.toFixed(1) ?? '—'} km
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Previous: Cycle #{previousCycle.cycle_number}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance */}
              <div className="rounded-2xl border p-6 bg-white shadow-sm text-slate-900 border-slate-200 dark:bg-slate-900/70 dark:border-slate-800 dark:text-white backdrop-blur">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <Car size={18} className="mr-2 text-sky-500 dark:text-sky-300" /> Performance
                  </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 rounded-xl p-3 text-slate-900 border border-slate-200 dark:bg-slate-800/70 dark:text-white dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">Avg Speed</p>
                    <p className="font-mono">{cycleDetails.average_speed ?? '—'} km/h</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-slate-900 border border-slate-200 dark:bg-slate-800/70 dark:text-white dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">Data Points</p>
                    <p className="font-mono">{cycleDetails.data_points_count?.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-slate-900 border border-slate-200 dark:bg-slate-800/70 dark:text-white dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">Warnings</p>
                    <p className="font-mono">{cycleDetails.warning_count ?? 0}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-slate-900 border border-slate-200 dark:bg-slate-800/70 dark:text-white dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">Protections</p>
                    <p className="font-mono">{cycleDetails.protection_count ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>
              </div>
            )
          )}

          {/* ========== GENERALIZED INFORMATION (ALL CYCLES) ========== */}
          
          {/* Section Divider - only show if cycle is selected */}
          {selectedCycleId && (
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-slate-50 dark:bg-slate-900 px-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  All Cycles Overview
                </span>
              </div>
            </div>
          )}

          {/* Header for All Cycles Overview when no cycle is selected */}
          {!selectedCycleId && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">All Cycles Overview</h1>
              <p className="text-slate-500 text-sm dark:text-slate-400">Battery IMEI • {imei}</p>
            </div>
          )}

            {/* Quick Stats Summary - Aggregate for all cycles */}
            {aggregateStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-slate-900/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Cycles</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{aggregateStats.totalCycles}</p>
                </div>
                <div className="bg-white dark:bg-slate-900/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Avg SOH</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{aggregateStats.avgSOH.toFixed(1)}%</p>
                </div>
                <div className="bg-white dark:bg-slate-900/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Distance</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{aggregateStats.totalDistance.toFixed(0)} km</p>
                </div>
                <div className="bg-white dark:bg-slate-900/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Avg Temp</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{aggregateStats.avgTemp.toFixed(1)}°C</p>
                    </div>
                <div className="bg-white dark:bg-slate-900/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Warnings</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{aggregateStats.totalWarnings}</p>
                        </div>
                <div className="bg-white dark:bg-slate-900/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Protections</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{aggregateStats.totalProtections}</p>
                        </div>
                    </div>
                  )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl border p-6 bg-white shadow-sm text-slate-900 border-slate-200 dark:bg-slate-900/70 dark:border-slate-800 dark:text-white backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-sky-500 dark:text-sky-300" size={18} />
                    <h3 className="font-semibold text-slate-900 dark:text-white">Long-term Trends (SOC vs Temp)</h3>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Across {filteredCycles.length} cycles</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
                      <XAxis 
                        dataKey="cycle" 
                        tickFormatter={formatCycleLabel} 
                        className="text-slate-600 dark:text-slate-400"
                        stroke="currentColor"
                      />
                      <YAxis 
                        className="text-slate-600 dark:text-slate-400"
                        stroke="currentColor"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'var(--tooltip-bg)', 
                          border: '1px solid var(--tooltip-border)',
                          color: 'var(--tooltip-text)',
                          borderRadius: '8px'
                        }} 
                        className="dark:text-white"
                      />
                      <Legend wrapperStyle={{ color: 'var(--legend-text)' }} />
                      <Line type="monotone" dataKey="soc" name="Avg SOC" stroke="#38bdf8" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="temp" name="Avg Temp" stroke="#f97316" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border p-6 bg-white shadow-sm text-slate-900 border-slate-200 dark:bg-slate-900/70 dark:border-slate-800 dark:text-white backdrop-blur">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <TrendingUp size={18} className="mr-2 text-emerald-500 dark:text-emerald-300" /> SOH / Protections
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
                      <XAxis 
                        dataKey="cycle" 
                        tickFormatter={formatCycleLabel} 
                        className="text-slate-600 dark:text-slate-400"
                        stroke="currentColor"
                      />
                      <YAxis 
                        className="text-slate-600 dark:text-slate-400"
                        stroke="currentColor"
                        domain={[0, 110]} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'var(--tooltip-bg)', 
                          border: '1px solid var(--tooltip-border)',
                          color: 'var(--tooltip-text)',
                          borderRadius: '8px'
                        }} 
                        className="dark:text-white"
                      />
                      <Legend wrapperStyle={{ color: 'var(--legend-text)' }} />
                      <Line type="monotone" dataKey="soh_avg" name="Avg SOH (%)" stroke="#a855f7" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="soh_drop" name="SOH Drop (%)" stroke="#f97316" strokeWidth={2} dot={false} />
                      <Bar dataKey="protections" name="Protections" fill="#ef4444" radius={[6,6,0,0]} />
                      <Bar dataKey="warnings" name="Warnings" fill="#f59e0b" radius={[6,6,0,0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Voltage & Current Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border p-6 bg-white shadow-sm text-slate-900 border-slate-200 dark:bg-slate-900/70 dark:border-slate-800 dark:text-white backdrop-blur">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <Zap size={18} className="mr-2 text-amber-500 dark:text-amber-300" /> Voltage & Current Trends
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trendData.filter(d => d.voltage !== null || d.current !== null)}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
                      <XAxis 
                        dataKey="cycle" 
                        tickFormatter={formatCycleLabel} 
                        className="text-slate-600 dark:text-slate-400"
                        stroke="currentColor"
                      />
                      <YAxis 
                        yAxisId="left"
                        label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }}
                        className="text-slate-600 dark:text-slate-400"
                        stroke="currentColor"
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        label={{ value: 'Current (A)', angle: 90, position: 'insideRight' }}
                        className="text-slate-600 dark:text-slate-400"
                        stroke="currentColor"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'var(--tooltip-bg)', 
                          border: '1px solid var(--tooltip-border)',
                          color: 'var(--tooltip-text)',
                          borderRadius: '8px'
                        }} 
                        className="dark:text-white"
                      />
                      <Legend wrapperStyle={{ color: 'var(--legend-text)' }} />
                      <Line yAxisId="left" type="monotone" dataKey="voltage" name="Voltage (V)" stroke="#f97316" strokeWidth={2} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="current" name="Current (A)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                </div>

              <div className="rounded-2xl border p-6 bg-white shadow-sm text-slate-900 border-slate-200 dark:bg-slate-900/70 dark:border-slate-800 dark:text-white backdrop-blur">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <Car size={18} className="mr-2 text-sky-500 dark:text-sky-300" /> Distance & Speed
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData.filter(d => d.distance !== null || d.speed !== null)}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
                      <XAxis 
                        dataKey="cycle" 
                        tickFormatter={formatCycleLabel} 
                        className="text-slate-600 dark:text-slate-400"
                        stroke="currentColor"
                      />
                      <YAxis 
                        className="text-slate-600 dark:text-slate-400"
                        stroke="currentColor"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'var(--tooltip-bg)', 
                          border: '1px solid var(--tooltip-border)',
                          color: 'var(--tooltip-text)',
                          borderRadius: '8px'
                        }} 
                        className="dark:text-white"
                      />
                      <Legend wrapperStyle={{ color: 'var(--legend-text)' }} />
                      <Bar dataKey="distance" name="Distance (km)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="speed" name="Avg Speed (km/h)" fill="#22c55e" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
      </main>
    </div>
  );
};

export default Dashboard;