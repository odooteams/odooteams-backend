import { runFullScan } from './src/lib/security/fullScan';
runFullScan('http://localhost:8080', (step, pct) => console.log(step, pct)).then(res => console.log(JSON.stringify(res, null, 2))).catch(console.error);
