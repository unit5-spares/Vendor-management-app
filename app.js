const KEY="apl_unit3_vendor_repair_v1";
const seed={
vendors:[
{id:"V-001",name:"ABC Industrial Electricals",contact:"Rajesh Kumar",phone:"9876543210",email:"service@abcindustrial.in",category:"Motors / VFD",address:"Jamshedpur, Jharkhand",active:true},
{id:"V-002",name:"Rex Drive Solutions",contact:"Amit Singh",phone:"9123456780",email:"support@rexdrive.in",category:"VFD / Drives",address:"Ranchi, Jharkhand",active:true},
{id:"V-003",name:"PowerTech Services",contact:"Sanjay Das",phone:"9988776655",email:"powertech@example.in",category:"Electrical Repair",address:"Adityapur, Jharkhand",active:true}
],
equipment:[
{id:"EQ-001",machine:"4000T BEMCO PRESS",part:"Main Hydraulic Motor",type:"Motor",criticality:"Critical"},
{id:"EQ-002",machine:"1000T ISGECH PRESS",part:"VFD / Drive",type:"VFD",criticality:"High"},
{id:"EQ-003",machine:"SHOT BLAST LINE",part:"Drive Motor",type:"Motor",criticality:"High"}
],
requests:[
{id:"RR-2026-001",date:"2026-09-25",machine:"4000T BEMCO PRESS",part:"Main Hydraulic Motor",type:"Motor",serial:"MTR-45821",qty:1,problem:"Motor overheating and insulation failure",priority:"Critical",vendor:"ABC Industrial Electricals",status:"Challan Pending",due:"2026-10-05",notes:"Repair required urgently. Spare unavailable in store.",challan:"",events:[["25 Sep 2026","Repair request raised","Maintenance"]]},
{id:"RR-2026-002",date:"2026-09-24",machine:"1000T ISGECH PRESS",part:"VFD / Drive",type:"VFD",serial:"VFD-77821",qty:1,problem:"Drive showing OC fault",priority:"High",vendor:"Rex Drive Solutions",status:"In Repair",due:"2026-10-02",notes:"Vendor acknowledged material.",challan:"CH-2026-014",events:[["24 Sep 2026","Request raised","Maintenance"],["25 Sep 2026","Challan ready by Store","Store"],["25 Sep 2026","Material handed over to vendor","Store"],["26 Sep 2026","Vendor received equipment","Vendor"]]},
{id:"RR-2026-003",date:"2026-09-20",machine:"SHOT BLAST LINE",part:"Drive Motor",type:"Motor",serial:"MTR-33910",qty:1,problem:"Bearing noise and vibration",priority:"High",vendor:"PowerTech Services",status:"Overdue",due:"2026-09-26",notes:"Vendor committed return date missed.",challan:"CH-2026-011",events:[["20 Sep 2026","Request raised","Maintenance"],["21 Sep 2026","Challan ready","Store"],["22 Sep 2026","Sent to vendor","Store"],["23 Sep 2026","Vendor received","Vendor"]]}
]
};
let db=JSON.parse(localStorage.getItem(KEY)||"null")||seed;
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function esc(v=""){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function toast(msg,type="success"){const x=document.createElement("div");x.className="toast "+type;x.textContent=msg;document.getElementById("toastWrap").appendChild(x);setTimeout(()=>x.remove(),2800)}
function fmtDate(v){if(!v)return "—";const d=new Date(v);return isNaN(d)?"—":d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
function daysTo(d){return Math.ceil((new Date(d+"T23:59:59")-new Date())/86400000)}
function statusClass(s){return s==="Overdue"?"b-red":s==="Due Soon"?"b-orange":s==="Received"||s==="Closed"?"b-green":s==="Challan Ready"?"b-purple":s==="In Repair"?"b-blue":"b-gray"}
function render(){
 const view=document.querySelector(".nav-item.active")?.dataset.view||"dashboard";
 const titles={dashboard:"Control Tower",requests:"Repair Requests",challans:"Challan Tracking",vendors:"Vendor Management",equipment:"Equipment / Spares",reports:"Reports & Analytics"};
 document.getElementById("pageTitle").textContent=titles[view];
 ({dashboard:dashboard,requests:requests,challans:challans,vendors:vendors,equipment:equipment,reports:reports}[view])();
}
function head(title,desc,buttons=""){return `<div class="page-head"><div><h1>${title}</h1><p>${desc}</p></div><div class="actions">${buttons}</div></div>`}
function dashboard(){
 const r=db.requests, overdue=r.filter(x=>x.status==="Overdue").length, pending=r.filter(x=>x.status==="Challan Pending").length;
 const repair=r.filter(x=>x.status==="In Repair").length, received=r.filter(x=>["Received","Closed"].includes(x.status)).length;
 const due=r.filter(x=>x.due&&daysTo(x.due)>=0&&daysTo(x.due)<=3&&x.status!=="Received"&&x.status!=="Closed").length;
 document.getElementById("app").innerHTML=head("Vendor Repair Control Tower","AUTO PROFILES LIMITED · UNIT-III | Electrical equipment sent outside for repair",
 `<button class="btn" onclick="openRequest()">＋ New Repair Request</button><button class="btn primary" onclick="openVendor()">＋ Add Vendor</button>`)
 +`<div class="kpis">
 ${kpi("Total Outside",r.filter(x=>!["Received","Closed"].includes(x.status)).length,"Live repair inventory")}
 ${kpi("Challan Pending",pending,"Store action required")}
 ${kpi("In Repair",repair,"With vendors")}
 ${kpi("Due ≤ 3 Days",due,"Return monitoring")}
 ${kpi("Overdue",overdue,"Immediate follow-up","red")}
 </div>
 <div class="grid-2">
 <div class="card"><div class="card-head"><h3>Repair Lifecycle</h3><span>Current status</span></div><div class="card-body"><div class="pipeline">
 ${pipe(r.filter(x=>x.status==="Challan Pending").length,"Challan Pending","orange")}
 ${pipe(r.filter(x=>x.status==="Challan Ready").length,"Challan Ready","")}
 ${pipe(r.filter(x=>x.status==="In Repair").length,"In Repair","")}
 ${pipe(r.filter(x=>x.status==="Received").length,"Received","")}
 ${pipe(overdue,"Overdue","red")}
 </div></div></div>
 <div class="card"><div class="card-head"><h3>Priority Alerts</h3><span>${overdue+pending} actions</span></div><div class="card-body">${alerts()}</div></div>
 </div>
 <div class="card" style="margin-top:16px"><div class="card-head"><h3>Live Repair Register</h3><button class="btn" onclick="setView('requests')">View all →</button></div>${requestTable(r.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8))}</div>`;
}
function kpi(t,n,s,kind=""){return `<div class="kpi"><div class="kpi-top"><span>${t}</span><span>●</span></div><div class="kpi-value" style="${kind==="red"?"color:var(--red)":""}">${n}</div><small>${s}</small></div>`}
function pipe(n,t,c){return `<div class="pipe ${c}"><b>${n}</b><span>${t}</span></div>`}
function alerts(){
 const a=[];
 db.requests.filter(x=>x.status==="Overdue").forEach(x=>a.push(`<div class="alert red"><b>OVERDUE · ${esc(x.part)}</b><p>${esc(x.vendor)} · ${Math.abs(daysTo(x.due))} day(s) overdue · ${esc(x.id)}</p></div>`));
 db.requests.filter(x=>x.status==="Challan Pending").forEach(x=>a.push(`<div class="alert"><b>STORE ACTION · ${esc(x.part)}</b><p>Manual challan required · ${esc(x.id)} · Vendor: ${esc(x.vendor)}</p></div>`));
 return a.length?a.slice(0,5).join(""):`<div class="empty">No critical alerts.</div>`;
}
function requestTable(rows){
 if(!rows.length)return `<div class="empty">No repair requests found.</div>`;
 return `<div class="table-wrap"><table><thead><tr><th>Request</th><th>Equipment</th><th>Vendor</th><th>Due Date</th><th>Status</th><th>Priority</th><th></th></tr></thead><tbody>${rows.map(x=>`<tr>
 <td><b>${esc(x.id)}</b><span class="sub">${fmtDate(x.date)}</span></td>
 <td><span class="part-name">${esc(x.part)}</span><span class="sub">${esc(x.machine)} · ${esc(x.type)}</span></td>
 <td>${esc(x.vendor)}<span class="sub">${x.challan?esc(x.challan):"Challan not ready"}</span></td>
 <td>${fmtDate(x.due)}<span class="sub">${x.status==="Overdue"?Math.abs(daysTo(x.due))+" days overdue":daysTo(x.due)>=0?daysTo(x.due)+" days left":"—"}</span></td>
 <td><span class="badge ${statusClass(x.status)}">${esc(x.status)}</span></td>
 <td><span class="badge ${x.priority==="Critical"?"b-red":x.priority==="High"?"b-orange":"b-gray"}">${esc(x.priority)}</span></td>
 <td><button class="btn" onclick="openRequest('${x.id}')">Open</button></td></tr>`).join("")}</tbody></table></div>`;
}
function requests(){
 document.getElementById("app").innerHTML=head("Repair Requests","Create, edit and control every electrical equipment repair movement.",
 `<button class="btn primary" onclick="openRequest()">＋ New Repair Request</button>`)
 +`<div class="card"><div class="card-body"><div class="filters"><input class="input search" id="rqSearch" placeholder="Search request, machine, part, serial or vendor..." oninput="filterRequests()"><select class="select" id="rqStatus" onchange="filterRequests()"><option value="">All Status</option><option>Challan Pending</option><option>Challan Ready</option><option>In Repair</option><option>Received</option><option>Overdue</option></select><select class="select" id="rqPriority" onchange="filterRequests()"><option value="">All Priority</option><option>Critical</option><option>High</option><option>Medium</option><option>Normal</option></select></div><div id="requestList">${requestTable(db.requests)}</div></div></div>`;
}
function filterRequests(){
 const q=document.getElementById("rqSearch").value.toLowerCase(),s=document.getElementById("rqStatus").value,p=document.getElementById("rqPriority").value;
 const rows=db.requests.filter(x=>(!q||JSON.stringify(x).toLowerCase().includes(q))&&(!s||x.status===s)&&(!p||x.priority===p));
 document.getElementById("requestList").innerHTML=requestTable(rows);
}
function challans(){
 const rows=db.requests.filter(x=>x.challan||x.status==="Challan Pending"||x.status==="Challan Ready");
 document.getElementById("app").innerHTML=head("Challan Tracking","Store will physically write the challan. This portal sends the requirement and tracks whether it is ready.",
 `<button class="btn" onclick="toast('Store action notification refreshed')">↻ Refresh alerts</button>`)
 +`<div class="notice"><b>Process:</b> Maintenance raises request → Store receives “Challan Required” → Store manually prepares challan → Store marks <b>Challan Ready</b> → Vendor can see the readiness and proceed.</div>
 <div class="card"><div class="card-head"><h3>Store Challan Action Register</h3><span>${rows.length} records</span></div>${requestTable(rows)}</div>`;
}
function vendors(){
 document.getElementById("app").innerHTML=head("Vendor Management","Maintain approved repair vendors, contacts, categories and performance history.",
 `<button class="btn primary" onclick="openVendor()">＋ Add Vendor</button>`)
 +`<div class="vendor-grid">${db.vendors.map(v=>{const rr=db.requests.filter(x=>x.vendor===v.name),ov=rr.filter(x=>x.status==="Overdue").length;return `<div class="vendor-card">
 <div style="display:flex;justify-content:space-between;gap:10px"><div><h3>${esc(v.name)}</h3><p>${esc(v.id)} · ${esc(v.category)}</p></div><span class="badge ${v.active?"b-green":"b-gray"}">${v.active?"ACTIVE":"INACTIVE"}</span></div>
 <div style="margin-top:10px;font-size:10px;color:var(--muted)">${esc(v.contact)} · ${esc(v.phone)}</div>
 <div class="vendor-meta"><div><b>${rr.length}</b><span>Repairs</span></div><div><b>${ov}</b><span>Overdue</span></div><div><b>${rr.length?Math.round(rr.filter(x=>!["Overdue","Challan Pending"].includes(x.status)).length/rr.length*100):0}%</b><span>Progress</span></div></div>
 <div style="display:flex;gap:6px;margin-top:12px"><button class="btn" onclick="openVendor('${v.id}')">Edit</button><button class="btn danger" onclick="deleteVendor('${v.id}')">Delete</button></div></div>`}).join("")}</div>`;
}
function equipment(){
 document.getElementById("app").innerHTML=head("Equipment / Spare Master","Manage electrical equipment and criticality used in repair requests.",
 `<button class="btn primary" onclick="openEquipment()">＋ Add Equipment</button>`)
 +`<div class="card"><div class="card-body"><div class="filters"><input class="input search" id="eqSearch" placeholder="Search machine, part, type or ID..." oninput="filterEquipment()"></div><div id="eqList">${equipmentTable(db.equipment)}</div></div></div>`;
}
function equipmentTable(rows){return `<div class="table-wrap"><table><thead><tr><th>ID</th><th>Machine</th><th>Part / Equipment</th><th>Type</th><th>Criticality</th><th></th></tr></thead><tbody>${rows.length?rows.map(x=>`<tr><td><b>${esc(x.id)}</b></td><td>${esc(x.machine)}</td><td>${esc(x.part)}</td><td>${esc(x.type)}</td><td><span class="badge ${x.criticality==="Critical"?"b-red":x.criticality==="High"?"b-orange":"b-gray"}">${esc(x.criticality)}</span></td><td><button class="btn" onclick="openEquipment('${x.id}')">Edit</button> <button class="btn danger" onclick="deleteEquipment('${x.id}')">Delete</button></td></tr>`).join(""):`<tr><td colspan="6"><div class="empty">No equipment records.</div></td></tr>`}</tbody></table></div>`}
function filterEquipment(){const q=document.getElementById("eqSearch").value.toLowerCase();document.getElementById("eqList").innerHTML=equipmentTable(db.equipment.filter(x=>JSON.stringify(x).toLowerCase().includes(q)))}
function reports(){
 const r=db.requests,total=r.length,over=r.filter(x=>x.status==="Overdue").length;
 const vendors=db.vendors.map(v=>{const a=r.filter(x=>x.vendor===v.name);return {name:v.name,n:a.length,over:a.filter(x=>x.status==="Overdue").length}})
 document.getElementById("app").innerHTML=head("Reports & Analytics","Management-level visibility for vendor repair turnaround and outstanding equipment.",
 `<button class="btn primary" onclick="exportCSV()">⇩ Export CSV</button><button class="btn" onclick="window.print()">Print</button>`)
 +`<div class="kpis">${kpi("Total Requests",total,"All recorded requests")}${kpi("Overdue",over,"Needs escalation","red")}${kpi("Vendors",db.vendors.length,"Active masters")}${kpi("Critical Items",r.filter(x=>x.priority==="Critical").length,"Priority")}${kpi("Challans",r.filter(x=>x.challan).length,"References")}</div>
 <div class="grid-2"><div class="card"><div class="card-head"><h3>Vendor Workload</h3></div><div class="card-body">${vendors.map(v=>`<div class="mini-stat"><span>${esc(v.name)}</span><b>${v.n} repairs · ${v.over} overdue</b></div>`).join("")}</div></div>
 <div class="card"><div class="card-head"><h3>Current Status Distribution</h3></div><div class="card-body">${["Challan Pending","Challan Ready","In Repair","Received","Overdue"].map(s=>{const n=r.filter(x=>x.status===s).length;return `<div class="mini-stat"><span>${s}</span><b>${n}</b></div>`}).join("")}</div></div></div>`;
}
function openRequest(id){
 const x=id?db.requests.find(a=>a.id===id):null;
 const vendors=db.vendors.map(v=>`<option ${x?.vendor===v.name?"selected":""}>${esc(v.name)}</option>`).join("");
 const equipment=db.equipment.map(e=>`<option value="${esc(e.part)}|${esc(e.machine)}|${esc(e.type)}">${esc(e.part)} — ${esc(e.machine)}</option>`).join("");
 document.getElementById("modalBox").innerHTML=`<div class="modal-head"><h2>${x?"Repair Request · "+esc(x.id):"New Repair Request"}</h2><button class="modal-close" onclick="closeModal()">×</button></div>
 <div class="modal-body"><div class="form-grid">
 <div class="field"><label>Request Date *</label><input id="fDate" class="input" type="date" value="${x?.date||new Date().toISOString().slice(0,10)}"></div>
 <div class="field"><label>Priority *</label><select id="fPriority" class="select">${["Critical","High","Medium","Normal"].map(v=>`<option ${x?.priority===v?"selected":""}>${v}</option>`).join("")}</select></div>
 <div class="field full"><label>Equipment / Spare</label><select id="fEquipment" class="select"><option value="">Select from master</option>${equipment}</select></div>
 <div class="field"><label>Machine Name</label><input id="fMachine" class="input" value="${esc(x?.machine||"")}"></div>
 <div class="field"><label>Part / Equipment Name *</label><input id="fPart" class="input" value="${esc(x?.part||"")}"></div>
 <div class="field"><label>Equipment Type</label><select id="fType" class="select">${["Motor","VFD","AC Drive","Soft Starter","Control Card","Servo Drive","Transformer","Other"].map(v=>`<option ${x?.type===v?"selected":""}>${v}</option>`).join("")}</select></div>
 <div class="field"><label>Serial / Asset No.</label><input id="fSerial" class="input" value="${esc(x?.serial||"")}"></div>
 <div class="field"><label>Quantity</label><input id="fQty" class="input" type="number" min="1" value="${x?.qty||1}"></div>
 <div class="field"><label>Repair Vendor</label><select id="fVendor" class="select">${vendors}</select></div>
 <div class="field"><label>Expected Return / Due Date *</label><input id="fDue" class="input" type="date" value="${x?.due||""}"></div>
 <div class="field"><label>Status</label><select id="fStatus" class="select">${["Challan Pending","Challan Ready","In Repair","Received","Overdue","Closed"].map(v=>`<option ${x?.status===v?"selected":""}>${v}</option>`).join("")}</select></div>
 <div class="field"><label>Manual Challan No. (if ready)</label><input id="fChallan" class="input" value="${esc(x?.challan||"")}" placeholder="Store enters physical challan no."></div>
 <div class="field full"><label>Fault / Repair Requirement</label><textarea id="fProblem" class="textarea">${esc(x?.problem||"")}</textarea></div>
 <div class="field full"><label>Additional Notes</label><textarea id="fNotes" class="textarea">${esc(x?.notes||"")}</textarea></div>
 </div></div>
 <div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>${x?`<button class="btn danger" onclick="deleteRequest('${x.id}')">Delete</button>`:""}<button class="btn primary" onclick="saveRequest('${x?.id||""}')">Save Request</button></div>`;
 document.getElementById("modal").classList.add("show");
 document.getElementById("fEquipment").onchange=e=>{if(e.target.value){const [p,m,t]=e.target.value.split("|");fPart.value=p;fMachine.value=m;fType.value=t}};
}
function saveRequest(id){
 const g=i=>document.getElementById(i).value.trim(), req={date:g("fDate"),priority:g("fPriority"),machine:g("fMachine"),part:g("fPart"),type:g("fType"),serial:g("fSerial"),qty:+g("fQty")||1,vendor:g("fVendor"),due:g("fDue"),status:g("fStatus"),challan:g("fChallan"),problem:g("fProblem"),notes:g("fNotes")};
 if(!req.part||!req.due){toast("Part name and due date are required","error");return}
 if(id){const x=db.requests.find(a=>a.id===id);Object.assign(x,req);x.events=x.events||[];x.events.push([new Date().toLocaleDateString("en-IN"),"Record updated","Admin"])}
 else{req.id="RR-"+new Date().getFullYear()+"-"+String(Date.now()).slice(-5);req.events=[[new Date().toLocaleDateString("en-IN"),"Repair request raised","Maintenance"]];db.requests.unshift(req)}
 save();closeModal();render();toast(id?"Request updated":"Repair request created");
}
function deleteRequest(id){if(!confirm("Delete this repair request permanently?"))return;db.requests=db.requests.filter(x=>x.id!==id);save();closeModal();render();toast("Request deleted")}
function openVendor(id){
 const x=id?db.vendors.find(a=>a.id===id):null;
 document.getElementById("modalBox").innerHTML=`<div class="modal-head"><h2>${x?"Edit Vendor":"Add Vendor"}</h2><button class="modal-close" onclick="closeModal()">×</button></div><div class="modal-body"><div class="form-grid">
 <div class="field"><label>Vendor Code</label><input id="vId" class="input" value="${esc(x?.id||"V-"+String(Date.now()).slice(-4))}"></div><div class="field"><label>Company Name *</label><input id="vName" class="input" value="${esc(x?.name||"")}"></div>
 <div class="field"><label>Contact Person</label><input id="vContact" class="input" value="${esc(x?.contact||"")}"></div><div class="field"><label>Mobile</label><input id="vPhone" class="input" value="${esc(x?.phone||"")}"></div>
 <div class="field"><label>Email</label><input id="vEmail" class="input" value="${esc(x?.email||"")}"></div><div class="field"><label>Repair Category</label><input id="vCategory" class="input" value="${esc(x?.category||"Electrical Equipment")}"></div>
 <div class="field full"><label>Address</label><textarea id="vAddress" class="textarea">${esc(x?.address||"")}</textarea></div>
 </div></div><div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>${x?`<button class="btn danger" onclick="deleteVendor('${x.id}')">Delete</button>`:""}<button class="btn primary" onclick="saveVendor('${x?.id||""}')">Save Vendor</button></div>`;
 document.getElementById("modal").classList.add("show");
}
function saveVendor(old){
 const g=i=>document.getElementById(i).value.trim(), v={id:g("vId"),name:g("vName"),contact:g("vContact"),phone:g("vPhone"),email:g("vEmail"),category:g("vCategory"),address:g("vAddress"),active:true};
 if(!v.name){toast("Vendor name required","error");return}
 if(old)Object.assign(db.vendors.find(x=>x.id===old),v);else db.vendors.push(v);
 save();closeModal();render();toast(old?"Vendor updated":"Vendor added");
}
function deleteVendor(id){if(db.requests.some(x=>x.vendor===db.vendors.find(v=>v.id===id)?.name)){toast("Vendor has linked repair records. Reassign them before deleting.","error");return}if(confirm("Delete vendor?")){db.vendors=db.vendors.filter(x=>x.id!==id);save();closeModal();render();toast("Vendor deleted")}}
function openEquipment(id){
 const x=id?db.equipment.find(a=>a.id===id):null;
 document.getElementById("modalBox").innerHTML=`<div class="modal-head"><h2>${x?"Edit Equipment":"Add Equipment"}</h2><button class="modal-close" onclick="closeModal()">×</button></div><div class="modal-body"><div class="form-grid">
 <div class="field"><label>Equipment ID</label><input id="eId" class="input" value="${esc(x?.id||"EQ-"+String(Date.now()).slice(-4))}"></div>
 <div class="field"><label>Machine Name & ID *</label><input id="eMachine" class="input" value="${esc(x?.machine||"")}"></div>
 <div class="field"><label>Part / Equipment *</label><input id="ePart" class="input" value="${esc(x?.part||"")}"></div>
 <div class="field"><label>Type</label><select id="eType" class="select">${["Motor","VFD","AC Drive","Soft Starter","Control Card","Servo Drive","Transformer","Other"].map(v=>`<option ${x?.type===v?"selected":""}>${v}</option>`).join("")}</select></div>
 <div class="field"><label>Criticality</label><select id="eCrit" class="select">${["Critical","High","Medium","Normal"].map(v=>`<option ${x?.criticality===v?"selected":""}>${v}</option>`).join("")}</select></div>
 </div></div><div class="modal-foot"><button class="btn" onclick="closeModal()">Cancel</button>${x?`<button class="btn danger" onclick="deleteEquipment('${x.id}')">Delete</button>`:""}<button class="btn primary" onclick="saveEquipment('${x?.id||""}')">Save Equipment</button></div>`;
 document.getElementById("modal").classList.add("show");
}
function saveEquipment(old){const g=i=>document.getElementById(i).value.trim(),v={id:g("eId"),machine:g("eMachine"),part:g("ePart"),type:g("eType"),criticality:g("eCrit")};if(!v.machine||!v.part){toast("Machine and part are required","error");return}if(old)Object.assign(db.equipment.find(x=>x.id===old),v);else db.equipment.push(v);save();closeModal();render();toast(old?"Equipment updated":"Equipment added")}
function deleteEquipment(id){if(confirm("Delete equipment master record?")){db.equipment=db.equipment.filter(x=>x.id!==id);save();closeModal();render();toast("Equipment deleted")}}
function closeModal(){document.getElementById("modal").classList.remove("show")}
function setView(v){document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.view===v));render()}
function exportCSV(){
 const rows=[["Request ID","Date","Machine","Part","Type","Serial","Qty","Priority","Vendor","Status","Due Date","Challan No.","Problem"],...db.requests.map(x=>[x.id,x.date,x.machine,x.part,x.type,x.serial,x.qty,x.priority,x.vendor,x.status,x.due,x.challan,x.problem])];
 const csv=rows.map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\n"),a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="APL_Unit_III_Vendor_Repair_Register.csv";a.click();URL.revokeObjectURL(a.href);toast("CSV report exported");
}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
document.getElementById("menuBtn").onclick=()=>document.getElementById("sidebar").classList.toggle("open");
document.getElementById("modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
document.getElementById("exportBtn").onclick=exportCSV;
document.getElementById("notifBtn").onclick=()=>{toast("Store/Vendor alerts are shown in the Control Tower")};
window.openRequest=openRequest;window.openVendor=openVendor;window.openEquipment=openEquipment;window.deleteRequest=deleteRequest;window.deleteVendor=deleteVendor;window.deleteEquipment=deleteEquipment;window.saveRequest=saveRequest;window.saveVendor=saveVendor;window.saveEquipment=saveEquipment;window.closeModal=closeModal;window.setView=setView;window.filterRequests=filterRequests;window.filterEquipment=filterEquipment;window.exportCSV=exportCSV;
render();