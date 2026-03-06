
const bgA=document.getElementById("bgA")
const bgB=document.getElementById("bgB")
const downloading=document.getElementById("downloading")
const log=document.getElementById("log")

let activeA=true
let lastImg=-1
let total=1
let needed=1
let currentFile="Downloading content..."
let lastPercent=null

function randImg(){
let i
do{
i=Math.floor(Math.random()*images.length)
}while(images.length>1 && i===lastImg)
lastImg=i
return "images/"+images[i]
}

function crossfade(){
const next=randImg()
const vis=activeA?bgA:bgB
const hid=activeA?bgB:bgA

hid.style.transition="none"
hid.style.backgroundImage=`url("${next}")`
hid.style.opacity=0
void hid.offsetWidth

hid.style.transition="opacity 1.8s ease"
vis.style.transition="opacity 1.8s ease"

hid.style.opacity=1
vis.style.opacity=0

activeA=!activeA
}

setInterval(crossfade,7000)
crossfade()

function setFile(t){
currentFile=t||"Downloading content..."
downloading.textContent=currentFile
}

function percent(){
const p=(total-needed)/total
return Math.round(Math.max(0,Math.min(1,p))*100)
}

function addLine(file,p){
const d=document.createElement("div")
d.className="line"
d.textContent=`${file} ${p}%`
log.appendChild(d)

while(log.children.length>11){
log.removeChild(log.firstChild)
}

updateFade()
}

function updateFade(){
const arr=[...log.children]
const n=arr.length
arr.forEach((l,i)=>{
const depth=i/(n-1||1)
l.style.opacity=(1-depth*.85)
l.style.transform=`translateY(${depth*26}px)`
})
}

function update(){
const p=percent()

if(lastPercent===null){
lastPercent=p
addLine(currentFile,100-p)
return
}

if(p!==lastPercent){

const oldR=100-lastPercent
const newR=100-p

for(let r=oldR-1;r>=newR;r--){
addLine(currentFile,r)
}

lastPercent=p
}
}

function SetStatusChanged(t){setFile(t)}
function DownloadingFile(f){setFile(f)}
function SetFilesTotal(t){total=Math.max(1,parseInt(t)||1);update()}
function SetFilesNeeded(n){needed=Math.max(0,parseInt(n)||0);update()}
