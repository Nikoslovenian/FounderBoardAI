import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { KPI, KPIDataPoint } from '../types';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine 
} from 'recharts';
import { Plus, TrendingUp, Calendar, Trash2, Edit2, Check, X, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function KPIDashboard() {
  const { kpis, addKPI, updateKPIData, updateKPITarget } = useAppContext();
  const [isAddingKPI, setIsAddingKPI] = useState(false);
  const [isAddingData, setIsAddingData] = useState<string | null>(null);
  const [isEditingTarget, setIsEditingTarget] = useState<string | null>(null);
  
  const [newKPI, setNewKPI] = useState({
    name: '',
    unit: '',
    chartType: 'line' as 'line' | 'bar' | 'area',
    color: '#10b981',
    target: ''
  });

  const [newDataPoint, setNewDataPoint] = useState({
    date: new Date().toISOString().split('T')[0],
    value: ''
  });

  const [newTargetValue, setNewTargetValue] = useState('');

  const handleAddKPI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKPI.name) return;

    const kpi: KPI = {
      id: Date.now().toString(),
      name: newKPI.name,
      unit: newKPI.unit,
      chartType: newKPI.chartType,
      color: newKPI.color,
      target: newKPI.target ? parseFloat(newKPI.target) : undefined,
      data: []
    };

    addKPI(kpi);
    setIsAddingKPI(false);
    setNewKPI({ name: '', unit: '', chartType: 'line', color: '#10b981', target: '' });
  };

  const handleAddDataPoint = (kpiId: string) => {
    if (newDataPoint.value === '') return;

    updateKPIData(kpiId, {
      date: newDataPoint.date,
      value: parseFloat(newDataPoint.value)
    });

    setIsAddingData(null);
    setNewDataPoint({ date: new Date().toISOString().split('T')[0], value: '' });
  };

  const handleUpdateTarget = (kpiId: string) => {
    if (newTargetValue === '') return;
    updateKPITarget(kpiId, parseFloat(newTargetValue));
    setIsEditingTarget(null);
    setNewTargetValue('');
  };

  const calculateProgress = (kpi: KPI) => {
    if (!kpi.target || kpi.data.length === 0) return null;
    const lastValue = kpi.data[kpi.data.length - 1].value;
    const progress = (lastValue / kpi.target) * 100;
    return Math.min(Math.round(progress), 200); // Cap at 200% for display
  };

  const renderChart = (kpi: KPI) => {
    if (kpi.data.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-zinc-500 text-sm italic">
          No hay datos registrados aún para este KPI.
        </div>
      );
    }

    const ChartComponent = kpi.chartType === 'line' ? LineChart : kpi.chartType === 'bar' ? BarChart : AreaChart;
    const DataComponent = kpi.chartType === 'line' ? Line : kpi.chartType === 'bar' ? Bar : Area;

    return (
      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={kpi.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#71717a" 
              fontSize={10} 
              tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#71717a" fontSize={10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
              itemStyle={{ color: kpi.color }}
            />
            <Legend />
            {kpi.target !== undefined && (
              <ReferenceLine 
                y={kpi.target} 
                stroke="#f59e0b" 
                strokeDasharray="5 5" 
                label={{ position: 'right', value: `Meta: ${kpi.target}`, fill: '#f59e0b', fontSize: 10 }} 
              />
            )}
            <DataComponent 
              type="monotone" 
              dataKey="value" 
              stroke={kpi.color} 
              fill={kpi.color} 
              fillOpacity={0.2}
              name={kpi.name}
              unit={kpi.unit}
            />
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-8 overflow-y-auto h-full custom-scrollbar">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">KPI Tracking</h2>
          <p className="text-zinc-400 text-sm">Monitorea las métricas críticas de tu negocio.</p>
        </div>
        <button 
          onClick={() => setIsAddingKPI(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo KPI
        </button>
      </div>

      <AnimatePresence>
        {isAddingKPI && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 overflow-hidden"
          >
            <form onSubmit={handleAddKPI} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase">Nombre del KPI</label>
                  <input 
                    required
                    value={newKPI.name}
                    onChange={(e) => setNewKPI({...newKPI, name: e.target.value})}
                    placeholder="Ej: Ingresos Mensuales, Usuarios Activos"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase">Unidad</label>
                  <input 
                    value={newKPI.unit}
                    onChange={(e) => setNewKPI({...newKPI, unit: e.target.value})}
                    placeholder="Ej: CLP, %, Usuarios"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase">Meta (Opcional)</label>
                  <input 
                    type="number"
                    value={newKPI.target}
                    onChange={(e) => setNewKPI({...newKPI, target: e.target.value})}
                    placeholder="Ej: 10000"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase">Tipo de Gráfico</label>
                  <select 
                    value={newKPI.chartType}
                    onChange={(e) => setNewKPI({...newKPI, chartType: e.target.value as any})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="line">Línea</option>
                    <option value="bar">Barras</option>
                    <option value="area">Área</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase">Color</label>
                  <input 
                    type="color"
                    value={newKPI.color}
                    onChange={(e) => setNewKPI({...newKPI, color: e.target.value})}
                    className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-1 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAddingKPI(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl transition-colors text-sm font-medium"
                >
                  Crear KPI
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {kpis.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-800">
              <TrendingUp className="w-8 h-8 text-zinc-700" />
            </div>
            <p className="text-zinc-500">No has definido ningún KPI todavía. Comienza agregando uno arriba.</p>
          </div>
        ) : (
          kpis.map((kpi) => {
            const progress = calculateProgress(kpi);
            return (
              <motion.div 
                key={kpi.id}
                layout
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm hover:border-zinc-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{kpi.name}</h3>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">{kpi.unit || 'Sin unidad'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setIsEditingTarget(kpi.id);
                        setNewTargetValue(kpi.target?.toString() || '');
                      }}
                      className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-amber-400 transition-colors"
                      title="Definir Meta"
                    >
                      <Target className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setIsAddingData(kpi.id)}
                      className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-400 transition-colors"
                      title="Agregar dato"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isAddingData === kpi.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-end gap-3 mb-6 p-4 bg-zinc-950 rounded-xl border border-zinc-800"
                    >
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Fecha</label>
                        <input 
                          type="date"
                          value={newDataPoint.date}
                          onChange={(e) => setNewDataPoint({...newDataPoint, date: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Valor</label>
                        <input 
                          type="number"
                          value={newDataPoint.value}
                          onChange={(e) => setNewDataPoint({...newDataPoint, value: e.target.value})}
                          placeholder="0.00"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsAddingData(null)}
                          className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleAddDataPoint(kpi.id)}
                          className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {isEditingTarget === kpi.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-end gap-3 mb-6 p-4 bg-zinc-950 rounded-xl border border-zinc-800"
                    >
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Definir Meta ({kpi.unit})</label>
                        <input 
                          type="number"
                          value={newTargetValue}
                          onChange={(e) => setNewTargetValue(e.target.value)}
                          placeholder="Ej: 10000"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsEditingTarget(null)}
                          className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleUpdateTarget(kpi.id)}
                          className="p-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {progress !== null && (
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400 font-medium">Progreso hacia la meta</span>
                      <span className="text-amber-400 font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="bg-amber-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                )}

                {renderChart(kpi)}
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: kpi.color }} />
                    <span className="text-xs text-zinc-400">
                      {kpi.data.length} registros
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    {kpi.data.length > 0 && (
                      <div className="text-sm font-bold text-white">
                        Actual: {kpi.data[kpi.data.length - 1].value} {kpi.unit}
                      </div>
                    )}
                    {kpi.target && (
                      <div className="text-[10px] text-amber-500/70 font-medium">
                        Meta: {kpi.target} {kpi.unit}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
