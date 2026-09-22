(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`one`,`two`,`three`,`four`,`five`,`six`,`seven`,`eight`,`nine`,`ten`],t=[{tens:2,ones:1},{tens:1,ones:5},{tens:3,ones:4},{tens:4,ones:5},{tens:6,ones:2}],n=`abcdefghijklmnopqrstuvwxyz`,r=document.querySelector(`#app`),i=`baxter`,a=`/austin-homework/hero.png`,o=0,s=!1,c=!1,l=``,u=[],d=[],f=0,p=``,m=``,h=`tens`,g=`login`,_=0,v=!1,y=``,b=``,x=0,S=0,C={},w={},T=`spell`;function E(){try{return JSON.parse(localStorage.getItem(`austin-scores`)||`[]`)}catch{return[]}}function D(){let n=E();n.unshift({when:new Date().toLocaleString(),spell:x,spellMax:e.length,maths:S,mathsMax:t.length}),localStorage.setItem(`austin-scores`,JSON.stringify(n.slice(0,20)))}function O(){return E()[0]}function k(e,t){let n=Math.round(e/t*5);return`★`.repeat(n)+`☆`.repeat(5-n)}function A(){d.forEach(e=>clearTimeout(e)),d=[];try{speechSynthesis.cancel()}catch{}}function j(e,t){d.push(setTimeout(t,e))}function M(t){if(v=!0,g===`spell`&&z(),j(850,()=>{v=!1,g===`spell`&&z()}),e.indexOf(t)!==-1){let e=new Audio(`/austin-homework/sounds/`+t+`.mp3`);e.playsInline=!0;let n=e.play();n&&n.catch&&n.catch(function(){})}try{speechSynthesis.cancel();let e=new SpeechSynthesisUtterance(t);e.rate=.75,speechSynthesis.speak(e)}catch{}}function N(e){return e.map(e=>({item:e,sort:Math.random()})).sort((e,t)=>e.sort-t.sort).map(({item:e})=>e)}function P(e){let t=N(n.split(``)).filter(t=>!e.includes(t)).slice(0,e.length<5?3:2);return N([...e.split(``),...t])}function F(e,t){return Array.from({length:e},()=>t===`ten`?`<span class="rod"></span>`:`<span class="cube"></span>`).join(``)}function I(){let t=e[o];A(),s=!1,c=!0,l=``,u=P(t),_=5,v=!1,z();function n(){j(1e3,()=>{--_,_>0?(z(),n()):(M(t),j(2e3,()=>{M(t),j(2e3,()=>{M(t),j(800,()=>{s=!0,c=!1,z()})})}),z())})}n()}function L(){T=`spell`,D(),g=`result`,z(),x===e.length&&H()}function R(){T=`maths`,D(),g=`result`,z()}function z(){if(g===`login`){r.innerHTML=`
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
    `;return}if(g===`pass`){r.innerHTML=`
      <main class="card">
        <p class="week">Austin</p>
        <div class="login-wrap">
          <div class="hero-btn"><img src="${a}" alt="Austin" /></div>
        </div>
        <p class="progress">Type the password</p>
        <div class="answer">${y||`••••••`}</div>
        <p id="result" class="${b?`no`:``}">${b}</p>
        <div class="tiles">
          ${`abcdefghijklmnopqrstuvwxyz`.split(``).map(e=>`<div class="tile" data-act="pass-letter" data-val="${e}">${e}</div>`).join(``)}
        </div>
        <div class="big next" data-act="pass-go">Go</div>
        <div class="row">
          <div class="big" data-act="pass-clear">Clear</div>
          <div class="big next-word" data-act="logout">Back</div>
        </div>
      </main>
    `;return}if(g===`home`){let e=O();r.innerHTML=`
      <main class="card">
        <div class="login-wrap">
          <div class="hero-btn"><img src="${a}" alt="Austin" /></div>
        </div>
        <p class="week">Austin</p>
        <h1 class="word">Homework</h1>
        <p class="progress">${e?`Last time: spellings ${e.spell}/${e.spellMax} · maths ${e.maths}/${e.mathsMax}`:`Pick one`}</p>
        <div class="big next" data-act="spell">Spellings</div>
        <div class="big next-word" data-act="maths">Maths</div>
        <div class="big" data-act="logout">Log out</div>
      </main>
    `;return}if(g===`result`){let n=T===`spell`?x:S,i=T===`spell`?e.length:t.length;r.innerHTML=`
      <main class="card">
        <p class="week">Hero score</p>
        <div class="login-wrap">
          <div class="hero-btn"><img src="${a}" alt="Austin" /></div>
        </div>
        <div class="score-big">${n} / ${i}</div>
        <div class="stars">${k(n,i)}</div>
        <p class="progress">Saved on this tablet</p>
        <div class="big next" data-act="home">Home</div>
        <div class="big next-word" data-act="${T}">Play again</div>
      </main>
    `;return}if(g===`spell`){let t=e[o],n=s&&!c&&_===0,i=n&&l.length>0;r.innerHTML=`
      <main class="card">
        <p class="week">Spellings · ${x} pts</p>
        <p class="progress">Word ${o+1} of ${e.length}</p>
        ${_>0?`<div class="count">${_}</div>`:``}
        <h1 class="word ${v?`pulse`:``}">${s?`⭐`.repeat(Math.min(t.length,6)):t}</h1>
        <div class="answer">${_>0?`look at the word`:l||(n?`tap the letters`:`watch and listen`)}</div>
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
    `;return}let n=t[f],i=p!==``&&m!==``;r.innerHTML=`
    <main class="card">
      <p class="week">Maths · ${S} pts</p>
      <p class="progress">Question ${f+1} of ${t.length}</p>
      <div class="build">
        <div class="rods">${F(n.tens,`ten`)}</div>
        <div class="ones">${F(n.ones,`one`)}</div>
      </div>
      <p class="sum-line ${h===`tens`?`on`:``}">
        There ${n.tens===1?`is`:`are`}
        <span class="blank">${p||`?`}</span>
        ${n.tens===1?`ten`:`tens`}.
      </p>
      <p class="sum-line ${h===`ones`?`on`:``}">
        There ${n.ones===1?`is`:`are`}
        <span class="blank">${m||`?`}</span>
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
      <div class="big next ${i?``:`off`}" data-act="check-maths">Check</div>
      <div class="row">
        <div class="big" data-act="clear">Clear</div>
        <div class="big next-word" data-act="next-maths">Next</div>
      </div>
      <div class="big" data-act="home">Home</div>
    </main>
  `}function B(n,r){if(n){if(n===`logout`){g=`login`,y=``,b=``,A(),z();return}if(n===`pick-austin`){g=`pass`,y=``,b=``,z();return}if(n===`pass-letter`){y+=r,b=``,z();return}if(n===`pass-clear`){y=``,b=``,z();return}if(n===`pass-go`){y===i?(g=`home`,y=``,b=``):(b=`Try again`,y=``),z();return}if(n===`home`){g=`home`,A(),z();return}if(n===`spell`){g=`spell`,o=0,x=0,C={},I();return}if(n===`maths`){g=`maths`,f=0,S=0,w={},p=``,m=``,h=`tens`,A(),z();return}if(n===`hear`){M(e[o]);return}if(n===`letter`){if(!s||c||_>0)return;l+=r,z();return}if(n===`check-spell`){let t=e[o],n=document.querySelector(`#result`);l===t?(C[o]||(x+=1,C[o]=!0),n.textContent=`Yes! Well done`,n.className=`ok`,M(`Well done`)):(l=``,u=P(t),z(),document.querySelector(`#result`).textContent=`Try again`,document.querySelector(`#result`).className=`no`);return}if(n===`again`){I();return}if(n===`next-word`){o>=e.length-1?L():(o+=1,I());return}if(n===`tens`){h=`tens`,z();return}if(n===`ones`){h=`ones`,z();return}if(n===`num`){h===`tens`?p=r:m=r,z();return}if(n===`check-maths`){let e=t[f],n=document.querySelector(`#result`);Number(p)===e.tens&&Number(m)===e.ones?(w[f]||(S+=1,w[f]=!0),n.textContent=`Yes! Well done`,n.className=`ok`,M(`Well done`)):(n.textContent=`Try again`,n.className=`no`);return}if(n===`clear`){p=``,m=``,h=`tens`,z();return}n===`next-maths`&&(f>=t.length-1?R():(f+=1,p=``,m=``,h=`tens`,z()))}}function V(e){let t=e;for(;t&&t!==r;){if(t.getAttribute&&t.getAttribute(`data-act`))return t;t=t.parentNode}return null}function H(){for(let e=0;e<48;e++){let t=document.createElement(`div`);t.className=`bit`,t.style.left=Math.random()*100+`vw`,t.style.background=[`#c41e3a`,`#f4d35e`,`#2d5bff`,`#fff`][e%4],t.style.animationDelay=Math.random()*.4+`s`,document.body.appendChild(t),setTimeout(()=>t.remove(),2500)}}r.onclick=function(e){let t=V(e.target);t&&(t.className||``).indexOf(`off`)===-1&&B(t.getAttribute(`data-act`),t.getAttribute(`data-val`))},z();