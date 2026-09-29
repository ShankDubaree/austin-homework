(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`sniff`,`well`,`across`,`class`,`click`,`smack`,`kitchen`,`crutch`,`was`,`said`],t=[{left:12,right:35},{left:8,right:10},{left:43,right:27},{left:88,right:91},{left:36,right:41},{left:77,right:77},{left:28,right:92},{left:21,right:98},{left:46,right:32},{left:58,right:57},{left:88,right:56},{left:96,right:95},{left:22,right:22},{left:16,right:16}],n=`abcdefghijklmnopqrstuvwxyz`,r=document.querySelector(`#app`),i=`baxter`,a=`/austin-homework/hero.png`,o=`/austin-homework/Harvest%20Assembly.MP4`,s=0,c=!1,l=!1,u=``,d=[],f=[],p=0,m=``,h=`login`,g=0,_=!1,v=``,y=``,b=0,x=0,S={},C={},w=`spell`;function T(e){return e.length}function E(){return e.reduce((e,t)=>e+t.length,0)}function D(e){return e.left>e.right?`>`:e.left<e.right?`<`:`=`}function O(){try{return JSON.parse(localStorage.getItem(`austin-scores`)||`[]`)}catch{return[]}}function k(){let e=O();e.unshift({when:new Date().toLocaleString(),spell:b,spellMax:E(),maths:x,mathsMax:t.length}),localStorage.setItem(`austin-scores`,JSON.stringify(e.slice(0,20)))}function A(){return O()[0]}function j(e,t){let n=t?Math.round(e/t*5):0;return`★`.repeat(n)+`☆`.repeat(5-n)}function M(){for(let e=0;e<48;e++){let t=document.createElement(`div`);t.className=`bit`,t.style.left=Math.random()*100+`vw`,t.style.background=[`#c41e3a`,`#f4d35e`,`#2d5bff`,`#fff`][e%4],t.style.animationDelay=Math.random()*.4+`s`,document.body.appendChild(t),setTimeout(()=>t.remove(),2500)}}function N(e){let t=document.createElement(`div`);t.className=`flash-ok`,t.textContent=`Correct Well Done!`,document.body.appendChild(t),F(1400,()=>{t.remove(),e()})}function P(){f.forEach(e=>clearTimeout(e)),f=[];try{speechSynthesis.cancel()}catch{}}function F(e,t){f.push(setTimeout(t,e))}function I(e){_=!0,h===`spell`&&U(),F(850,()=>{_=!1,h===`spell`&&U()});try{speechSynthesis.cancel();let t=new SpeechSynthesisUtterance(e);t.rate=.75,speechSynthesis.speak(t)}catch{}}function L(e){return e.map(e=>({item:e,sort:Math.random()})).sort((e,t)=>e.sort-t.sort).map(({item:e})=>e)}function R(e){let t=L(n.split(``)).filter(t=>!e.includes(t)).slice(0,e.length<5?3:2);return L([...e.split(``),...t])}function z(){let t=e[s];P(),c=!1,l=!0,u=``,d=R(t),g=5,_=!1,U();function n(){F(1e3,()=>{--g,g>0?(U(),n()):(I(t),F(2e3,()=>{I(t),F(2e3,()=>{I(t),F(800,()=>{c=!0,l=!1,U()})})}),U())})}n()}function B(){w=`spell`,k(),h=`result`,U(),b===E()&&M()}function V(){w=`maths`,k(),h=`result`,U(),x===t.length&&M()}function H(){let e=document.querySelector(`#harvest-clip`);if(!e)return;e.muted=!1;let t=e.play();t&&t.catch&&t.catch(function(){})}function U(){if(h===`login`){r.innerHTML=`
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
    `;return}if(h===`pass`){r.innerHTML=`
      <main class="card">
        <p class="week">Austin</p>
        <div class="login-wrap">
          <div class="hero-btn"><img src="${a}" alt="Austin" /></div>
        </div>
        <p class="progress">Type the password</p>
        <div class="answer">${v||`••••••`}</div>
        <p id="result" class="${y?`no`:``}">${y}</p>
        <div class="tiles">
          ${`abcdefghijklmnopqrstuvwxyz`.split(``).map(e=>`<div class="tile" data-act="pass-letter" data-val="${e}">${e}</div>`).join(``)}
        </div>
        <div class="big next" data-act="pass-go">Go</div>
        <div class="row">
          <div class="big" data-act="pass-clear">Clear</div>
          <div class="big next-word" data-act="logout">Back</div>
        </div>
      </main>
    `;return}if(h===`home`){let e=A();r.innerHTML=`
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
    `;return}if(h===`harvest`){r.innerHTML=`
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
          loop
          src="${o}"
        ></video>
        <div class="big" data-act="home">Home</div>
      </main>
    `,H();return}if(h===`result`){let e=w===`spell`?b:x,n=w===`spell`?E():t.length;r.innerHTML=`
      <main class="card">
        <p class="week">Hero score</p>
        <div class="login-wrap">
          <div class="hero-btn"><img src="${a}" alt="Austin" /></div>
        </div>
        <div class="score-big">${e} / ${n}</div>
        <div class="stars">${j(e,n)}</div>
        <p class="progress">Saved on this tablet</p>
        <div class="big next" data-act="home">Home</div>
        <div class="big next-word" data-act="${w}">Play again</div>
      </main>
    `;return}if(h===`spell`){let t=e[s],n=c&&!l&&g===0,i=n&&u.length>0;r.innerHTML=`
      <main class="card">
        <p class="week">Spellings · ${b} pts</p>
        <p class="progress">Word ${s+1} of ${e.length} · ${T(t)} pts</p>
        <p class="rule">After a single vowel, z l f s double: zz ll ff ss</p>
        ${g>0?`<div class="count">${g}</div>`:``}
        <h1 class="word ${_?`pulse`:``}">${c?`⭐`.repeat(Math.min(t.length,6)):t}</h1>
        <div class="answer">${g>0?`look at the word`:u||(n?`tap the letters`:`watch and listen`)}</div>
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
      <p class="week">Which is bigger?</p>
      <p class="progress">${p+1} of ${t.length} · ${x} pts</p>
      <div class="compare">
        <span class="cmp-num">${n.left}</span>
        <span class="cmp-box">${m||`?`}</span>
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
  `}function W(n,r){if(n){if(n===`logout`){h=`login`,v=``,y=``,P(),U();return}if(n===`pick-austin`){h=`pass`,v=``,y=``,U();return}if(n===`pass-letter`){v+=r,y=``,U();return}if(n===`pass-clear`){v=``,y=``,U();return}if(n===`pass-go`){v===i?(h=`home`,v=``,y=``):(y=`Try again`,v=``),U();return}if(n===`home`){h=`home`,P(),U();return}if(n===`harvest`){h=`harvest`,P(),U();return}if(n===`spell`){h=`spell`,s=0,b=0,S={},z();return}if(n===`maths`){h=`maths`,p=0,m=``,x=0,C={},P(),U();return}if(n===`hear`){I(e[s]);return}if(n===`letter`){if(!c||l||g>0)return;u+=r,U();return}if(n===`check-spell`){let t=e[s],n=document.querySelector(`#result`);u===t?(S[s]||(b+=T(t),S[s]=!0),n.textContent=`Correct Well Done!`,n.className=`ok`,I(`Well done`),N(()=>{s>=e.length-1?B():(s+=1,z())})):(u=``,d=R(t),U(),document.querySelector(`#result`).textContent=`Try again`,document.querySelector(`#result`).className=`no`);return}if(n===`again`){z();return}if(n===`next-word`){s>=e.length-1?B():(s+=1,z());return}if(n===`cmp`){m=r,U();let e=t[p];if(r===D(e))C[p]||(x+=1,C[p]=!0),I(`Well done`),N(()=>{p>=t.length-1?V():(p+=1,m=``,U())});else{let e=document.querySelector(`#result`);e.textContent=`Try again`,e.className=`no`}}}}function G(e){let t=e;for(;t&&t!==r;){if(t.getAttribute&&t.getAttribute(`data-act`))return t;t=t.parentNode}return null}r.onclick=function(e){let t=G(e.target);t&&(t.className||``).indexOf(`off`)===-1&&W(t.getAttribute(`data-act`),t.getAttribute(`data-val`))},U();