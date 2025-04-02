@@ -0,0 +1,106 @@
 import { SystemInfoData } from '../types';
 import { Cpu, Server, Hash, Monitor, Gauge } from 'lucide-react';
 
 interface SystemInfoProps {
   info: SystemInfoData | null;
   isConnected: boolean;
 }
 
 export function SystemInfo({ info, isConnected }: SystemInfoProps) {
   if (!info) return null;
 
   return (
     <div className="bg-white rounded-lg shadow p-6 mb-8">
       <div className="flex items-center justify-between mb-4">
         <h2 className="text-xl font-semibold">System Information</h2>
         <div className="flex items-center gap-2">
           <span className="text-sm">Status:</span>
           <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
           <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
         </div>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
         <div className="flex items-center gap-3">
           <Cpu className="w-5 h-5 text-indigo-600" />
           <div>
             <p className="text-sm text-gray-500">CPU Cores</p>
             <p className="font-semibold">{info.cpuCores}</p>
           </div>
         </div>
         <div className="flex items-center gap-3">
           <Server className="w-5 h-5 text-indigo-600" />
           <div>
             <p className="text-sm text-gray-500">Platform</p>
             <p className="font-semibold">{info.platform}</p>
           </div>
         </div>
         <div className="flex items-center gap-3">
           <Monitor className="w-5 h-5 text-indigo-600" />
           <div>
             <p className="text-sm text-gray-500">Hostname</p>
             <p className="font-semibold">{info.hostname}</p>
           </div>
         </div>
         <div className="flex items-center gap-3">
           <Hash className="w-5 h-5 text-indigo-600" />
           <div>
             <p className="text-sm text-gray-500">Architecture</p>
             <p className="font-semibold">{info.arch}</p>
           </div>
         </div>
       </div>
       
       <div className="border-t pt-4">
         <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
           <Gauge className="w-5 h-5 text-indigo-600" />
           GPU Information
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {info.gpus.map((gpu, index) => (
             <div key={index} className="bg-gray-50 rounded-lg p-4">
               <div className="flex justify-between items-start mb-2">
                 <h4 className="font-medium">{gpu.name}</h4>
                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                   gpu.type === 'dedicated' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                 }`}>
                   {gpu.type}
                 </span>
               </div>
               <div className="space-y-2">
                 <p className="text-sm text-gray-600">
                   Vendor: {gpu.vendor}
                 </p>
                 <p className="text-sm text-gray-600">
                   Memory: {(gpu.memoryUsed / 1024).toFixed(2)}GB / {(gpu.memoryTotal / 1024).toFixed(2)}GB
                 </p>
                 {gpu.temperature && (
                   <p className="text-sm text-gray-600">
                     Temperature: {gpu.temperature}°C
                   </p>
                 )}
                 <p className="text-sm text-gray-600">
                   Usage: {gpu.usage.toFixed(1)}%
                 </p>
                 {gpu.fanSpeed && (
                   <p className="text-sm text-gray-600">
                     Fan Speed: {gpu.fanSpeed}%
                   </p>
                 )}
                 {gpu.clockCore && (
                   <p className="text-sm text-gray-600">
                     Core Clock: {gpu.clockCore}MHz
                   </p>
                 )}
                 {gpu.clockMemory && (
                   <p className="text-sm text-gray-600">
                     Memory Clock: {gpu.clockMemory}MHz
                   </p>
                 )}
               </div>
             </div>
           ))}
         </div>
       </div>
     </div>
   );
 }
