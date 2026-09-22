(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`one`,`two`,`three`,`four`,`five`,`six`,`seven`,`eight`,`nine`,`ten`],t=[{tens:2,ones:1},{tens:1,ones:5},{tens:3,ones:4},{tens:4,ones:5},{tens:6,ones:2}],n=`abcdefghijklmnopqrstuvwxyz`,r=document.querySelector(`#app`),i=`baxter`,a=`/austin-homework/hero.png`,o=0,s=!1,c=!1,l=``,u=[],d=[],f=0,p=``,m=``,h=`tens`,g=`login`,_=0,v=!1,y=``,b=``;function x(){d.forEach(e=>clearTimeout(e)),d=[];try{speechSynthesis.cancel()}catch{}}function S(e,t){d.push(setTimeout(t,e))}function C(t){if(v=!0,g===`spell`&&A(),S(850,()=>{v=!1,g===`spell`&&A()}),e.indexOf(t)!==-1){let e=new Audio(`/austin-homework/sounds/`+t+`.mp3`);e.playsInline=!0;let n=e.play();n&&n.catch&&n.catch(function(){})}try{speechSynthesis.cancel();let e=new SpeechSynthesisUtterance(t);e.rate=.75,speechSynthesis.speak(e)}catch{}}function w(e){return e.map(e=>({item:e,sort:Math.random()})).sort((e,t)=>e.sort-t.sort).map(({item:e})=>e)}function T(e){let t=w(n.split(``)).filter(t=>!e.includes(t)).slice(0,e.length<5?3:2);return w([...e.split(``),...t])}function E(e,t){return Array.from({length:e},()=>t===`ten`?`<span class="rod"></span>`:`<span class="cube"></span>`).join(``)}function D(){let t=e[o];x(),s=!1,c=!0,l=``,u=T(t),_=5,v=!1,A();function n(){S(1e3,()=>{--_,_>0?(A(),n()):(C(t),S(2e3,()=>{C(t),S(2e3,()=>{C(t),S(800,()=>{s=!0,c=!1,A()})})}),A())})}n()}function O(){r.innerHTML=`
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
  `}function k(){r.innerHTML=`
    <main class="card">
      <p class="week">Austin</p>
      <div class="login-wrap">
        <div class="hero-btn">
          <img src="${a}" alt="Austin" />
        </div>
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
  `}function A(){if(g===`login`){O();return}if(g===`pass`){k();return}if(g===`home`){r.innerHTML=`
      <main class="card">
        <div class="login-wrap">
          <div class="hero-btn">
            <img src="${a}" alt="Austin" />
          </div>
        </div>
        <p class="week">Austin</p>
        <h1 class="word">Homework</h1>
        <p class="progress">Pick one</p>
        <div class="big next" data-act="spell">Spellings</div>
        <div class="big next-word" data-act="maths">Maths</div>
        <div class="big" data-act="logout">Log out</div>
      </main>
    `;return}if(g===`spell`){let t=e[o],n=s&&!c&&_===0,i=n&&l.length>0;r.innerHTML=`
      <main class="card">
        <p class="week">Spellings</p>
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
      <p class="week">Make and Count</p>
      <p class="progress">Question ${f+1} of ${t.length}</p>
      <div class="build">
        <div class="rods">${E(n.tens,`ten`)}</div>
        <div class="ones">${E(n.ones,`one`)}</div>
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
  `}function j(n,r){if(n){if(n===`logout`){g=`login`,y=``,b=``,x(),A();return}if(n===`pick-austin`){g=`pass`,y=``,b=``,A();return}if(n===`pass-letter`){y+=r,b=``,A();return}if(n===`pass-clear`){y=``,b=``,A();return}if(n===`pass-go`){y===i?(g=`home`,y=``,b=``):(b=`Try again`,y=``),A();return}if(n===`home`){g=`home`,x(),A();return}if(n===`spell`){g=`spell`,o=0,D();return}if(n===`maths`){g=`maths`,f=0,p=``,m=``,h=`tens`,x(),A();return}if(n===`hear`){C(e[o]);return}if(n===`letter`){if(!s||c||_>0)return;l+=r,A();return}if(n===`check-spell`){let t=e[o],n=document.querySelector(`#result`);l===t?(n.textContent=`Yes! Well done`,n.className=`ok`,C(`Well done`)):(l=``,u=T(t),A(),document.querySelector(`#result`).textContent=`Try again`,document.querySelector(`#result`).className=`no`);return}if(n===`again`){D();return}if(n===`next-word`){o=(o+1)%e.length,D();return}if(n===`tens`){h=`tens`,A();return}if(n===`ones`){h=`ones`,A();return}if(n===`num`){h===`tens`?p=r:m=r,A();return}if(n===`check-maths`){let e=t[f],n=document.querySelector(`#result`);Number(p)===e.tens&&Number(m)===e.ones?(n.textContent=`Yes! Well done`,n.className=`ok`,C(`Well done`)):(n.textContent=`Try again`,n.className=`no`);return}if(n===`clear`){p=``,m=``,h=`tens`,A();return}n===`next-maths`&&(f=(f+1)%t.length,p=``,m=``,h=`tens`,A())}}function M(e){let t=e;for(;t&&t!==r;){if(t.getAttribute&&t.getAttribute(`data-act`))return t;t=t.parentNode}return null}r.onclick=function(e){let t=M(e.target);t&&(t.className||``).indexOf(`off`)===-1&&j(t.getAttribute(`data-act`),t.getAttribute(`data-val`))},A();