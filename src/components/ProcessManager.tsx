@@ -0,0 +1,213 @@
 import { useState } from 'react';
 import { ProcessInfo } from '../types';
 import { Search, AlertTriangle, Terminal, User, Clock } from 'lucide-react';
 
 interface ProcessManagerProps {
   processes: ProcessInfo[];
   onKillProcess: (pid: number) => void;
   cpuThreshold: number;
   memoryThreshold: number;
 }
 
 export function ProcessManager({ processes, onKillProcess, cpuThreshold, memoryThreshold }: ProcessManagerProps) {
   const [searchTerm, setSearchTerm] = useState('');
   const [sortField, setSortField] = useState<keyof ProcessInfo>('cpu');
   const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
   const [selectedProcess, setSelectedProcess] = useState<ProcessInfo | null>(null);
 
   const filteredProcesses = processes
     .filter(process => 
       process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       process.pid.toString().includes(searchTerm) ||
       process.user?.toLowerCase().includes(searchTerm.toLowerCase())
     )
     .sort((a, b) => {
       const aValue = a[sortField];
       const bValue = b[sortField];
       
       // Ensure the values are defined
       if (aValue === undefined || bValue === undefined) {
         return 0; 
       }
 
       return sortDirection === 'asc' 
         ? (aValue > bValue ? 1 : -1)
         : (aValue < bValue ? 1 : -1);
     });
 
   const handleSort = (field: keyof ProcessInfo) => {
     if (field === sortField) {
       setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
     } else {
       setSortField(field);
       setSortDirection('desc');
     }
   };
 
   const isProcessCritical = (process: ProcessInfo) => 
     process.cpu > cpuThreshold || process.memory > memoryThreshold;
 
   const formatUptime = (uptime: number) => {
     const seconds = Math.floor(uptime / 1000);
     const minutes = Math.floor(seconds / 60);
     const hours = Math.floor(minutes / 60);
     const days = Math.floor(hours / 24);
 
     if (days > 0) return `${days}d ${hours % 24}h`;
     if (hours > 0) return `${hours}h ${minutes % 60}m`;
     if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
     return `${seconds}s`;
   };
 
   return (
     <div className="bg-white rounded-lg shadow p-6 mb-8">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-semibold">Process Manager</h2>
         <div className="relative">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
           <input
             type="text"
             placeholder="Search processes..."
             className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
       </div>
 
       <div className="overflow-x-auto">
         <table className="min-w-full divide-y divide-gray-200">
           <thead>
             <tr>
               <th 
                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                 onClick={() => handleSort('pid')}
               >
                 PID
               </th>
               <th 
                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                 onClick={() => handleSort('name')}
               >
                 Name
               </th>
               <th 
                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                 onClick={() => handleSort('cpu')}
               >
                 CPU %
               </th>
               <th 
                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                 onClick={() => handleSort('memory')}
               >
                 Memory %
               </th>
               <th 
                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                 onClick={() => handleSort('user')}
               >
                 User
               </th>
               <th 
                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                 onClick={() => handleSort('status')}
               >
                 Status
               </th>
               <th 
                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                 onClick={() => handleSort('uptime')}
               >
                 Uptime
               </th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 Actions
               </th>
             </tr>
           </thead>
           <tbody className="bg-white divide-y divide-gray-200">
             {filteredProcesses.map((process) => (
               <tr 
                 key={process.pid} 
                 className={`${isProcessCritical(process) ? 'bg-red-50' : ''} hover:bg-gray-50 cursor-pointer`}
                 onClick={() => setSelectedProcess(selectedProcess?.pid === process.pid ? null : process)}
               >
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   {process.pid}
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-2">
                   {process.name}
                   {isProcessCritical(process) && (
                     <AlertTriangle className="w-4 h-4 text-red-500" aria-label="High resource usage" />
                   )}
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   {process.cpu.toFixed(1)}%
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   {process.memory.toFixed(1)}%
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   {process.user || 'N/A'}
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                     process.status === 'running' ? 'bg-green-100 text-green-800' :
                     process.status === 'sleeping' ? 'bg-yellow-100 text-yellow-800' :
                     'bg-gray-100 text-gray-800'
                   }`}>
                     {process.status}
                   </span>
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   {formatUptime(process.uptime)}
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       onKillProcess(process.pid);
                     }}
                     className="text-red-600 hover:text-red-900 font-medium"
                   >
                     Terminate
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
 
       {selectedProcess && (
         <div className="mt-6 p-4 bg-gray-50 rounded-lg">
           <h3 className="text-lg font-semibold mb-4">Process Details</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex items-center gap-2">
               <Terminal className="w-4 h-4 text-gray-500" />
               <span className="text-sm text-gray-600">Command:</span>
               <span className="text-sm font-mono">{selectedProcess.command || 'N/A'}</span>
             </div>
             <div className="flex items-center gap-2">
               <User className="w-4 h-4 text-gray-500" />
               <span className="text-sm text-gray-600">User:</span>
               <span className="text-sm">{selectedProcess.user || 'N/A'}</span>
             </div>
             <div className="flex items-center gap-2">
               <Clock className="w-4 h-4 text-gray-500" />
               <span className="text-sm text-gray-600">Uptime:</span>
               <span className="text-sm">{formatUptime(selectedProcess.uptime)}</span>
             </div>
             {selectedProcess.path && (
               <div className="col-span-2 flex items-center gap-2">
                 <span className="text-sm text-gray-600">Path:</span>
                 <span className="text-sm font-mono truncate">{selectedProcess.path}</span>
               </div>
             )}
           </div>
         </div>
       )}
     </div>
   );
 }
