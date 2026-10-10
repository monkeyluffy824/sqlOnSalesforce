const orgModalTag = document.getElementById("selectOrg");
const errorTag = document.getElementById("error");
const errorTagPara = document.getElementById("errorPara");
const successTag =document.getElementById("success");
const  connectButtonElement= document.getElementById('connectToOrgViaBackend');
const salesforceUrls = ["https://*.salesforce.com/*","https://*.force.com/*"];
const noLoginFound = "No salesforce login found";
const connectOrgModal = document.getElementById('orgConnectModal');
const closeOrgModal = document.getElementById('closeOrgModal');
const isOpenClass = "modal-is-open";
const openingClass = "modal-is-opening";
const closingClass = "modal-is-closing";
const animationDuration = 400; 
const orgConnectFail = "Connection To Org Failed";
const orgStatus = document.getElementById('details-org');
const editorTag = document.getElementById('displayOnOrgSuccess');
const submitFormTag = document.getElementById("submitQuery");

const NUM_0 = 0;
let visibleModal = null;
let salesforceDomain;
let finalURL;
let finalSid;

async function getSalesforceSessionDetails(){
	let queryOptions={
		lastFocusedWindow: true,
		url: salesforceUrls
		
	};
	await chrome.tabs.query(queryOptions,(tabs)=>{
		console.log(tabs);
		connectButtonElement.disabled=true;
		let setURLS = new Set();
		if(tabs.length>0){
			connectOrgModal.disabled = false;
			clearError();
			addOptions(orgModalTag,null,'Select');
			for(let k in tabs){
				if(setURLS.has(new URL(tabs[k].url).hostname)?false:setURLS.add(new URL(tabs[k].url).hostname)){
					addOptions(orgModalTag,tabs[k].url, new URL(tabs[k].url).hostname);
				}
			}
		}else{
			connectOrgModal.disabled = true;
			setError(noLoginFound);
			alert(noLoginFound);
		}
	});
}

document.getElementById("connectToOrgViaBackend").addEventListener("click", async () => {
	     if(!salesforceDomain){
			setError(noLoginFound);
			return;
		}
		salesforceDomain=salesforceDomain.replace("lightning.force.com","my.salesforce.com");
		chrome.cookies.getAll({ name: "sid", domain: salesforceDomain}, async (cookies) => findAndSetCookies(cookies));
		const modal = document.getElementById('modal-org');
	    if (modal?.open) closeModal(modal);     
});


function findAndSetCookies(cookies){
	const sidCookie = cookies.find(c => c.domain.includes("my.salesforce.com"));
	if (!sidCookie) {
		return;
	}
	const sid = sidCookie.value;
	const instanceUrl = `https://${sidCookie.domain.replace(/^\./, "")}`;
	finalURL=instanceUrl;
	finalSid= sid;

	finalSid ? createOrgDetails(): setError(orgConnectFail);
}

function addOptions(tag,value,text){
	if(!tag) return;
	const opt = document.createElement('option');
	opt.value= value ?? '';
	opt.textContent = text ?? '';
	tag?.appendChild(opt);
}

function clearError(){
	errorTagPara.textContent= null;
	errorTag.style.display = "none";
}

function setError(errMsg){
	errorTag.style.display = "inline-block" ;
	editorTag.style.display = "none";
	errorTagPara.textContent=errMsg;
}
orgModalTag.addEventListener("change", (event)=>{
	  const selectedVal= event.target.value;
	  const tab= selectedVal;
	  if(tab && tab?.length > NUM_0){
		    const ur = new URL(tab);
		    salesforceDomain= ur.hostname;
			connectButtonElement.disabled=false;
	 }else{
		connectButtonElement.disabled=true;
	 }
});


connectOrgModal.addEventListener("click",(event)=>modalFunction(event));

closeOrgModal.addEventListener("click",(event)=>modalFunction(event));

const modalFunction = (event) => {
  event.preventDefault();
  const modal = document.getElementById(event.currentTarget.dataset.target);
  if (!modal) return;
  modal && (modal.open ? closeModal(modal) : openModal(modal));
}

const openModal = (modal) => {
  const { documentElement: html } = document;
  html.classList.add(isOpenClass, openingClass);
  setTimeout(() => {
    visibleModal = modal;
    html.classList.remove(openingClass);
  }, animationDuration);
  modal.showModal();
};

const closeModal = (modal) => {
  visibleModal = null;
  const { documentElement: html } = document;
  html.classList.add(closingClass);
  setTimeout(() => {
    html.classList.remove(closingClass, isOpenClass);
    modal.close();
  }, animationDuration);
};

submitFormTag.addEventListener("click", (e)=>{
	const sqlQuery = document.getElementById("queryPlace")?.value ;
	console.log(sqlQuery);
	if(!sqlQuery) return;
});

function createOrgDetails(){
	if(!orgStatus) return;

	const header = document.createElement('p');
	header.style = "margin-top:1rem;font-weight:bold;";
	header.textContent = `Connected to ${salesforceDomain}`;
	orgStatus.appendChild(header);
	editorTag.style.display = "inline-block";
}


getSalesforceSessionDetails();











