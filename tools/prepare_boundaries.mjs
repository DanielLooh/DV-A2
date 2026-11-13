// Usage: node tools/prepare_boundaries.mjs /path/to/abs-states.geojson
// Official source query, CC BY 4.0 credit and simplification: data/geography/BOUNDARIES.md.
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {geoArea}=require('d3-geo');
const source=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const arcs=[], geometries=[];
for(const f of source.features){
  if(!'12345678'.includes(f.properties.state_code_2021)||!f.geometry) continue;
  const polygons=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];
  const result=[];
  for(const polygon of polygons){
    const rings=[];
    for(const [index,input] of polygon.entries()){
      let ring=input;
      const planar=Math.abs(ring.slice(1).reduce((s,p,i)=>s+ring[i][0]*p[1]-p[0]*ring[i][1],0))/2;
      if(planar<0.0001) { if(index===0) break; else continue; } // Tiny islands/degenerate rings below display resolution.
      const area=geoArea({type:'Polygon',coordinates:[ring]});
      if((index===0&&area>2*Math.PI)||(index>0&&area<2*Math.PI)) ring=[...ring].reverse();
      rings.push([arcs.length]);arcs.push(ring);
    }
    if(rings.length && geoArea({type:'Polygon',coordinates:rings.map(r=>arcs[r[0]])})<1) result.push(rings);
  }
  geometries.push({type:'MultiPolygon',properties:{STATE_NAME:f.properties.state_name_2021},arcs:result});
}
if(geometries.length!==8) throw Error('Expected eight states and territories');
fs.writeFileSync(new URL('../data/geography/au_states.topojson',import.meta.url),JSON.stringify({type:'Topology',objects:{states:{type:'GeometryCollection',geometries}},arcs})+'\n');
console.log('Converted eight official ABS boundaries, object key: states');
