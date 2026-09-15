(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`some`,`come`,`were`,`your`,`school`,`where`,`said`,`are`,`house`,`friend`],t=[{tens:2,ones:1},{tens:1,ones:5},{tens:3,ones:4},{tens:4,ones:5},{tens:6,ones:2}],n=`abcdefghijklmnopqrstuvwxyz`,r=document.querySelector(`#app`),i=`home`,a=0,o=!1,s=!1,c=``,l=[],u=[],d=0,f=``,p=``,m=`tens`;function h(){u.forEach(e=>clearTimeout(e)),u=[],speechSynthesis.cancel()}function g(e,t){u.push(setTimeout(t,e))}function _(e){let t=new SpeechSynthesisUtterance(e);t.rate=.75,speechSynthesis.speak(t)}function v(e){return e.map(e=>({item:e,sort:Math.random()})).sort((e,t)=>e.sort-t.sort).map(({item:e})=>e)}function y(e){let t=v(n.split(``)).filter(t=>!e.includes(t)).slice(0,e.length<5?3:2);return v([...e.split(``),...t])}function b(){i=`spelling`,a=0,x(e[0])}function x(e){h(),o=!1,s=!0,c=``,l=y(e),D(),g(5e3,()=>{_(e),g(2e3,()=>{_(e),g(2e3,()=>{_(e),g(1200,()=>{o=!0,s=!1,D()})})})})}function S(){h(),i=`maths`,d=0,f=``,p=``,m=`tens`,D()}function C(e,t){return Array.from({length:e},()=>t===`ten`?`<span class="rod"></span>`:`<span class="cube"></span>`).join(``)}function w(){r.innerHTML=`
    <main class="card">
      <p class="week">Austin</p>
      <h1 class="word">Homework</h1>
      <p class="progress">Pick one</p>
      <button class="big next" id="spell">Spellings</button>
      <button class="big next-word" id="maths">Maths</button>
    </main>
  `,document.querySelector(`#spell`).onclick=b,document.querySelector(`#maths`).onclick=S}function T(){let t=e[a],n=o&&!s,u=n&&c.length>0;r.innerHTML=`
    <main class="card">
      <p class="week">Spellings</p>
      <p class="progress">Word ${a+1} of ${e.length}</p>
      <h1 class="word">${o?`⭐`.repeat(Math.min(t.length,6)):t}</h1>
      <div class="answer">${c||(n?`tap the letters`:`watch and listen`)}</div>
      <p id="result"></p>
      <div class="tiles">
        ${l.map(e=>`<button class="tile" ${n?``:`disabled`}>${e}</button>`).join(``)}
      </div>
      <button class="big next" id="check" ${u?``:`disabled`}>Check</button>
      <div class="row">
        <button class="big" id="again">Again</button>
        <button class="big next-word" id="next">Next word</button>
      </div>
      <button class="big" id="home">Home</button>
    </main>
  `,document.querySelectorAll(`.tile`).forEach(e=>{e.onclick=()=>{n&&(c+=e.textContent,D())}}),document.querySelector(`#check`).onclick=()=>{if(!u)return;let e=document.querySelector(`#result`);c===t?(e.textContent=`Yes! Well done`,e.className=`ok`,_(`Well done`)):(c=``,l=y(t),D(),document.querySelector(`#result`).textContent=`Try again`,document.querySelector(`#result`).className=`no`)},document.querySelector(`#again`).onclick=()=>x(t),document.querySelector(`#next`).onclick=()=>{a=(a+1)%e.length,x(e[a])},document.querySelector(`#home`).onclick=()=>{h(),i=`home`,D()}}function E(){let e=t[d],n=f!==``&&p!==``;r.innerHTML=`
    <main class="card">
      <p class="week">Make and Count</p>
      <p class="progress">Question ${d+1} of ${t.length}</p>
      <div class="build">
        <div class="rods">${C(e.tens,`ten`)}</div>
        <div class="ones">${C(e.ones,`one`)}</div>
      </div>
      <p class="sum-line ${m===`tens`?`on`:``}">
        There ${e.tens===1?`is`:`are`}
        <span class="blank">${f||`?`}</span>
        ${e.tens===1?`ten`:`tens`}.
      </p>
      <p class="sum-line ${m===`ones`?`on`:``}">
        There ${e.ones===1?`is`:`are`}
        <span class="blank">${p||`?`}</span>
        ${e.ones===1?`one`:`ones`}.
      </p>
      <p id="result"></p>
      <div class="row">
        <button class="big" id="pick-tens">Tens</button>
        <button class="big" id="pick-ones">Ones</button>
      </div>
      <div class="tiles">
        ${[0,1,2,3,4,5,6,7,8,9].map(e=>`<button class="tile num">${e}</button>`).join(``)}
      </div>
      <button class="big next" id="check" ${n?``:`disabled`}>Check</button>
      <div class="row">
        <button class="big" id="clear">Clear</button>
        <button class="big next-word" id="next">Next</button>
      </div>
      <button class="big" id="home">Home</button>
    </main>
  `,document.querySelector(`#pick-tens`).onclick=()=>{m=`tens`,D()},document.querySelector(`#pick-ones`).onclick=()=>{m=`ones`,D()},document.querySelectorAll(`.num`).forEach(e=>{e.onclick=()=>{m===`tens`?f=e.textContent:p=e.textContent,D()}}),document.querySelector(`#check`).onclick=()=>{let t=document.querySelector(`#result`);Number(f)===e.tens&&Number(p)===e.ones?(t.textContent=`Yes! Well done`,t.className=`ok`,_(`Well done`)):(t.textContent=`Try again`,t.className=`no`)},document.querySelector(`#clear`).onclick=()=>{f=``,p=``,m=`tens`,D()},document.querySelector(`#next`).onclick=()=>{d=(d+1)%t.length,f=``,p=``,m=`tens`,D()},document.querySelector(`#home`).onclick=()=>{i=`home`,D()}}function D(){i===`home`?w():i===`spelling`?T():E()}D();