import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const root = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bd9dc);
scene.fog = new THREE.Fog(0x9bd9dc, 28, 105);
const camera = new THREE.PerspectiveCamera(57, innerWidth / innerHeight, 0.1, 180);
camera.position.set(0, 6.2, 11.5);
camera.lookAt(0, 1.2, -5);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
root.insertBefore(renderer.domElement, root.firstChild);

scene.add(new THREE.HemisphereLight(0xfff0d5, 0x718078, 2.1));
const sun = new THREE.DirectionalLight(0xffd99a, 3.1);
sun.position.set(-9, 17, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -16;
sun.shadow.camera.right = 16;
sun.shadow.camera.top = 18;
sun.shadow.camera.bottom = -18;
scene.add(sun);

const mat = (color, roughness = 0.88, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const M = {
  sand: mat(0xd9b879), road: mat(0x9b805b), lane: mat(0xe7cb91), stone: mat(0xc9a36a),
  pale: mat(0xe6c88f), teal: mat(0x347d7b), tealDark: mat(0x245d61), gold: mat(0xffca42, 0.42, 0.18),
  white: mat(0xf4e8d0), red: mat(0xa83b32), blue: mat(0x24536c), skin: mat(0x98603f),
  hair: mat(0x211a18), green: mat(0x4e8652), wood: mat(0x8b603b), shadow: mat(0x74583b)
};
function mesh(geometry, material, parent, x=0, y=0, z=0) {
  const o = new THREE.Mesh(geometry, material);
  o.position.set(x,y,z); o.castShadow = true; o.receiveShadow = true;
  parent.add(o); return o;
}
function box(w,h,d,material,parent,x,y,z) {
  return mesh(new THREE.BoxGeometry(w,h,d), material, parent, x,y,z);
}
function cylinder(rt,rb,h,material,parent,x,y,z,segments=12) {
  return mesh(new THREE.CylinderGeometry(rt,rb,h,segments), material, parent, x,y,z);
}
function group(parent=scene) { const g=new THREE.Group(); parent.add(g); return g; }

// Ground and three-lane running track.
box(220,.5,190,M.sand,scene,0,-.42,-55);
box(7.5,.18,180,M.road,scene,0,-.1,-65);
for (const x of [-3.78,3.78]) box(.13,.07,180,M.lane,scene,x,.015,-65);
const laneMarkers=[];
for(let z=8;z>-155;z-=8){
  for(const x of [-1.27,1.27]) laneMarkers.push(box(.055,.035,2.5,M.lane,scene,x,.025,z));
}

// Distant dunes, pyramids and monumental Egyptian silhouettes.
for(let i=0;i<13;i++){
  const side=i%2?1:-1, z=-20-Math.floor(i/2)*20, x=side*(13+(i%3)*4);
  const dune=mesh(new THREE.SphereGeometry(1,16,10),mat(0xc9a66d),scene,x,1.2,z);
  dune.scale.set(9,2.1,7);
}
for(let i=0;i<7;i++){
  const side=i%2?1:-1, z=-28-i*19, x=side*(20+(i%2)*3);
  const p=mesh(new THREE.ConeGeometry(6.2,10,4),mat(0xc99f62),scene,x,4.8,z);
  p.rotation.y=Math.PI/4; p.scale.z=.78;
  box(12.8,.25,12.8,M.pale,scene,x,.12,z);
}
function makeTemple(x,z){
  const g=group();
  box(5.6,5.8,2.8,M.stone,g,x,2.9,z);
  box(6.5,.65,3.5,M.pale,g,x,5.9,z);
  for(let j=-1;j<=1;j++){
    cylinder(.48,.62,5.1,M.teal,g,x+j*1.55,2.65,z+1.8,12);
    cylinder(.72,.72,.42,M.gold,g,x+j*1.55,5.25,z+1.8,10);
    box(.12,2.6,.1,M.gold,g,x+j*1.55,2.8,z+2.13);
  }
  box(6.8,.35,3.7,M.pale,g,x,6.35,z);
  return g;
}
for(let z=-19;z>-155;z-=35){makeTemple(-10,z);makeTemple(10,z-13);}
function makePalm(x,z){
  const g=group();
  cylinder(.2,.32,4.3,M.wood,g,x,2.15,z,9);
  for(let i=0;i<7;i++){
    const a=i*Math.PI*2/7;
    const leaf=mesh(new THREE.ConeGeometry(.28,3.7,6),M.green,g,x+Math.cos(a)*1.05,4.35,z+Math.sin(a)*1.05);
    leaf.rotation.z=Math.PI/2-Math.cos(a)*.55;
    leaf.rotation.x=Math.sin(a)*.55;
  }
  return g;
}
const scenery=[];
for(let z=-9;z>-160;z-=18){scenery.push(makePalm(-8.3,z));scenery.push(makePalm(8.3,z-8));}

// Moses character: soft rounded geometry, viewed from behind.
const moses=group();
const body=group(moses);
mesh(new THREE.CapsuleGeometry(.48,.95,5,12),M.white,body,0,1.35,0).scale.set(1,1.13,.76);
mesh(new THREE.SphereGeometry(.35,18,14),M.skin,body,0,2.55,0);
mesh(new THREE.SphereGeometry(.39,18,12,0,Math.PI*2,0,Math.PI*.62),M.hair,body,0,2.68,.02);
box(.58,.65,.24,M.hair,body,0,2.38,.23);
const headband=mesh(new THREE.TorusGeometry(.37,.055,8,20),M.gold,body,0,2.66,0);
headband.rotation.x=Math.PI/2;
const sash=box(1.0,.18,.78,M.red,body,0,1.94,0);
const collar=mesh(new THREE.TorusGeometry(.37,.095,8,20),M.gold,body,0,2.24,0); collar.rotation.x=Math.PI/2;
const collarBlue=mesh(new THREE.TorusGeometry(.39,.075,8,20),M.blue,body,0,2.2,0); collarBlue.rotation.x=Math.PI/2;
const arms=[],legs=[];
for(const side of [-1,1]){
  const arm=mesh(new THREE.CapsuleGeometry(.14,.58,4,9),M.white,body,side*.57,1.5,0);
  arm.rotation.z=side*.2; arms.push(arm);
  const leg=mesh(new THREE.CapsuleGeometry(.17,.55,4,9),M.blue,body,side*.24,.43,0);
  legs.push(leg);
}
moses.position.set(0,0,4.2);

// Repeating obstacles and collectible coin trails.
const obstacles=[],coins=[];
const laneX=n=>n*2.5;
function addObstacle(lane,z,type){
  const g=group();
  if(type==='low'){
    box(1.9,.7,1.0,M.stone,g,0,.42,0);
    box(2.0,.14,1.08,M.gold,g,0,.82,0);
    box(.16,.25,1.1,M.teal,g,-.78,.15,0); box(.16,.25,1.1,M.teal,g,.78,.15,0);
  } else if(type==='pillar'){
    cylinder(.48,.58,2.75,M.teal,g,0,1.38,0,12);
    cylinder(.76,.76,.35,M.gold,g,0,2.9,0,10);
    cylinder(.65,.65,.22,M.pale,g,0,.16,0,10);
  } else {
    box(1.65,1.55,1.25,M.stone,g,0,.78,0);
    box(1.72,.2,1.3,M.gold,g,0,1.58,0);
    box(.16,.5,1.3,M.teal,g,-.62,.78,.02);
  }
  g.position.set(laneX(lane),0,z);
  obstacles.push({obj:g,lane,z,type,hit:false});
}
function addCoin(lane,z,y=1.35){
  const g=group();
  const ring=mesh(new THREE.TorusGeometry(.34,.115,9,18),M.gold,g,0,0,0);
  ring.rotation.y=Math.PI/2;
  cylinder(.075,.075,.13,M.gold,g,0,0,0,10).rotation.x=Math.PI/2;
  g.position.set(laneX(lane),y,z);
  coins.push({obj:g,lane,z,collected:false});
}
function addCoinLine(lane,z,count=5,spacing=2.3){
  for(let i=0;i<count;i++) addCoin(lane,z-i*spacing,1.35);
}
function randomLane(){return Math.floor(Math.random()*3)-1;}
function spawnPattern(z){
  const lane=randomLane(), r=Math.random();
  const type=r<.32?'low':r<.66?'pillar':'block';
  addObstacle(lane,z,type);
  if(Math.random()<.72) addCoinLine(randomLane(),z-7,3+Math.floor(Math.random()*3),2.2);
  else addCoinLine(lane===0?1:0,z-4,3,2.2);
}
for(let i=0;i<8;i++) spawnPattern(-25-i*17);

// HUD, game state and input.
const $=s=>document.querySelector(s);
let state='ready',lane=0,speed=12,distance=0,score=0,jumpTime=0,slideTime=0,spawnTimer=0;
const clock=new THREE.Clock();
const startOverlay=$('#intro'), endOverlay=$('#end');
const pauseButton=$('#pause');
function updateHud(){
  $('#coins').textContent=String(score).padStart(3,'0');
  const d=Math.floor(distance);
  const distanceNode=$('#distance');
  if(distanceNode) distanceNode.textContent=d+' m';
}
function move(dir){if(state!=='running')return;lane=THREE.MathUtils.clamp(lane+dir,-1,1);}
function leap(){if(state==='running'&&jumpTime<=0&&slideTime<=0)jumpTime=.82;}
function crouch(){if(state==='running'&&jumpTime<=0)slideTime=.72;}
function setState(next){state=next;if(pauseButton)pauseButton.textContent=next==='paused'?'CONTINUAR':'Ⅱ';}
function startGame(){
  if(state!=='ready')return;
  setState('running');startOverlay.classList.add('hidden');
}
function pauseGame(){
  if(state==='running'){setState('paused');$('#pausePanel').classList.remove('hidden');}
  else if(state==='paused'){setState('running');$('#pausePanel').classList.add('hidden');}
}
function endGame(){
  if(state==='over')return;
  setState('over');
  $('#finalCoins').textContent=score;
  $('#finalDistance').textContent=Math.floor(distance)+' m';
  endOverlay.classList.remove('hidden');
}
$('#start').addEventListener('click',startGame);
$('#restart').addEventListener('click',()=>location.reload());
if(pauseButton) pauseButton.addEventListener('click',pauseGame);
$('#resume').addEventListener('click',pauseGame);
addEventListener('keydown',e=>{
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();
  if(e.key==='Escape'||e.key==='p'||e.key==='P'){pauseGame();return;}
  if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')move(-1);
  if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')move(1);
  if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'||e.key===' ')leap();
  if(e.key==='ArrowDown'||e.key==='s'||e.key==='S')crouch();
});
let touchStart=null;
renderer.domElement.addEventListener('touchstart',e=>{
  const t=e.changedTouches[0];touchStart={x:t.clientX,y:t.clientY};
},{passive:true});
renderer.domElement.addEventListener('touchend',e=>{
  if(!touchStart)return;
  const t=e.changedTouches[0],dx=t.clientX-touchStart.x,dy=t.clientY-touchStart.y;
  if(Math.max(Math.abs(dx),Math.abs(dy))>24){
    if(Math.abs(dx)>Math.abs(dy))move(dx>0?1:-1);
    else if(dy<0)leap();else crouch();
  }
  touchStart=null;
},{passive:true});

// Main loop: forward world motion, smooth lane changes, collisions and difficulty ramp.
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.045);
  const t=clock.elapsedTime;
  if(state==='running'){
    speed=Math.min(22,speed+dt*.22);
    const travel=speed*dt;
    distance+=travel*.72;
    updateHud();

    moses.position.x=THREE.MathUtils.damp(moses.position.x,laneX(lane),12,dt);
    if(jumpTime>0)jumpTime=Math.max(0,jumpTime-dt);
    if(slideTime>0)slideTime=Math.max(0,slideTime-dt);
    const jumpProgress=jumpTime>0?1-jumpTime/.82:1;
    const jumpY=jumpTime>0?Math.sin(jumpProgress*Math.PI)*1.75:0;
    body.position.y=jumpY;
    body.scale.y=slideTime>0?.62:1;
    body.rotation.z=THREE.MathUtils.lerp(body.rotation.z,slideTime>0?-.06:0,dt*10);
    for(let i=0;i<2;i++){
      legs[i].rotation.x=Math.sin(t*14+i*Math.PI)*.55*(jumpTime>0?.35:1);
      arms[i].rotation.x=Math.sin(t*14+i*Math.PI+Math.PI)*.38;
      arms[i].rotation.z=(i===0?-.2:.2)+Math.sin(t*14+i*Math.PI)*.12;
    }
    moses.rotation.z=THREE.MathUtils.damp(moses.rotation.z, (laneX(lane)-moses.position.x)*-.035,8,dt);

    for(const marker of laneMarkers){marker.position.z+=travel;if(marker.position.z>12)marker.position.z-=168;}
    for(const item of scenery){
      item.position.z+=travel;
      if(item.position.z>15)item.position.z-=162;
    }
    for(const o of obstacles){
      o.z+=travel;o.obj.position.z=o.z;
      const aligned=Math.abs(o.obj.position.x-moses.position.x)<1.02;
      const close=Math.abs(o.z-moses.position.z)<1.05;
      if(aligned&&close&&!o.hit){
        const avoided=o.type==='low'?slideTime>0:jumpY>0.9;
        if(!avoided){o.hit=true;endGame();}
      }
    }
    for(const c of coins){
      c.z+=travel;c.obj.position.z=c.z;c.obj.rotation.y+=dt*2.8;
      if(!c.collected&&Math.abs(c.z-moses.position.z)<.9&&Math.abs(c.obj.position.x-moses.position.x)<.95){
        c.collected=true;score++;updateHud();c.obj.visible=false;
      }
    }
    spawnTimer+=dt;
    const interval=Math.max(1.65,2.65-(speed-12)*.075);
    if(spawnTimer>interval){spawnTimer=0;spawnPattern(-112);}
    for(let i=obstacles.length-1;i>=0;i--){
      if(obstacles[i].z>14){scene.remove(obstacles[i].obj);obstacles.splice(i,1);}
    }
    for(let i=coins.length-1;i>=0;i--){
      if(coins[i].z>14){scene.remove(coins[i].obj);coins.splice(i,1);}
    }
    camera.position.x=THREE.MathUtils.damp(camera.position.x,moses.position.x*.18,2.5,dt);
    camera.lookAt(moses.position.x*.12,1.25,-5);
  } else if(state==='ready'){
    body.position.y=Math.sin(t*2)*.035;
  }
  renderer.render(scene,camera);
}
animate();

addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
