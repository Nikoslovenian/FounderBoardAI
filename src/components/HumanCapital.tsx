import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Plus, Search, Filter, Edit2, Trash2, 
  UserPlus, Briefcase, Calendar, DollarSign, 
  CheckCircle2, XCircle, ChevronRight, Download,
  TrendingUp, BarChart3, PieChart, Activity, Upload,
  FileSpreadsheet, AlertCircle
} from 'lucide-react';
import Papa from 'papaparse';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, LineChart, Line 
} from 'recharts';
import { Employee } from '../types';

export default function HumanCapital() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, company } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [growthRate, setGrowthRate] = useState(10); // % mensual
  const [monthsToProject, setMonthsToProject] = useState(6);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'terminated'>('all');
  const [rutError, setRutError] = useState<string | null>(null);

  const validateRut = (rut: string) => {
    // Limpiar el RUT de puntos y guiones
    const cleanRut = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    if (cleanRut.length < 8) return false;

    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);

    // Validar cuerpo numérico
    if (!/^\d+$/.test(body)) return false;

    // Calcular dígito verificador
    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDv = 11 - (sum % 11);
    const dvChar = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();

    return dv === dvChar;
  };

  const formatRut = (rut: string) => {
    let value = rut.replace(/\./g, '').replace(/-/g, '');
    if (value.length <= 1) return value;
    
    let result = value.slice(-1);
    if (value.length > 1) {
      result = '-' + result;
      let body = value.slice(0, -1);
      let i = 0;
      while (body.length > 3) {
        result = '.' + body.slice(-3) + result;
        body = body.slice(0, -3);
      }
      result = body + result;
    }
    return result;
  };

  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    rut: '',
    fullName: '',
    startDate: new Date().toISOString().split('T')[0],
    contractType: 'indefinido',
    workday: 'completa',
    baseSalary: 0,
    position: '',
    status: 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRutError(null);

    if (!validateRut(formData.rut)) {
      setRutError('El RUT ingresado no es válido. Formato esperado: 12.345.678-9');
      return;
    }

    if (editingId) {
      updateEmployee(editingId, formData);
      setEditingId(null);
    } else {
      addEmployee({
        ...formData,
        id: Date.now().toString()
      });
      setIsAdding(false);
    }
    setFormData({
      rut: '',
      fullName: '',
      startDate: new Date().toISOString().split('T')[0],
      contractType: 'indefinido',
      workday: 'completa',
      baseSalary: 0,
      position: '',
      status: 'active'
    });
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      rut: employee.rut,
      fullName: employee.fullName,
      startDate: employee.startDate,
      contractType: employee.contractType,
      workday: employee.workday,
      baseSalary: employee.baseSalary,
      position: employee.position,
      status: employee.status
    });
    setEditingId(employee.id);
    setIsAdding(true);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         emp.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = employees.filter(e => e.status === 'active').length;
  const totalPayroll = employees.reduce((sum, e) => sum + (e.status === 'active' ? e.baseSalary : 0), 0);

  const exportToCSV = () => {
    if (filteredEmployees.length === 0) return;

    const headers = ['Nombre Completo', 'RUT', 'Cargo', 'Sueldo Base', 'Fecha Inicio', 'Tipo Contrato', 'Jornada', 'Estado'];
    const rows = filteredEmployees.map(emp => [
      emp.fullName,
      emp.rut,
      emp.position,
      emp.baseSalary,
      emp.startDate,
      emp.contractType,
      emp.workday,
      emp.status === 'active' ? 'Activo' : 'Finiquitado'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `capital_humano_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const newEmployees: Employee[] = results.data.map((row: any, index) => {
            // Mapeo de códigos LRE o nombres comunes
            const rut = row['1101'] || row['RUT'] || row['Rut'] || '';
            const fullName = row['Nombre Completo'] || 
                            `${row['Nombre'] || ''} ${row['Apellido Paterno'] || ''} ${row['Apellido Materno'] || ''}`.trim() || 
                            'Empleado Importado';
            const startDateRaw = row['1102'] || row['Fecha Inicio'] || row['Fecha de Inicio'] || new Date().toISOString().split('T')[0];
            
            // Convertir fecha dd/mm/aaaa a aaaa-mm-dd si es necesario
            let startDate = startDateRaw;
            if (startDateRaw.includes('/')) {
              const [d, m, y] = startDateRaw.split('/');
              startDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }

            const baseSalary = parseInt((row['2101'] || row['Sueldo Base'] || row['Sueldo'] || '0').toString().replace(/[^0-9]/g, ''));
            const position = row['Cargo'] || row['Posición'] || 'Sin Cargo';
            
            // Tipo de jornada (101 = completa, 201 = parcial)
            const workdayRaw = row['1107'] || row['Jornada'] || '101';
            const workday = (workdayRaw === '201' || workdayRaw.toLowerCase().includes('parcial')) ? 'parcial' : 'completa';

            // Estado (1103 es fecha de término)
            const endDate = row['1103'] || row['Fecha Término'] || '';
            const status = endDate ? 'terminated' : 'active';

            return {
              id: `${Date.now()}-${index}`,
              rut: formatRut(rut),
              fullName,
              startDate,
              contractType: 'indefinido' as const,
              workday: workday as 'completa' | 'parcial',
              baseSalary,
              position,
              status: status as 'active' | 'terminated'
            };
          }).filter(emp => emp.rut && emp.rut.length > 5);

          if (newEmployees.length === 0) {
            throw new Error('No se encontraron datos válidos en el archivo.');
          }

          newEmployees.forEach(emp => addEmployee(emp));
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
          setUploadError(err.message || 'Error al procesar el archivo.');
          setIsUploading(false);
        }
      },
      error: (error) => {
        setUploadError(`Error de lectura: ${error.message}`);
        setIsUploading(false);
      }
    });
  };

  const getSimulationData = () => {
    const currentRevenue = parseInt(company?.onboardingData?.data.revenue.replace(/[^0-9]/g, '') || '0');
    const basePayroll = totalPayroll;
    const markup = 1.35; // Factor de costo empresa real (35% extra)
    const realPayroll = basePayroll * markup;
    
    const data = [];
    for (let i = 0; i <= monthsToProject; i++) {
      const projectedRevenue = currentRevenue * Math.pow(1 + (growthRate / 100), i);
      // Asumimos que el equipo crece proporcionalmente a los ingresos pero con un lag
      const projectedPayroll = realPayroll * Math.pow(1 + (growthRate / 150), i); 
      
      data.push({
        month: i === 0 ? 'Actual' : `Mes ${i}`,
        Ingresos: Math.round(projectedRevenue),
        'Costo Laboral Real': Math.round(projectedPayroll),
        Margen: Math.round(projectedRevenue - projectedPayroll)
      });
    }
    return data;
  };

  const simulationData = getSimulationData();

  return (
    <div className="h-full flex flex-col bg-zinc-950 overflow-hidden">
      <div className="p-8 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-emerald-500" />
              Capital Humano
            </h1>
            <p className="text-zinc-400 max-w-2xl">
              Gestión de contrataciones y registro laboral electrónico. Mantén al día la información de tu equipo para un análisis estratégico de tu estructura de costos y talento.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              disabled={filteredEmployees.length === 0}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all border border-zinc-700"
            >
              <Download className="w-5 h-5" />
              Exportar CSV
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-semibold transition-all border border-zinc-700"
            >
              <Upload className="w-5 h-5" />
              Cargar LRE
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".csv,.txt" 
              className="hidden" 
            />
            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all border ${
                showSimulator 
                  ? 'bg-purple-600 border-purple-500 text-white' 
                  : 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700'
              }`}
            >
              <Activity className="w-5 h-5" />
              {showSimulator ? 'Ver Lista' : 'Simulador'}
            </button>
            <button
              onClick={() => {
                setIsAdding(true);
                setEditingId(null);
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-900/20"
            >
              <UserPlus className="w-5 h-5" />
              Contratar Nuevo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-3 text-zinc-400 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">Dotación Activa</span>
            </div>
            <div className="text-3xl font-bold text-white">{activeCount} Colaboradores</div>
          </div>
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-3 text-zinc-400 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">Payroll Mensual Base</span>
            </div>
            <div className="text-3xl font-bold text-emerald-400">
              ${totalPayroll.toLocaleString('es-CL')}
            </div>
          </div>
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-3 text-zinc-400 mb-2">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">Costo Promedio</span>
            </div>
            <div className="text-3xl font-bold text-white">
              ${activeCount > 0 ? Math.round(totalPayroll / activeCount).toLocaleString('es-CL') : 0}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {uploadError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500"
          >
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{uploadError}</p>
            <button onClick={() => setUploadError(null)} className="ml-auto text-xs underline">Cerrar</button>
          </motion.div>
        )}
        {showSimulator ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-white">Proyección de Costos vs Ingresos</h2>
                    <p className="text-sm text-zinc-500">Simulación basada en crecimiento mensual y costo empresa real (1.35x base)</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-xs text-zinc-400">Ingresos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <span className="text-xs text-zinc-400">Costo Laboral</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={simulationData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        stroke="#71717a" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#71717a" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '12px' }}
                        formatter={(value: number) => [`$${value.toLocaleString('es-CL')}`, '']}
                      />
                      <Area type="monotone" dataKey="Ingresos" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                      <Area type="monotone" dataKey="Costo Laboral Real" stroke="#f43f5e" fillOpacity={1} fill="url(#colorCost)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                  <h3 className="text-lg font-bold text-white mb-6">Variables de Simulación</h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium text-zinc-400">Crecimiento Mensual</label>
                        <span className="text-sm font-bold text-emerald-500">{growthRate}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="50" 
                        value={growthRate}
                        onChange={(e) => setGrowthRate(parseInt(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium text-zinc-400">Meses a Proyectar</label>
                        <span className="text-sm font-bold text-purple-500">{monthsToProject} meses</span>
                      </div>
                      <input 
                        type="range" 
                        min="3" 
                        max="24" 
                        value={monthsToProject}
                        onChange={(e) => setMonthsToProject(parseInt(e.target.value))}
                        className="w-full accent-purple-500"
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-zinc-800 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500">Margen Final Proyectado</span>
                      <span className="text-lg font-bold text-white">
                        ${simulationData[simulationData.length - 1].Margen.toLocaleString('es-CL')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500">Eficiencia de Nómina</span>
                      <span className="text-sm font-bold text-emerald-500">
                        {Math.round((simulationData[simulationData.length - 1]['Costo Laboral Real'] / simulationData[simulationData.length - 1].Ingresos) * 100)}% de ingresos
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-8">
                  <h4 className="text-sm font-bold text-emerald-500 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Análisis de la IA
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Con un crecimiento del {growthRate}%, tu estructura de costos se mantiene saludable. 
                    El "Costo Empresa Real" proyectado incluye gratificaciones y leyes sociales. 
                    Considera que superar el 40% de ingresos en payroll podría comprometer tu flujo de caja en etapas de escala.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, RUT o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'terminated'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  filterStatus === status 
                    ? 'bg-emerald-600 border-emerald-500 text-white' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {status === 'all' ? 'Todos' : status === 'active' ? 'Activos' : 'Finiquitados'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredEmployees.map((emp) => (
              <motion.div
                key={emp.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all group"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {emp.fullName}
                        {emp.status === 'active' ? (
                          <span className="bg-emerald-500/10 text-emerald-500 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full">Activo</span>
                        ) : (
                          <span className="bg-zinc-800 text-zinc-500 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full">Finiquitado</span>
                        )}
                      </h3>
                      <p className="text-sm text-zinc-400 flex items-center gap-2">
                        <span className="font-mono">{emp.rut}</span>
                        <span className="text-zinc-600">•</span>
                        <span>{emp.position}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 md:flex-none">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Contrato</p>
                      <p className="text-sm text-zinc-200 capitalize">{emp.contractType.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Jornada</p>
                      <p className="text-sm text-zinc-200 capitalize">{emp.workday}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Sueldo Base</p>
                      <p className="text-sm text-emerald-400 font-semibold">${emp.baseSalary.toLocaleString('es-CL')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Ingreso</p>
                      <p className="text-sm text-zinc-200">{new Date(emp.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('¿Estás seguro de eliminar este registro?')) {
                          deleteEmployee(emp.id);
                        }
                      }}
                      className="p-2 hover:bg-rose-500/10 rounded-lg text-zinc-400 hover:text-rose-500 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
              <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-zinc-400">No se encontraron colaboradores</h3>
              <p className="text-zinc-500">Ajusta los filtros o agrega una nueva contratación.</p>
            </div>
          )}
        </div>
      </>
      )}
    </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <UserPlus className="w-6 h-6 text-emerald-500" />
                  {editingId ? 'Editar Contratación' : 'Nueva Contratación'}
                </h2>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Nombre Completo</label>
                    <input
                      required
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">RUT</label>
                    <input
                      required
                      type="text"
                      value={formData.rut}
                      onChange={(e) => {
                        const formatted = formatRut(e.target.value);
                        setFormData({ ...formData, rut: formatted });
                        if (rutError) setRutError(null);
                      }}
                      className={`w-full bg-zinc-950 border ${rutError ? 'border-rose-500' : 'border-zinc-800'} rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all`}
                      placeholder="12.345.678-9"
                    />
                    {rutError && (
                      <p className="text-xs text-rose-500 mt-1">{rutError}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Cargo / Función</label>
                    <input
                      required
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                      placeholder="Ej: Desarrollador Senior"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Sueldo Base Mensual</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        required
                        type="number"
                        value={formData.baseSalary}
                        onChange={(e) => setFormData({ ...formData, baseSalary: parseInt(e.target.value) })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Fecha de Inicio</label>
                    <input
                      required
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Tipo de Contrato</label>
                    <select
                      value={formData.contractType}
                      onChange={(e) => setFormData({ ...formData, contractType: e.target.value as any })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                    >
                      <option value="indefinido">Indefinido</option>
                      <option value="plazo_fijo">Plazo Fijo</option>
                      <option value="obra_faena">Por Obra o Faena</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Jornada</label>
                    <select
                      value={formData.workday}
                      onChange={(e) => setFormData({ ...formData, workday: e.target.value as any })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                    >
                      <option value="completa">Completa</option>
                      <option value="parcial">Parcial</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Estado</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                    >
                      <option value="active">Activo</option>
                      <option value="terminated">Finiquitado</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-6 py-4 rounded-xl font-semibold text-zinc-400 hover:bg-zinc-800 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-900/20"
                  >
                    {editingId ? 'Guardar Cambios' : 'Registrar Contratación'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
