(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`some`,`come`,`were`,`your`,`school`,`where`,`said`,`are`,`house`,`friend`],t=[{tens:2,ones:1},{tens:1,ones:5},{tens:3,ones:4},{tens:4,ones:5},{tens:6,ones:2}],n=`abcdefghijklmnopqrstuvwxyz`,r=document.querySelector(`#app`),i=`home`,a=0,o=!1,s=!1,c=``,l=[],u=[],d=0,f=``,p=``,m=`tens`;function h(e,t){if(!e)return;let n=!1,r=e=>{e.preventDefault(),e.stopPropagation(),!n&&(n=!0,t(e),setTimeout(()=>{n=!1},300))};e.addEventListener(`click`,r),e.addEventListener(`touchend`,r,{passive:!1})}function g(){u.forEach(e=>clearTimeout(e)),u=[],speechSynthesis.cancel()}function _(e,t){u.push(setTimeout(t,e))}function v(e){let t=new SpeechSynthesisUtterance(e);t.rate=.75,speechSynthesis.speak(t)}function y(e){return e.map(e=>({item:e,sort:Math.random()})).sort((e,t)=>e.sort-t.sort).map(({item:e})=>e)}function b(e){let t=y(n.split(``)).filter(t=>!e.includes(t)).slice(0,e.length<5?3:2);return y([...e.split(``),...t])}function x(){i=`spelling`,a=0,S(e[0])}function S(e){g(),o=!1,s=!0,c=``,l=b(e),k(),_(5e3,()=>{v(e),_(2e3,()=>{v(e),_(2e3,()=>{v(e),_(1200,()=>{o=!0,s=!1,k()})})})})}function C(){g(),i=`maths`,d=0,f=``,p=``,m=`tens`,k()}function w(){g(),i=`home`,k()}function T(e,t){return Array.from({length:e},()=>t===`ten`?`<span class="rod"></span>`:`<span class="cube"></span>`).join(``)}function E(){r.innerHTML=`
    <main class="card">
      <p class="week">Austin</p>
      <h1 class="word">Homework</h1>
      <p class="progress">Pick one</p>
      <button type="button" class="big next" id="spell">Spellings</button>
      <button type="button" class="big next-word" id="maths">Maths</button>
    </main>
  `,h(document.querySelector(`#spell`),x),h(document.querySelector(`#maths`),C)}function D(){let t=e[a],n=o&&!s,i=n&&c.length>0;r.innerHTML=`
    <main class="card">
      <p class="week">Spellings</p>
      <p class="progress">Word ${a+1} of ${e.length}</p>
      <h1 class="word">${o?`⭐`.repeat(Math.min(t.length,6)):t}</h1>
      <div class="answer">${c||(n?`tap the letters`:`watch and listen`)}</div>
      <p id="result"></p>
      <div class="tiles">
        ${l.map(e=>`<button type="button" class="tile" ${n?``:`disabled`}>${e}</button>`).join(``)}
      </div>
      <button type="button" class="big next" id="check" ${i?``:`disabled`}>Check</button>
      <div class="row">
        <button type="button" class="big" id="again">Again</button>
        <button type="button" class="big next-word" id="next">Next word</button>
      </div>
      <button type="button" class="big" id="home">Home</button>
    </main>
  `,document.querySelectorAll(`.tile`).forEach(e=>{h(e,()=>{n&&!e.disabled&&(c+=e.textContent,k())})}),h(document.querySelector(`#check`),()=>{if(!i)return;let e=document.querySelector(`#result`);c===t?(e.textContent=`Yes! Well done`,e.className=`ok`,v(`Well done`)):(c=``,l=b(t),k(),document.querySelector(`#result`).textContent=`Try again`,document.querySelector(`#result`).className=`no`)}),h(document.querySelector(`#again`),()=>S(t)),h(document.querySelector(`#next`),()=>{a=(a+1)%e.length,S(e[a])}),h(document.querySelector(`#home`),w)}function O(){let e=t[d],n=f!==``&&p!==``;r.innerHTML=`
    <main class="card">
      <p class="week">Make and Count</p>
      <p class="progress">Question ${d+1} of ${t.length}</p>
      <div class="build">
        <div class="rods">${T(e.tens,`ten`)}</div>
        <div class="ones">${T(e.ones,`one`)}</div>
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
        <button type="button" class="big" id="pick-tens">Tens</button>
        <button type="button" class="big" id="pick-ones">Ones</button>
      </div>
      <div class="tiles">
        ${[0,1,2,3,4,5,6,7,8,9].map(e=>`<button type="button" class="tile num">${e}</button>`).join(``)}
      </div>
      <button type="button" class="big next" id="check" ${n?``:`disabled`}>Check</button>
      <div class="row">
        <button type="button" class="big" id="clear">Clear</button>
        <button type="button" class="big next-word" id="next">Next</button>
      </div>
      <button type="button" class="big" id="home">Home</button>
    </main>
  `,h(document.querySelector(`#pick-tens`),()=>{m=`tens`,k()}),h(document.querySelector(`#pick-ones`),()=>{m=`ones`,k()}),document.querySelectorAll(`.num`).forEach(e=>{h(e,()=>{m===`tens`?f=e.textContent:p=e.textContent,k()})}),h(document.querySelector(`#check`),()=>{let t=document.querySelector(`#result`);Number(f)===e.tens&&Number(p)===e.ones?(t.textContent=`Yes! Well done`,t.className=`ok`,v(`Well done`)):(t.textContent=`Try again`,t.className=`no`)}),h(document.querySelector(`#clear`),()=>{f=``,p=``,m=`tens`,k()}),h(document.querySelector(`#next`),()=>{d=(d+1)%t.length,f=``,p=``,m=`tens`,k()}),h(document.querySelector(`#home`),w)}function k(){i===`home`?E():i===`spelling`?D():O()}k();