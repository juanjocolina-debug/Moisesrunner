import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const root = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bd6d4);
scene.fog = new THREE.Fog(0x9bd6d4, 24, 95);
const camera = new THREE.PerspectiveCamera(58, innerWidth/innerHeight, .1, 150);
camera.position.set(0,5.8,11.8);
camera.lookAt(0,1.2,-4);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;
root.insertBefore(renderer.domElement,root.firstChild);
scene.add(new THREE.HemisphereLight(0xffedcf,0x64777b,2.0));
const sun=new THREE.DirectionalLight(0xffd58a,3.0);sun.position.set(-7,13,7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);

const mat=(color,roughness=.86)=>new THREE.MeshStandardMaterial({color,roughness});
const sand=mat(0xd7b477), road=mat(0x98784f), teal=mat(0x2e7776), stone=mat(0xc8a66e), dark=mat(0x594a3b), gold=mat(0xffc83d,.45), white=mat(0xf5ead1), red=mat(0x9e3430), blue=mat(0x23536b), skin=mat(0x9c6041), hair=mat(0x251b17);
function box(w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o}
function cylinder(rt,rb,h,m,x,y,z,n=12){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,n),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o}
box(200,.4,130,sand,0,-.35,-35);
box(7,.18,120,road,0,-.08,-35);
for(const x of [-3.65,3.65])box(.18,.12,120,mat(0xe7cd93),x,.02,-35);
for(let z=8;z>-90;z-=8){for(let x of [-1,0,1])box(.08,.025,2,mat(0xe5c58b),x*2.15,.035,z-4)}
// Background dunes and pyramids
for(let i=0;i<8;i++){const x=(i%2?1:-1)*(12+Math.random()*13),z=-26-Math.floor(i/2)*17;const p=new THREE.Mesh(new THREE.ConeGeometry(5+Math.random()*3,8+Math.random()*4,4),mat(0xc69b60));p.position.set(x,3.6,z);p.rotation.y=Math.PI/4;p.scale.z=.8;scene.add(p)}
// Temple gates and columns lining the route
function templeSide(x,z){
 box(3.4,5.4,2.0,stone,x,2.7,z);
 for(let i=-1;i<=1;i++){cylinder(.47,.58,5.4,teal,x+i*1.0,2.7,z+1.22,10);cylinder(.68,.68,.45,gold,x+i*1.0,5.55,z+1.22,8)}
 box(4.6,.55,2.1,stone,x,5.85,z+1.2);
}
for(let z=-13;z>-82;z-=24){templeSide(-8,z);templeSide(8,z)}
function palm(x,z){cylinder(.18,.28,4,mat(0x86603d),x,2,z,8);for(let i=0;i<6;i++){const leaf=new THREE.Mesh(new THREE.ConeGeometry(.23,3.2,5),mat(0x477c4c));leaf.position.set(x+Math.cos(i*Math.PI/3)*1.1,4.3+Math.sin(i*.9)*.2,z+Math.sin(i*Math.PI/3)*1.1);leaf.rotation.z=Math.PI/2-Math.cos(i*Math.PI/3)*.5;leaf.rotation.x=Math.sin(i*Math.PI/3)*.55;scene.add(leaf)}}
for(let z=-8;z>-90;z-=19){palm(-10,z);palm(10,z-8)}
// Moses character, viewed from behind
const moses=new THREE.Group();scene.add(moses);
const robe=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.95,5,10),white);robe.position.y=1.35;robe.scale.set(1,1.15,.72);robe.castShadow=true;moses.add(robe);
const head=new THREE.Mesh(new THREE.SphereGeometry(.36,16,12),skin);head.position.set(0,2.55,0);moses.add(head);
const hairCap=new THREE.Mesh(new THREE.SphereGeometry(.38,14,10,0,Math.PI*2,0,Math.PI*.58),hair);hairCap.position.set(0,2.68,.02);moses.add(hairCap);
const hairBack=new THREE.Mesh(new THREE.BoxGeometry(.55,.65,.22),hair);hairBack.position.set(0,2.37,.22);moses.add(hairBack);
const sash=new THREE.Mesh(new THREE.BoxGeometry(.98,.2,.77),red);sash.position.set(0,1.93,0);moses.add(sash);
const collar=new THREE.Mesh(new THREE.TorusGeometry(.34,.09,6,16),gold);collar.rotation.x=Math.PI/2;collar.position.y=2.27;moses.add(collar);
const blueCollar=new THREE.Mesh(new THREE.TorusGeometry(.37,.09,6,16),blue);blueCollar.rotation.x=Math.PI/2;blueCollar.position.y=2.22;moses.add(blueCollar);
for(const side of [-1,1]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.14,.6,4,8),white);arm.position.set(side*.58,1.55,0);arm.rotation.z=side*.22;moses.add(arm);const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.56,4,8),blue);leg.position.set(side*.25,.43,0);moses.add(leg)}
moses.position.set(0,0,4.2);
const obstacles=[],coins=[];
function addObstacle(lane,z,type){
 const x=lane*2.15;
 const o=new THREE.Group();
 if(type==='pillar'){
  const c=new THREE.Mesh(new THREE.CylinderGeometry(.45,.55,2.6,10),teal);
  c.position.y=1.3;o.add(c);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.72,.72,.32,8),gold);
  cap.position.y=2.7;o.add(cap);
 }else if(type==='low'){
  const beam=new THREE.Mesh(new THREE.BoxGeometry(1.65,.72,1.05),stone);
  beam.position.y=.42;o.add(beam);
  const trim=new THREE.Mesh(new THREE.BoxGeometry(1.72,.12,1.1),gold);
  trim.position.y=.79;o.add(trim);
 }else{
  const b=new THREE.Mesh(new THREE.BoxGeometry(1.45,1.5,1.2),stone);
  b.position.y=.75;o.add(b);
  const top=new THREE.Mesh(new THREE.BoxGeometry(1.52,.2,1.25),gold);
  top.position.y=1.5;o.add(top);
 }
 o.position.set(x,0,z);scene.add(o);
 obstacles.push({obj:o,lane,z,type});
}
function addCoin(lane,z){const c=new THREE.Mesh(new THREE.TorusGeometry(.34,.12,8,16),gold);c.position.set(lane*2.15,1.35,z);c.castShadow=true;scene.add(c);coins.push(c)}
for(let i=0;i<14;i++){const z=-25-i*13;const lane=Math.floor(Math.random()*3)-1;const type=i%4===3?'low':(Math.random()>.5?'pillar':'block');addObstacle(lane,z,type);if(i%2===0)addCoin(Math.floor(Math.random()*3)-1,z-5);}
// State and controls
let running=false,lane=0,speed=8.5,score=0,jump=0,slide=0,lastSpawn=0;
const $=s=>document.querySelector(s);
function updateScore(){$('#coins').textContent=String(score).padStart(3,'0')}
function move(dir){if(!running)return;lane=Math.max(-1,Math.min(1,lane+dir))}
function leap(){if(running&&jump<=0&&slide<=0)jump=.72}
function crouch(){if(running)slide=.58}
addEventListener('keydown',e=>{if(['ArrowLeft','a','A'].includes(e.key))move(-1);if(['ArrowRight','d','D'].includes(e.key))move(1);if(['ArrowUp','w','W',' '].includes(e.key))leap();if(['ArrowDown','s','S'].includes(e.key))crouch()});
let touchX=0,touchY=0;renderer.domElement.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY},{passive:true});
renderer.domElement.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>Math.abs(dy))move(dx>0?1:-1);else if(dy<0)leap();else crouch()},{passive:true});
$('#start').onclick=()=>{running=true;$('#intro').classList.add('hidden')};
$('#restart').onclick=()=>location.reload();
const clock=new THREE.Clock();
function end(){running=false;$('#finalCoins').textContent=score;$('#end').classList.remove('hidden')}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);if(running){
 speed=Math.min(11.5,speed+dt*.06);const travel=speed*dt;
 moses.position.x+=(lane*2.15-moses.position.x)*Math.min(1,dt*12);
 if(jump>0)jump=Math.max(0,jump-dt);if(slide>0)slide=Math.max(0,slide-dt);
 moses.position.y=jump>0?Math.sin((.72-jump)/.72*Math.PI)*1.65:0;
 moses.scale.y=slide>0?.62:1;
 // Subtle running gait
 moses.rotation.z=Math.sin(clock.elapsedTime*13)*.035;
 for(const o of obstacles){
  o.z+=travel;o.obj.position.z=o.z;
  const nearX=Math.abs(o.obj.position.x-moses.position.x)<.95;
  const nearZ=Math.abs(o.z-moses.position.z)<.95;
  const dodged=o.type==='low'?slide>0:moses.position.y>.8;
  if(nearX&&nearZ&&!dodged)end();
 }
 for(const c of coins){c.position.z+=travel;c.rotation.y+=dt*3;if(c.position.z>3.8&&c.position.z<5.3&&Math.abs(c.position.x-moses.position.x)<.85){score++;updateScore();c.position.z=20}}
 if(clock.elapsedTime-lastSpawn>3.0){lastSpawn=clock.elapsedTime;const z=-95;const type=Math.random()>.76?'low':(Math.random()>.5?'pillar':'block');addObstacle(Math.floor(Math.random()*3)-1,z,type);if(Math.random()>.3)addCoin(Math.floor(Math.random()*3)-1,z-6)}
 for(let i=obstacles.length-1;i>=0;i--)if(obstacles[i].z>13){scene.remove(obstacles[i].obj);obstacles.splice(i,1)}
 for(let i=coins.length-1;i>=0;i--)if(coins[i].position.z>13){scene.remove(coins[i]);coins.splice(i,1)}
 camera.position.x+=(moses.position.x*.18-camera.position.x)*dt*2;camera.lookAt(moses.position.x*.12,1.25,-4);
 }
 renderer.render(scene,camera)}
animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
