(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`some`,`come`,`were`,`your`,`school`,`where`,`said`,`are`,`house`,`friend`],t=[{tens:2,ones:1},{tens:1,ones:5},{tens:3,ones:4},{tens:4,ones:5},{tens:6,ones:2}],n=`abcdefghijklmnopqrstuvwxyz`,r=document.querySelector(`#app`),i=`home`,a=0,o=!1,s=!1,c=``,l=[],u=[],d=0,f=``,p=``,m=`tens`;function h(){u.forEach(e=>clearTimeout(e)),u=[],speechSynthesis.cancel()}function g(e,t){u.push(setTimeout(t,e))}function _(e){let t=new SpeechSynthesisUtterance(e);t.rate=.75,speechSynthesis.speak(t)}function v(e){return e.map(e=>({item:e,sort:Math.random()})).sort((e,t)=>e.sort-t.sort).map(({item:e})=>e)}function y(e){let t=v(n.split(``)).filter(t=>!e.includes(t)).slice(0,e.length<5?3:2);return v([...e.split(``),...t])}function b(){i=`spelling`,a=0,x(e[0])}function x(e){h(),o=!1,s=!0,c=``,l=y(e),L(),g(5e3,()=>{_(e),g(2e3,()=>{_(e),g(2e3,()=>{_(e),g(1200,()=>{o=!0,s=!1,L()})})})})}function S(){h(),i=`maths`,d=0,f=``,p=``,m=`tens`,L()}function C(){h(),i=`home`,L()}function w(){a=(a+1)%e.length,x(e[a])}function T(e){!o||s||e.disabled||(c+=e.textContent,L())}function E(){let t=e[a];if(!c)return;let n=document.querySelector(`#result`);c===t?(n.textContent=`Yes! Well done`,n.className=`ok`,_(`Well done`)):(c=``,l=y(t),L(),document.querySelector(`#result`).textContent=`Try again`,document.querySelector(`#result`).className=`no`)}function D(){m=`tens`,L()}function O(){m=`ones`,L()}function k(e){m===`tens`?f=e.textContent:p=e.textContent,L()}function A(){let e=t[d],n=document.querySelector(`#result`);Number(f)===e.tens&&Number(p)===e.ones?(n.textContent=`Yes! Well done`,n.className=`ok`,_(`Well done`)):(n.textContent=`Try again`,n.className=`no`)}function j(){f=``,p=``,m=`tens`,L()}function M(){d=(d+1)%t.length,f=``,p=``,m=`tens`,L()}function N(e,t){return Array.from({length:e},()=>t===`ten`?`<span class="rod"></span>`:`<span class="cube"></span>`).join(``)}function P(){r.innerHTML=`
    <main class="card">
      <p class="week">Austin</p>
      <h1 class="word">Homework</h1>
      <p class="progress">Pick one</p>
      <button type="button" class="big next" onclick="startSpelling()">Spellings</button>
      <button type="button" class="big next-word" onclick="startMaths()">Maths</button>
    </main>
  `}function F(){let t=e[a],n=o&&!s,i=n&&c.length>0;r.innerHTML=`
    <main class="card">
      <p class="week">Spellings</p>
      <p class="progress">Word ${a+1} of ${e.length}</p>
      <h1 class="word">${o?`⭐`.repeat(Math.min(t.length,6)):t}</h1>
      <div class="answer">${c||(n?`tap the letters`:`watch and listen`)}</div>
      <p id="result"></p>
      <div class="tiles">
        ${l.map(e=>`<button type="button" class="tile" onclick="addLetter(this)" ${n?``:`disabled`}>${e}</button>`).join(``)}
      </div>
      <button type="button" class="big next" onclick="checkSpelling()" ${i?``:`disabled`}>Check</button>
      <div class="row">
        <button type="button" class="big" onclick="startSequence(words[index])">Again</button>
        <button type="button" class="big next-word" onclick="nextWord()">Next word</button>
      </div>
      <button type="button" class="big" onclick="goHome()">Home</button>
    </main>
  `}function I(){let e=t[d],n=f!==``&&p!==``;r.innerHTML=`
    <main class="card">
      <p class="week">Make and Count</p>
      <p class="progress">Question ${d+1} of ${t.length}</p>
      <div class="build">
        <div class="rods">${N(e.tens,`ten`)}</div>
        <div class="ones">${N(e.ones,`one`)}</div>
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
        <button type="button" class="big" onclick="pickTens()">Tens</button>
        <button type="button" class="big" onclick="pickOnes()">Ones</button>
      </div>
      <div class="tiles">
        ${[0,1,2,3,4,5,6,7,8,9].map(e=>`<button type="button" class="tile num" onclick="addNumber(this)">${e}</button>`).join(``)}
      </div>
      <button type="button" class="big next" onclick="checkMaths()" ${n?``:`disabled`}>Check</button>
      <div class="row">
        <button type="button" class="big" onclick="clearMaths()">Clear</button>
        <button type="button" class="big next-word" onclick="nextMaths()">Next</button>
      </div>
      <button type="button" class="big" onclick="goHome()">Home</button>
    </main>
  `}function L(){i===`home`?P():i===`spelling`?F():I()}window.startSpelling=b,window.startMaths=S,window.startSequence=x,window.goHome=C,window.nextWord=w,window.addLetter=T,window.checkSpelling=E,window.pickTens=D,window.pickOnes=O,window.addNumber=k,window.checkMaths=A,window.clearMaths=j,window.nextMaths=M,window.words=e,L();