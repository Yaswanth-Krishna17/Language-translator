from flask import Flask, render_template, request
from deep_translator import GoogleTranslator

app = Flask(__name__)

# Get supported languages
translator = GoogleTranslator(source='auto', target='en')
lang_dict = translator.get_supported_languages(as_dict=True)
code_to_lang = {code: lang.title() for lang, code in lang_dict.items()}

@app.route("/", methods=["GET", "POST"])
def index():
    translated_text = ""
    error = ""
    
    if request.method == "POST":
        text = request.form.get("text")
        target_code = request.form.get("language")

        if target_code in code_to_lang:
            try:
                translated_text = GoogleTranslator(source='auto', target=target_code).translate(text)
            except Exception as e:
                error = f"Translation error: {str(e)}"
        else:
            error = "Invalid language code selected."
    
    return render_template("index.html", languages=code_to_lang, translated=translated_text, error=error)

if __name__ == "__main__":
    app.run(debug=True)
