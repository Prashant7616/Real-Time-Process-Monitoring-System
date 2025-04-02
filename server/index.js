 import express from 'express';
 import { createServer } from 'http';
 import { Server } from 'socket.io';
 import os from 'os';
 import { exec } from 'child_process';
 import { promisify } from 'util';
 import si from 'systeminformation';
 
 const execAsync = promisify(exec);
 const app = express();
 const httpServer = createServer(app);
 const io = new Server(httpServer, {
   cors: {
     origin: "http://localhost:5173",
     methods: ["GET", "POST", "DELETE"]
   }
 });
 
 app.use((req, res, next) => {
   res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
   res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
   res.header('Access-Control-Allow-Headers', 'Content-Type');
   next();
 });
 
 async function getGPUInfo() {
   try {
     const graphics = await si.graphics();
     const gpus = await Promise.all(graphics.controllers.map(async (controller) => {
       const isIntegrated = controller.vendor.toLowerCase().includes('intel') ||
                           controller.model.toLowerCase().includes('integrated');
       
       const gpuLoad = await si.graphics();
       const currentController = gpuLoad.controllers.find(c => c.model === controller.model);
       
       return {
         name: controller.model,
         vendor: controller.vendor,
         type: isIntegrated ? 'integrated' : 'dedicated',
         memoryTotal: controller.memoryTotal || 0,
         memoryUsed: controller.memoryUsed || 0,
         temperature: currentController?.temperature,
         usage: currentController?.utilizationGpu || 0,
         fanSpeed: currentController?.fanSpeed,
         clockCore: currentController?.clockCore,
         clockMemory: currentController?.clockMemory
       };
     }));
 
     return gpus;
   } catch (error) {
     console.error('Error getting GPU information:', error);
     return [];
   }
 }
 
 async function getProcessList() {
   try {
     const processes = await si.processes();
     return processes.list
       .map(process => ({
         pid: process.pid,
         name: process.name,
         cpu: process.cpu,
         memory: process.memRss / (os.totalmem() / 100), // Convert to percentage
         status: process.state.toLowerCase(),
         uptime: process.started ? Date.now() - process.started : 0,
         command: process.command,
         path: process.path,
         user: process.user
       }))
       .sort((a, b) => b.cpu - a.cpu)
       .slice(0, 20);
   } catch (error) {
     console.error('Error getting process list:', error);
     return [];
   }
 }
 
 function getCpuUsage() {
   return new Promise((resolve) => {
     const startMeasure = os.cpus();
     
     setTimeout(() => {
       const endMeasure = os.cpus();
       const cpuPercentages = startMeasure.map((startCpu, i) => {
         const endCpu = endMeasure[i];
 
         const idleDiff = endCpu.times.idle - startCpu.times.idle;
         const totalDiff = Object.keys(endCpu.times).reduce(
           (acc, type) => acc + (endCpu.times[type] - startCpu.times[type]),
           0
         );
 
         return 100 - (100 * idleDiff) / totalDiff;
       });
 
       resolve({
         cores: cpuPercentages.length,
         usage: cpuPercentages,
         averageUsage: cpuPercentages.reduce((acc, usage) => acc + usage, 0) / cpuPercentages.length
       });
     }, 1000);
   });
 }
 
 async function getSystemMetrics() {
   const totalMemory = os.totalmem();
   const freeMemory = os.freemem();
   const usedMemory = totalMemory - freeMemory;
   const memoryUsage = {
     total: totalMemory,
     free: freeMemory,
     used: usedMemory,
     percentage: (usedMemory / totalMemory) * 100
   };
 
   const cpuData = await getCpuUsage();
   const processes = await getProcessList();
   const gpus = await getGPUInfo();
 
   const gpuMetrics = {
     usage: gpus.map(gpu => gpu.usage),
     memory: gpus.map(gpu => (gpu.memoryUsed / gpu.memoryTotal) * 100),
     temperature: gpus.map(gpu => gpu.temperature).filter(Boolean),
     fanSpeed: gpus.map(gpu => gpu.fanSpeed).filter(Boolean),
     clockCore: gpus.map(gpu => gpu.clockCore).filter(Boolean),
     clockMemory: gpus.map(gpu => gpu.clockMemory).filter(Boolean)
   };
 
   return {
     timestamp: Date.now(),
     memory: memoryUsage,
     cpu: cpuData,
     gpu: gpuMetrics,
     loadAverage: os.loadavg(),
     uptime: os.uptime(),
     processes
   };
 }
 
 app.delete('/process/:pid', async (req, res) => {
   try {
     const pid = parseInt(req.params.pid);
     if (isNaN(pid)) {
       return res.status(400).json({ error: 'Invalid PID' });
     }
 
     await si.processes.kill(pid);
     res.json({ success: true });
   } catch (error) {
     console.error('Error terminating process:', error);
     res.status(500).json({ error: 'Failed to terminate process' });
   }
 });
 
 io.on('connection', async (socket) => {
   console.log('Client connected');
 
   const gpus = await getGPUInfo();
   
   socket.emit('systemInfo', {
     cpuCores: os.cpus().length,
     platform: os.platform(),
     hostname: os.hostname(),
     arch: os.arch(),
     gpus
   });
 
   const metricsInterval = setInterval(async () => {
     const metrics = await getSystemMetrics();
     socket.emit('metrics', metrics);
   }, 1000);
 
   socket.on('disconnect', () => {
     console.log('Client disconnected');
     clearInterval(metricsInterval);
   });
 });
 
 const PORT = process.env.PORT || 3000;
 httpServer.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
 });
