const fromText = document.querySelector(".from-text"),
toText = document.querySelector(".to-text"),
exchageIcon = document.querySelector(".exchange"),
selectTag = document.querySelectorAll("select"),
icons = document.querySelectorAll(".row i"),
translateBtn = document.querySelector("button"),
clearBtn = document.querySelector(".clear-btn"),
charCount = document.querySelector(".char-count");

let debounceTimer;

selectTag.forEach((tag, id) => {
    for (let country_code in countries) {
        let selected = id == 0 ? country_code == "en-GB" ? "selected" : "" : country_code == "bn-IN" ? "selected" : "";
        let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
        tag.insertAdjacentHTML("beforeend", option);
    }
});

exchageIcon.addEventListener("click", () => {
    let tempText = fromText.value,
    tempLang = selectTag[0].value;
    fromText.value = toText.value;
    toText.value = tempText;
    selectTag[0].value = selectTag[1].value;
    selectTag[1].value = tempLang;
    updateCharCount();
});

fromText.addEventListener("keyup", () => {
    updateCharCount();
    if(!fromText.value) {
        toText.value = "";
    }
    debounceTranslate();
});

translateBtn.addEventListener("click", () => {
    translateText();
});

clearBtn.addEventListener("click", () => {
    fromText.value = "";
    toText.value = "";
    updateCharCount();
    fromText.focus();
});

function updateCharCount() {
    charCount.textContent = `${fromText.value.length} characters`;
}

function debounceTranslate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        if(fromText.value.trim()) {
            translateText();
        } else {
            toText.value = "";
        }
    }, 800);
}

function translateText() {
    let text = fromText.value.trim(),
    translateFrom = selectTag[0].value,
    translateTo = selectTag[1].value;
    if(!text) return;
    toText.setAttribute("placeholder", "Translating...");
    translateBtn.disabled = true;
    fetch(`https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`)
    .then(res => res.json())
    .then(data => {
        toText.value = data.responseData.translatedText;
        data.matches.forEach(data => {
            if(data.id === 0) {
                toText.value = data.translation;
            }
        });
        toText.setAttribute("placeholder", "Translation");
        translateBtn.disabled = false;
    })
    .catch(() => {
        toText.value = "";
        toText.setAttribute("placeholder", "Translation failed. Please try again.");
        translateBtn.disabled = false;
    });
}

icons.forEach(icon => {
    icon.addEventListener("click", ({target}) => {
        if(!fromText.value || !toText.value) return;
        if(target.classList.contains("fa-copy")) {
            if(target.id == "from") {
                navigator.clipboard.writeText(fromText.value);
            } else {
                navigator.clipboard.writeText(toText.value);
            }
        } else {
            let utterance;
            if(target.id == "from") {
                utterance = new SpeechSynthesisUtterance(fromText.value);
                utterance.lang = selectTag[0].value;
            } else {
                utterance = new SpeechSynthesisUtterance(toText.value);
                utterance.lang = selectTag[1].value;
            }
            speechSynthesis.speak(utterance);
        }
    });
});

document.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        translateText();
    }
    if(e.ctrlKey && e.shiftKey && e.code === "KeyS") {
        e.preventDefault();
        exchageIcon.click();
    }
});
