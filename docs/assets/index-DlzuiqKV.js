(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`sniff`,`well`,`across`,`class`,`click`,`smack`,`kitchen`,`crutch`,`was`,`said`],t=[{left:12,right:35},{left:8,right:10},{left:43,right:27},{left:88,right:91},{left:36,right:41},{left:77,right:77},{left:28,right:92},{left:21,right:98},{left:46,right:32},{left:58,right:57},{left:88,right:56},{left:96,right:95},{left:22,right:22},{left:16,right:16}],n=`abcdefghijklmnopqrstuvwxyz`,r=document.querySelector(`#app`),i=`baxter`,a=`/austin-homework/hero.png`,o=`/austin-homework/Harvest%20Assembly.MP4`,s=0,c=!1,l=!1,u=``,d=[],f=[],p=0,m=`login`,h=0,g=!1,_=``,v=``,y=0,b=0,x={},S={},C=`spell`;function w(e){return e.length}function T(){return e.reduce((e,t)=>e+t.length,0)}function E(e){return e.left>e.right?`>`:e.left<e.right?`<`:`=`}function D(){try{return JSON.parse(localStorage.getItem(`austin-scores`)||`[]`)}catch{return[]}}function O(){let e=D();e.unshift({when:new Date().toLocaleString(),spell:y,spellMax:T(),maths:b,mathsMax:t.length}),localStorage.setItem(`austin-scores`,JSON.stringify(e.slice(0,20)))}function k(){return D()[0]}function A(e,t){let n=t?Math.round(e/t*5):0;return`★`.repeat(n)+`☆`.repeat(5-n)}function j(){for(let e=0;e<48;e++){let t=document.createElement(`div`);t.className=`bit`,t.style.left=Math.random()*100+`vw`,t.style.background=[`#c41e3a`,`#f4d35e`,`#2d5bff`,`#fff`][e%4],t.style.animationDelay=Math.random()*.4+`s`,document.body.appendChild(t),setTimeout(()=>t.remove(),2500)}}function M(e){let t=document.createElement(`div`);t.className=`flash-ok`,t.textContent=`Correct Well Done!`,document.body.appendChild(t),P(1400,()=>{t.remove(),e()})}function N(){f.forEach(e=>clearTimeout(e)),f=[];try{speechSynthesis.cancel()}catch{}}function P(e,t){f.push(setTimeout(t,e))}function F(e){g=!0,m===`spell`&&H(),P(850,()=>{g=!1,m===`spell`&&H()});try{speechSynthesis.cancel();let t=new SpeechSynthesisUtterance(e);t.rate=.75,speechSynthesis.speak(t)}catch{}}function I(e){return e.map(e=>({item:e,sort:Math.random()})).sort((e,t)=>e.sort-t.sort).map(({item:e})=>e)}function L(e){let t=I(n.split(``)).filter(t=>!e.includes(t)).slice(0,e.length<5?3:2);return I([...e.split(``),...t])}function R(){let t=e[s];N(),c=!1,l=!0,u=``,d=L(t),h=5,g=!1,H();function n(){P(1e3,()=>{--h,h>0?(H(),n()):(F(t),P(2e3,()=>{F(t),P(2e3,()=>{F(t),P(800,()=>{c=!0,l=!1,H()})})}),H())})}n()}function z(){C=`spell`,O(),m=`result`,H(),y===T()&&j()}function B(){C=`maths`,O(),m=`result`,H(),b===t.length&&j()}function V(){let e=document.querySelector(`#harvest-clip`);if(!e)return;e.muted=!0;let t=e.play();t&&t.catch&&t.catch(function(){})}function H(){if(m===`login`){r.innerHTML=`
      <main class="card">
        <p class="week">Homework</p>
        <h1 class="word">Who is it?</h1>
        <div class="login-wrap">
          <div class="hero-btn" data-act="pick-austin">
            <img src="${a}" alt="Austin" />
          </div>
          <div class="big next" data-act="pick-austin">Austin</div>
        </div>
      </main>
    `;return}if(m===`pass`){r.innerHTML=`
      <main class="card">
        <p class="week">Austin</p>
        <div class="login-wrap">
          <div class="hero-btn"><img src="${a}" alt="Austin" /></div>
        </div>
        <p class="progress">Type the password</p>
        <div class="answer">${_||`••••••`}</div>
        <p id="result" class="${v?`no`:``}">${v}</p>
        <div class="tiles">
          ${`abcdefghijklmnopqrstuvwxyz`.split(``).map(e=>`<div class="tile" data-act="pass-letter" data-val="${e}">${e}</div>`).join(``)}
        </div>
        <div class="big next" data-act="pass-go">Go</div>
        <div class="row">
          <div class="big" data-act="pass-clear">Clear</div>
          <div class="big next-word" data-act="logout">Back</div>
        </div>
      </main>
    `;return}if(m===`home`){let e=k();r.innerHTML=`
      <main class="card">
        <div class="login-wrap">
          <div class="hero-btn"><img src="${a}" alt="Austin" /></div>
        </div>
        <p class="week">Austin</p>
        <h1 class="word">Homework</h1>
        <p class="progress">${e?`Last time: spellings ${e.spell}/${e.spellMax} · maths ${e.maths}/${e.mathsMax}`:`Pick one`}</p>
        <div class="big next" data-act="spell">Spellings</div>
        <div class="big next-word" data-act="maths">Greater or less</div>
        <div class="big next-word" data-act="harvest">Harvest Assembly Line</div>
        <div class="big" data-act="logout">Log out</div>
      </main>
    `;return}if(m===`harvest`){r.innerHTML=`
      <main class="card">
        <p class="week">Harvest</p>
        <h1 class="word">Assembly line</h1>
        <p class="progress">Watch and learn</p>
        <video
          id="harvest-clip"
          class="clip"
          controls
          playsinline
          autoplay
          muted
          loop
          src="${o}"
        ></video>
        <div class="big" data-act="home">Home</div>
      </main>
    `,V();return}if(m===`result`){let e=C===`spell`?y:b,n=C===`spell`?T():t.length;r.innerHTML=`
      <main class="card">
        <p class="week">Hero score</p>
        <div class="login-wrap">
          <div class="hero-btn"><img src="${a}" alt="Austin" /></div>
        </div>
        <div class="score-big">${e} / ${n}</div>
        <div class="stars">${A(e,n)}</div>
        <p class="progress">Saved on this tablet</p>
        <div class="big next" data-act="home">Home</div>
        <div class="big next-word" data-act="${C}">Play again</div>
      </main>
    `;return}if(m===`spell`){let t=e[s],n=c&&!l&&h===0,i=n&&u.length>0;r.innerHTML=`
      <main class="card">
        <p class="week">Spellings · ${y} pts</p>
        <p class="progress">Word ${s+1} of ${e.length} · ${w(t)} pts</p>
        <p class="rule">After a single vowel, z l f s double: zz ll ff ss</p>
        ${h>0?`<div class="count">${h}</div>`:``}
        <h1 class="word ${g?`pulse`:``}">${c?`⭐`.repeat(Math.min(t.length,6)):t}</h1>
        <div class="answer">${h>0?`look at the word`:u||(n?`tap the letters`:`watch and listen`)}</div>
        <p id="result"></p>
        <div class="tiles">
          ${d.map(e=>`<div class="tile ${n?``:`off`}" data-act="letter" data-val="${e}">${e}</div>`).join(``)}
        </div>
        <div class="big next-word" data-act="hear">Hear the word</div>
        <div class="big next ${i?``:`off`}" data-act="check-spell">Check</div>
        <div class="row">
          <div class="big" data-act="again">Again</div>
          <div class="big next-word" data-act="next-word">Next word</div>
        </div>
        <div class="big" data-act="home">Home</div>
      </main>
    `;return}let n=t[p];r.innerHTML=`
    <main class="card">
      <p class="week">Greater or less · ${b} pts</p>
      <p class="progress">Question ${p+1} of ${t.length}</p>
      <p class="progress">Open side faces the bigger number</p>
      <div class="compare">
        <span class="cmp-num">${n.left}</span>
        <span class="cmp-box">?</span>
        <span class="cmp-num">${n.right}</span>
      </div>
      <p id="result"></p>
      <div class="row3">
        <div class="big next" data-act="cmp" data-val="&lt;">&lt;</div>
        <div class="big" data-act="cmp" data-val="=">=</div>
        <div class="big next-word" data-act="cmp" data-val="&gt;">&gt;</div>
      </div>
      <p class="progress">less &nbsp;&nbsp; equal &nbsp;&nbsp; more</p>
      <div class="big" data-act="home">Home</div>
    </main>
  `}function U(n,r){if(n){if(n===`logout`){m=`login`,_=``,v=``,N(),H();return}if(n===`pick-austin`){m=`pass`,_=``,v=``,H();return}if(n===`pass-letter`){_+=r,v=``,H();return}if(n===`pass-clear`){_=``,v=``,H();return}if(n===`pass-go`){_===i?(m=`home`,_=``,v=``):(v=`Try again`,_=``),H();return}if(n===`home`){m=`home`,N(),H();return}if(n===`harvest`){m=`harvest`,N(),H();return}if(n===`spell`){m=`spell`,s=0,y=0,x={},R();return}if(n===`maths`){m=`maths`,p=0,b=0,S={},N(),H();return}if(n===`hear`){F(e[s]);return}if(n===`letter`){if(!c||l||h>0)return;u+=r,H();return}if(n===`check-spell`){let t=e[s],n=document.querySelector(`#result`);u===t?(x[s]||(y+=w(t),x[s]=!0),n.textContent=`Correct Well Done!`,n.className=`ok`,F(`Well done`),M(()=>{s>=e.length-1?z():(s+=1,R())})):(u=``,d=L(t),H(),document.querySelector(`#result`).textContent=`Try again`,document.querySelector(`#result`).className=`no`);return}if(n===`again`){R();return}if(n===`next-word`){s>=e.length-1?z():(s+=1,R());return}if(n===`cmp`){let e=t[p];if(r===E(e))S[p]||(b+=1,S[p]=!0),F(`Well done`),M(()=>{p>=t.length-1?B():(p+=1,H())});else{let e=document.querySelector(`#result`);e.textContent=`Try again`,e.className=`no`}}}}function W(e){let t=e;for(;t&&t!==r;){if(t.getAttribute&&t.getAttribute(`data-act`))return t;t=t.parentNode}return null}r.onclick=function(e){let t=W(e.target);t&&(t.className||``).indexOf(`off`)===-1&&U(t.getAttribute(`data-act`),t.getAttribute(`data-val`))},H();