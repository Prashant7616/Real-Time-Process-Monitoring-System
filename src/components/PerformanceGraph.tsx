@@ -0,0 +1,66 @@
 import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
 import { SystemMetrics } from '../types';
 
 interface PerformanceGraphProps {
   data: SystemMetrics[];
 }
export function PerformanceGraph({ data }: PerformanceGraphProps) {
   return (
     <div className="bg-white rounded-lg shadow p-6 mb-8">
       <h2 className="text-xl font-semibold mb-4">System Performance</h2>
       <div className="h-80">
         <ResponsiveContainer width="100%" height="100%">
           <LineChart data={data}>
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis 
               dataKey="timestamp" 
               tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()} 
               label={{ value: "Time", position: "insideBottomRight", offset: -5 }}
             />

             <YAxis 
               label={{ value: "Usage (%)", angle: -90, position: "insideLeft" }} 
             />
             <Tooltip 
               labelFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
               formatter={(value: number, name: string) => {
                 if (name.includes("Usage")) {
                   return [`${value.toFixed(2)}%`, name];
                 }
                 return [value, name];
               }}
             />
             <Legend />
             <Line 
               type="monotone" 
               dataKey="memory.percentage" 
               stroke="#8884d8" 
               name="Memory Usage" 
               dot={false} 
               strokeWidth={2}
                />
             <Line 
               type="monotone" 
               dataKey="cpu.averageUsage" 
               stroke="#82ca9d" 
               name="CPU Usage" 
               dot={false} 
               strokeWidth={2}
             />
             {data[0]?.gpu?.usage.map((_, index) => (
               <Line
                 key={`gpu-${index}`}
                 type="monotone"
                 dataKey={`gpu.usage[${index}]`}
                 stroke={`#${Math.floor(Math.random()*16777215).toString(16)}`}
                 name={`GPU ${index + 1} Usage`}
                 dot={false}
                 strokeWidth={2}
               />
             ))}
           </LineChart>
         </ResponsiveContainer>
          </div>
     </div>
   );
 }
     
