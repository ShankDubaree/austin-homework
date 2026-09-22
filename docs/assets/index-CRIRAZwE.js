(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`some`,`come`,`were`,`your`,`school`,`where`,`said`,`are`,`house`,`friend`],t=[{tens:2,ones:1},{tens:1,ones:5},{tens:3,ones:4},{tens:4,ones:5},{tens:6,ones:2}],n=`abcdefghijklmnopqrstuvwxyz`,r=document.querySelector(`#app`),i=0,a=!1,o=!1,s=``,c=[],l=[],u=0,d=``,f=``,p=`tens`,m=`home`,h=0;function g(){l.forEach(e=>clearTimeout(e)),l=[];try{speechSynthesis.cancel()}catch{}}function _(e,t){l.push(setTimeout(t,e))}function v(t){if(e.indexOf(t)!==-1){let e=new Audio(`/austin-homework/sounds/`+t+`.mp3`);e.playsInline=!0;let n=e.play();n&&n.catch&&n.catch(function(){})}try{speechSynthesis.cancel();let e=new SpeechSynthesisUtterance(t);e.rate=.75,speechSynthesis.speak(e)}catch{}}function y(e){return e.map(e=>({item:e,sort:Math.random()})).sort((e,t)=>e.sort-t.sort).map(({item:e})=>e)}function b(e){let t=y(n.split(``)).filter(t=>!e.includes(t)).slice(0,e.length<5?3:2);return y([...e.split(``),...t])}function x(e,t){return Array.from({length:e},()=>t===`ten`?`<span class="rod"></span>`:`<span class="cube"></span>`).join(``)}function S(){let t=e[i];g(),a=!1,o=!0,s=``,c=b(t),h=5,C();function n(){_(1e3,()=>{--h,h>0?(C(),n()):(v(t),_(2e3,()=>{v(t),_(2e3,()=>{v(t),_(800,()=>{a=!0,o=!1,C()})})}),C())})}n()}function C(){if(m===`home`){r.innerHTML=`
      <main class="card">
        <p class="week">Austin</p>
        <h1 class="word">Homework</h1>
        <p class="progress">Pick one</p>
        <div class="big next" data-act="spell">Spellings</div>
        <div class="big next-word" data-act="maths">Maths</div>
      </main>
    `;return}if(m===`spell`){let t=e[i],n=a&&!o&&h===0,l=n&&s.length>0;r.innerHTML=`
      <main class="card">
        <p class="week">Spellings</p>
        <p class="progress">Word ${i+1} of ${e.length}</p>
        ${h>0?`<div class="count">${h}</div>`:``}
        <h1 class="word">${a?`⭐`.repeat(Math.min(t.length,6)):t}</h1>
        <div class="answer">${h>0?`look at the word`:s||(n?`tap the letters`:`watch and listen`)}</div>
        <p id="result"></p>
        <div class="tiles">
          ${c.map(e=>`<div class="tile ${n?``:`off`}" data-act="letter" data-val="${e}">${e}</div>`).join(``)}
        </div>
        <div class="big next-word" data-act="hear">Hear the word</div>
        <div class="big next ${l?``:`off`}" data-act="check-spell">Check</div>
        <div class="row">
          <div class="big" data-act="again">Again</div>
          <div class="big next-word" data-act="next-word">Next word</div>
        </div>
        <div class="big" data-act="home">Home</div>
      </main>
    `;return}let n=t[u],l=d!==``&&f!==``;r.innerHTML=`
    <main class="card">
      <p class="week">Make and Count</p>
      <p class="progress">Question ${u+1} of ${t.length}</p>
      <div class="build">
        <div class="rods">${x(n.tens,`ten`)}</div>
        <div class="ones">${x(n.ones,`one`)}</div>
      </div>
      <p class="sum-line ${p===`tens`?`on`:``}">
        There ${n.tens===1?`is`:`are`}
        <span class="blank">${d||`?`}</span>
        ${n.tens===1?`ten`:`tens`}.
      </p>
      <p class="sum-line ${p===`ones`?`on`:``}">
        There ${n.ones===1?`is`:`are`}
        <span class="blank">${f||`?`}</span>
        ${n.ones===1?`one`:`ones`}.
      </p>
      <p id="result"></p>
      <div class="row">
        <div class="big" data-act="tens">Tens</div>
        <div class="big" data-act="ones">Ones</div>
      </div>
      <div class="tiles">
        ${[0,1,2,3,4,5,6,7,8,9].map(e=>`<div class="tile num" data-act="num" data-val="${e}">${e}</div>`).join(``)}
      </div>
      <div class="big next ${l?``:`off`}" data-act="check-maths">Check</div>
      <div class="row">
        <div class="big" data-act="clear">Clear</div>
        <div class="big next-word" data-act="next-maths">Next</div>
      </div>
      <div class="big" data-act="home">Home</div>
    </main>
  `}function w(n,r){if(n){if(n===`home`){m=`home`,g(),C();return}if(n===`spell`){m=`spell`,i=0,S();return}if(n===`maths`){m=`maths`,u=0,d=``,f=``,p=`tens`,g(),C();return}if(n===`hear`){v(e[i]);return}if(n===`letter`){if(!a||o||h>0)return;s+=r,C();return}if(n===`check-spell`){let t=e[i],n=document.querySelector(`#result`);s===t?(n.textContent=`Yes! Well done`,n.className=`ok`,v(`Well done`)):(s=``,c=b(t),C(),document.querySelector(`#result`).textContent=`Try again`,document.querySelector(`#result`).className=`no`);return}if(n===`again`){S();return}if(n===`next-word`){i=(i+1)%e.length,S();return}if(n===`tens`){p=`tens`,C();return}if(n===`ones`){p=`ones`,C();return}if(n===`num`){p===`tens`?d=r:f=r,C();return}if(n===`check-maths`){let e=t[u],n=document.querySelector(`#result`);Number(d)===e.tens&&Number(f)===e.ones?(n.textContent=`Yes! Well done`,n.className=`ok`,v(`Well done`)):(n.textContent=`Try again`,n.className=`no`);return}if(n===`clear`){d=``,f=``,p=`tens`,C();return}n===`next-maths`&&(u=(u+1)%t.length,d=``,f=``,p=`tens`,C())}}function T(e){let t=e;for(;t&&t!==r;){if(t.getAttribute&&t.getAttribute(`data-act`))return t;t=t.parentNode}return null}r.onclick=function(e){let t=T(e.target);t&&(t.className||``).indexOf(`off`)===-1&&w(t.getAttribute(`data-act`),t.getAttribute(`data-val`))},C();