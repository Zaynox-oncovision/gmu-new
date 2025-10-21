const URL = "cancer_model/";
let model, webcam, labelContainer, maxPredictions;
let speaking = false; // prevents repeated voice spam

document.getElementById("start-button").addEventListener("click", init);

async function init() {
  try {
    document.getElementById("status").innerHTML = "🔄 Loading AI model...";
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Load model
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    document.getElementById("status").innerHTML = "✅ Model loaded! Starting camera...";

    // Setup webcam
    webcam = new tmImage.Webcam(300, 300, true);
    await webcam.setup();
    await webcam.play();
    document.getElementById("webcam-container").appendChild(webcam.canvas);

    // Setup labels
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
      labelContainer.appendChild(document.createElement("div"));
    }

    document.getElementById("status").innerHTML = "🧠 AI Ready!";
    window.requestAnimationFrame(loop);
  } catch (error) {
    alert("⚠️ Please allow camera permission and refresh the page!");
    console.error(error);
  }
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);
  prediction.sort((a, b) => b.probability - a.probability);
  const topPrediction = prediction[0];

  const label = topPrediction.className;
  const confidence = (topPrediction.probability * 100).toFixed(1);

  labelContainer.childNodes[0].innerHTML = `${label} (${confidence}%)`;
  document.getElementById("bar").style.width = `${confidence}%`;

  if (confidence > 85 && !speaking) {
    speaking = true;
    speak(`I am ${confidence}% confident this is ${label}`);
    setTimeout(() => (speaking = false), 5000);
  }

  if (confidence > 85) {
    document.getElementById("status").innerHTML = "✅ High confidence detection!";
  } else if (confidence > 50) {
    document.getElementById("status").innerHTML = "🤔 AI is analyzing...";
  } else {
    document.getElementById("status").innerHTML = "📷 Waiting for clearer input...";
  }
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1;
  utter.pitch = 1;
  utter.volume = 1;
  speechSynthesis.speak(utter);
}

