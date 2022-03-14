var settings = {}
try {
    settings = JSON.parse(localStorage.getItem("settings"))
} catch (e) {}
if(!settings){
    settings = {}
}
if(settings.difficulty){
    document.getElementsByClassName("splash")[0].remove()
}

function initApp(){
    if(settings.username){
        LoadGame()
        return;
    }
    var welcome = document.getElementById("welcome")
    var welcomeblur = document.getElementsByClassName("welcomeblur")[0]
    welcome.innerHTML = "<h1>"+locale.welcome+"</h1>"+
        "<h2>"+locale.welcomedesc+"</h2>"+
        "<div class='buttons'><button class='bg'>Български</button><button class='en'>English</button><button class='tu'>Türkçe</button></div>"+
        "<h2>"+locale.welcomegrade+"</h2>"+
        "<div class='buttons'><button class='1'>"+locale.welcomegrade1+"</button><button class='2'>"+locale.welcomegrade2+"</button><button class='3'>"+locale.welcomegrade3+"</button></div>"

    var buttons = welcome.getElementsByTagName("button")

    var activeLanguage = 0
    if(settings.language=="en"){
        activeLanguage = 1
    }
    if(settings.language=="tu"){
        activeLanguage = 2
    }

    for (let i = 0; i < buttons.length; i++) {
        if(i<3){
            ButtonEvent(buttons[i], function(){return setLanguage(buttons[i].classList[0])})
            if(i==activeLanguage){
                buttons[i].classList.add("activebutton")
            }
        }
        else{
            ButtonEvent(buttons[i], function(){closeWelcome(); setDifficulty(buttons[i].classList[0])})
        }
    }

    welcome.style = "top: 50%;opacity: 1;visibility: visible;"
    welcomeblur.style = "top: 50%;opacity: 1;visibility: visible;"

    //var blur = BlurElement(welcome, 80)

    function closeWelcome(){
        //blur()
        welcome.style = ""
        welcomeblur.style = ""
        setTimeout(function() {
            welcome.remove()
            welcomeblur.remove()
        }, 900);
    }
}

function setDifficulty(clas){
    settings.difficulty = clas
    saveSettings()
    LoadGame()
}

function LoadGame(){
    if(!settings.username){
        settings.username = locale.player
    }
    if(!settings.coins){
        settings.coins = 0
    }
    saveSettings()
    var header = document.getElementsByTagName("header")[0]
    header.innerHTML = "<input value="+settings.username+"><div class='clas'>"+settings.difficulty+" "+locale.class+"</div><div class='mide bank'>&nbsp;<a id='coins'>"+settings.coins+"</a><a class='m-i'>account_balance_wallet</a></div><a target='_blank' href='https://midelight.net' class='m-i mide'>cottage</a>"
    header.style = "height:80px;opacity:1"
    header.getElementsByTagName("input")[0].onchange = function(){
        settings.username = this.value
        saveSettings()
    }

    function loadLevels(){
        function playLevel(level){
            function submitAnswer(answer){
                var result = divlevel.getElementsByClassName("result")[0]
                if(answer==levelinfo.answer){
                    result.innerHTML = locale.correct + "!"
                }
                else{
                    result.innerHTML = locale.incorrect + "!"
                }
            }
            var levelinfo = exercise[settings.difficulty][level]
            levels.innerHTML = "<h1>"+locale.exercise+" "+level+"</h1>"+
                "<a class='m-i x'>arrow_back</a>"+
                "<div class='level'>"

            var divlevel = levels.getElementsByClassName("level")[0]
            divlevel.innerHTML = "<h2>"+levelinfo.problem+"</h2>"+
                "<div class='result'></div>"

            var choices = []
            var j = getRandomInt(1,4)
            for (let i = 0; i < levelinfo.options.length; i++) {
                if(i+1==j){
                    choices.push(levelinfo.answer)
                }
                choices.push(levelinfo.options[i])
            }

            for (let i = 0; i < choices.length; i++) {
                divlevel.innerHTML += "<button>"+choices[i]+"</button>"
            }

            var buttons = divlevel.getElementsByTagName("button")
            for (let i = 0; i < buttons.length; i++) {
                ButtonEvent(buttons[i], submitAnswer, buttons[i].innerHTML)
            }

            ButtonEvent(document.getElementsByTagName('a')[0], loadLevels)
        }
        var levels = document.getElementById("levels")
        
        levels.innerHTML = "<h1>"+locale.exercises+"</h1>"
        for (const x in exercise[settings.difficulty]) {
            levels.innerHTML += "<button>"+x+"</button>"
        }
        levels.style = "visibility:visible;opacity:1;top:50%"

        var buttons = document.getElementsByTagName("button")
        for (let i = 0; i < buttons.length; i++) {
            ButtonEvent(buttons[i], playLevel, buttons[i].innerHTML)
        }
    }

    loadScript("src/exercises.js", "exercises", loadLevels)

}

function setLanguage(language){
    if(document.getElementById("locale")){
        document.getElementById("locale").remove()
    }
    settings.language = language
    saveSettings()
    var src = "src/languages/" + language + ".js"
    
    loadScript(src, "locale", initApp)
}

if(settings.language){
    setLanguage(settings.language)
}
else{
    setLanguage("bg")
}

function saveSettings(){
    localStorage.setItem("settings", JSON.stringify(settings))
}

//Packets

/**
 * Load scripts dynamically.
 * @param {*} url The url of the file
 * @param {*} id The id of the loaded script in the dom
 * @param {*} onload A function to call after it's finished loading
 */
function loadScript(url, id, onload) {
    var script = document.createElement("script")
    if(id){
        script.id = id
    }
    script.src = url
    document.body.appendChild(script)

    if(onload){
        script.onload = function(){
            onload()
        }
    }
}

/**
 * Sets an event of an element.
 * @param {*} element Any element
 * @param {*} action A function
 * @param {*} param A parameter to call the function with
 */
function ButtonEvent(element, action, param){
    element.onclick = function(){
        action(param)
    }
    element.onkeydown = function(e){
        if(e.key == "Enter" || e.key == " "){
            action(param)
        }
    }
}

/**
 * Get's an element's offset.
 * @param {*} el Any element
 * @returns An array of the top and left pixels offset of the element.
 */
function getOffset(el){
    var _x = 0
    var _y = 0
    while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft
        _y += el.offsetTop - el.scrollTop
        el = el.offsetParent
    }
    return { top: _y, left: _x }
}

/**
 * Used to get a specific css property's value.
 * @param {*} el Any element
 * @param {*} styleProp Any computed css property
 * @returns The value of the param styleProp.
 */
function getStyle(el, styleProp){
    if (window.getComputedStyle)
    {
        var y = document.defaultView.getComputedStyle(el,null).getPropertyValue(styleProp) 
    }
    else if (el.currentStyle){
        var y = el.currentStyle[styleProp]
    }
    return y
}

/**
 * Blurs behind element.
 * Requires getOffset() & getStyle()
 * @param {*} element Any element
 * @param {*} amount The amount of blur in px
 * @returns Function to remove itself
 */
function BlurElement(element, amount){
    function close(){
        blur.remove()
    }

    var offset = getOffset(element)
    var zIndex = getStyle(element, "z-index")
    var borderRadius = getStyle(element, "border-radius")
    var transform = getStyle(element, "transform")
    var width = getStyle(element, "width")
    var height = getStyle(element, "height")

    var blur = document.createElement("mdblur")
    blur.style.display = "block"
    blur.style.position = "absolute"
    blur.style.top = offset.top + "px"
    blur.style.left = offset.left + "px"
    blur.style.transform = transform
    blur.style.zIndex = zIndex-1//change to - after debugging TODO: add blur bro
    blur.style.width = width
    blur.style.height = height
    blur.style.backdropFilter = "blur("+amount+"px)"
    blur.style.borderRadius = borderRadius

    document.getElementsByTagName("body")[0].appendChild(blur)
    return close;

    // window.onresize = function(){ replicate this!
        
    // }
}

/**
 * Returns a random number between 2 numbers.
 * @param {*} min Minimum number
 * @param {*} max Maximum number
 * @returns A random number between the 2 parameters.
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}