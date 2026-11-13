// Validate referenced files, compile and execute all 17 specs, save review images.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vega from 'vega';
import vl from 'vega-lite';
import sharp from 'sharp';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/data-spec="([^"]+)"/g)].map(m => m[1]);
const urls = new Set();
const report = [];
fs.mkdirSync(path.join(root, 'tools/render'), {recursive:true});
for (const file of files) {
  const spec = JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
  function visit(x) {
    if (!x || typeof x !== 'object') return;
    if (typeof x.url === 'string') {
      if (!x.url.startsWith('data/')) throw Error(`Nonlocal data in ${file}: ${x.url}`);
      if (!fs.existsSync(path.join(root,x.url))) throw Error(`Missing ${x.url}`);
      urls.add(x.url);
      if (x.format?.type === 'topojson') {
        const topo=JSON.parse(fs.readFileSync(path.join(root,x.url),'utf8'));
        if (!Object.keys(topo.objects).includes(x.format.feature)) throw Error('Invalid TopoJSON object');
      }
    }
    Object.values(x).forEach(visit);
  }
  visit(spec);
  const warnings=[];
  const logger={warn: (...args)=>warnings.push(args.join(' ')), info(){},debug(){},error(...a){throw Error(a.join(' '));}};
  const compiled=vl.compile(spec,{logger}).spec;
  function absolute(x) {
    if (!x || typeof x!=='object') return;
    if(typeof x.url==='string') x.url=path.join(root,x.url);
    Object.values(x).forEach(absolute);
  }
  absolute(compiled);
  const view=new vega.View(vega.parse(compiled),{renderer:'none',logger});
  await view.runAsync();
  const svg=await view.toSVG();
  const stem=path.basename(file,'.json');
  await sharp(Buffer.from(svg)).png().toFile(path.join(root,'tools/render',stem+'.png'));
  const item={file,width:Number(svg.match(/width="([\d.]+)"/)[1]),height:Number(svg.match(/height="([\d.]+)"/)[1]),warnings};
  report.push(item); view.finalize();
  console.log(`${file}: ${item.width}×${item.height}${warnings.length?' WARN '+warnings.join('; '):' OK'}`);
}
const bytes=[...urls].reduce((n,u)=>n+fs.statSync(path.join(root,u)).size,0);
if(files.length!==17) throw Error('Expected 17 charts');
if(bytes>3_000_000) throw Error('Data over 3 MB');
fs.writeFileSync(path.join(root,'tools/render/validation.json'),JSON.stringify({charts:files.length,dataBytes:bytes,dataFiles:[...urls],report},null,2));
console.log(`PASS: ${files.length} charts; ${urls.size} data files; ${bytes} data bytes`);
if(report.some(r=>r.warnings.length)) process.exitCode=1;
