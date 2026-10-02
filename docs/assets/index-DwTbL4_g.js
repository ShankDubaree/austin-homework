(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`have`,`give`,`smells`,`jumps`,`catches`,`splashes`,`playground`,`bedroom`,`some`,`come`],t=[{left:14,right:41},{left:9,right:6},{left:52,right:52},{left:33,right:39},{left:70,right:17},{left:25,right:85},{left:64,right:46},{left:19,right:19},{left:81,right:18},{left:47,right:74},{left:90,right:99},{left:31,right:13},{left:55,right:55},{left:26,right:62}],n=`abcdefghijklmnopqrstuvwxyz`,r=document.querySelector(`#app`),i=`baxter`,a=`/austin-homework/hero.png`,o=0,s=!1,c=!1,l=``,u=[],d=[],f=0,p=``,m=`login`,h=0,g=!1,_=``,v=``,y=0,b=0,x={},S={},C=`spell`;function w(e){return e.length}function T(){return e.reduce((e,t)=>e+t.length,0)}function E(e){return e.left>e.right?`>`:e.left<e.right?`<`:`=`}function D(){try{return JSON.parse(localStorage.getItem(`austin-scores`)||`[]`)}catch{return[]}}function O(){let e=D();e.unshift({when:new Date().toLocaleString(),spell:y,spellMax:T(),maths:b,mathsMax:t.length}),localStorage.setItem(`austin-scores`,JSON.stringify(e.slice(0,20)))}function k(){return D()[0]}function A(e,t){let n=t?Math.round(e/t*5):0;return`★`.repeat(n)+`☆`.repeat(5-n)}function j(){for(let e=0;e<48;e++){let t=document.createElement(`div`);t.className=`bit`,t.style.left=Math.random()*100+`vw`,t.style.background=[`#c41e3a`,`#f4d35e`,`#2d5bff`,`#fff`][e%4],t.style.animationDelay=Math.random()*.4+`s`,document.body.appendChild(t),setTimeout(()=>t.remove(),2500)}}function M(e){let t=document.createElement(`div`);t.className=`flash-ok`,t.textContent=`Correct Well Done!`,document.body.appendChild(t),P(1400,()=>{t.remove(),e()})}function N(){d.forEach(e=>clearTimeout(e)),d=[];try{speechSynthesis.cancel()}catch{}}function P(e,t){d.push(setTimeout(t,e))}function F(e){g=!0,m===`spell`&&V(),P(850,()=>{g=!1,m===`spell`&&V()});try{speechSynthesis.cancel();let t=new SpeechSynthesisUtterance(e);t.rate=.75,speechSynthesis.speak(t)}catch{}}function I(e){return e.map(e=>({item:e,sort:Math.random()})).sort((e,t)=>e.sort-t.sort).map(({item:e})=>e)}function L(e){let t=I(n.split(``)).filter(t=>!e.includes(t)).slice(0,e.length<5?3:2);return I([...e.split(``),...t])}function R(){let t=e[o];N(),s=!1,c=!0,l=``,u=L(t),h=5,g=!1,V();function n(){P(1e3,()=>{--h,h>0?(V(),n()):(F(t),P(2e3,()=>{F(t),P(2e3,()=>{F(t),P(800,()=>{s=!0,c=!1,V()})})}),V())})}n()}function z(){C=`spell`,O(),m=`result`,V(),y===T()&&j()}function B(){C=`maths`,O(),m=`result`,V(),b===t.length&&j()}function V(){if(m===`login`){r.innerHTML=`
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
        <div class="big spell-btn" data-act="spell">Spellings</div>
        <div class="big maths-btn" data-act="maths">Greater or less</div>
        <div class="big" data-act="logout">Log out</div>
      </main>
    `;return}if(m===`result`){let e=C===`spell`?y:b,n=C===`spell`?T():t.length;r.innerHTML=`
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
    `;return}if(m===`spell`){let t=e[o],n=s&&!c&&h===0,i=n&&l.length>0;r.innerHTML=`
      <main class="card">
        <p class="week">Spellings · ${y} pts</p>
        <p class="progress">Word ${o+1} of ${e.length} · ${w(t)} pts</p>
        ${h>0?`<div class="count">${h}</div>`:``}
        <h1 class="word ${g?`pulse`:``}">${s?`⭐`.repeat(Math.min(t.length,6)):t}</h1>
        <div class="answer">${h>0?`look at the word`:l||(n?`tap the letters`:`watch and listen`)}</div>
        <p id="result"></p>
        <div class="tiles">
          ${u.map(e=>`<div class="tile ${n?``:`off`}" data-act="letter" data-val="${e}">${e}</div>`).join(``)}
        </div>
        <div class="big next-word" data-act="hear">Hear the word</div>
        <div class="big next ${i?``:`off`}" data-act="check-spell">Check</div>
        <div class="row">
          <div class="big" data-act="again">Again</div>
          <div class="big next-word" data-act="next-word">Next word</div>
        </div>
        <div class="big" data-act="home">Home</div>
      </main>
    `;return}let n=t[f];r.innerHTML=`
    <main class="card">
      <p class="week">Which is bigger?</p>
      <p class="progress">${f+1} of ${t.length} · ${b} pts</p>
      <div class="compare">
        <span class="cmp-num">${n.left}</span>
        <span class="cmp-box">${p||`?`}</span>
        <span class="cmp-num">${n.right}</span>
      </div>
      <p class="hint">The open side eats the bigger number</p>
      <p id="result"></p>
      <div class="row3">
        <div class="cmp-btn cmp-less" data-act="cmp" data-val="&lt;">
          <span class="sign">&lt;</span>
          <span>less</span>
        </div>
        <div class="cmp-btn cmp-same" data-act="cmp" data-val="=">
          <span class="sign">=</span>
          <span>same</span>
        </div>
        <div class="cmp-btn cmp-more" data-act="cmp" data-val="&gt;">
          <span class="sign">&gt;</span>
          <span>more</span>
        </div>
      </div>
      <div class="big" data-act="home">Home</div>
    </main>
  `}function H(n,r){if(n){if(n===`logout`){m=`login`,_=``,v=``,N(),V();return}if(n===`pick-austin`){m=`pass`,_=``,v=``,V();return}if(n===`pass-letter`){_+=r,v=``,V();return}if(n===`pass-clear`){_=``,v=``,V();return}if(n===`pass-go`){_===i?(m=`home`,_=``,v=``):(v=`Try again`,_=``),V();return}if(n===`home`){m=`home`,N(),V();return}if(n===`spell`){m=`spell`,o=0,y=0,x={},R();return}if(n===`maths`){m=`maths`,f=0,p=``,b=0,S={},N(),V();return}if(n===`hear`){F(e[o]);return}if(n===`letter`){if(!s||c||h>0)return;l+=r,V();return}if(n===`check-spell`){let t=e[o],n=document.querySelector(`#result`);l===t?(x[o]||(y+=w(t),x[o]=!0),n.textContent=`Correct Well Done!`,n.className=`ok`,F(`Well done`),M(()=>{o>=e.length-1?z():(o+=1,R())})):(l=``,u=L(t),V(),document.querySelector(`#result`).textContent=`Try again`,document.querySelector(`#result`).className=`no`);return}if(n===`again`){R();return}if(n===`next-word`){o>=e.length-1?z():(o+=1,R());return}if(n===`cmp`){p=r,V();let e=t[f];if(r===E(e))S[f]||(b+=1,S[f]=!0),F(`Well done`),M(()=>{f>=t.length-1?B():(f+=1,p=``,V())});else{let e=document.querySelector(`#result`);e.textContent=`Try again`,e.className=`no`}}}}function U(e){let t=e;for(;t&&t!==r;){if(t.getAttribute&&t.getAttribute(`data-act`))return t;t=t.parentNode}return null}r.onclick=function(e){let t=U(e.target);t&&(t.className||``).indexOf(`off`)===-1&&H(t.getAttribute(`data-act`),t.getAttribute(`data-val`))},V();