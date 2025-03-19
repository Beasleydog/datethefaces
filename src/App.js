import "./App.css";
import { useState } from "react";
import Question from "./Question";
import BackgroundInfo from "./BackgroundInfo";
import LoadingSpinner from "./LoadingSpinner";

function App() {
  const imagesByCategory = {
    18: {
      real: [
        "/people/1r18.png",
        "/people/2r18.png",
        "/people/3r18.png",
        "/people/4r18.png",
        "/people/5r18.png",
      ],
      fake: [
        "/people/1f18.png",
        "/people/2f18.png",
        "/people/3f18.png",
        "/people/4f18.png",
        "/people/5f18.png",
      ],
    },
    30: {
      real: [
        "/people/1r30.png",
        "/people/2r30.png",
        "/people/3r30.png",
        "/people/4r30.png",
      ],
      fake: [
        "/people/1f30.png",
        "/people/2f30.png",
        "/people/3f30.png",
        "/people/4f30.png",
        "/people/5f30.png",
      ],
    },
    50: {
      real: [
        "/people/1r50.png",
        "/people/2r50.png",
        "/people/3r50.png",
        "/people/4r50.png",
        "/people/5r50.png",
      ],
      fake: [
        "/people/1f50.png",
        "/people/2f50.png",
        "/people/3f50.png",
        "/people/4f50.png",
        "/people/5f50.png",
      ],
    },
  };

  // Function to get balanced random images
  const getBalancedRandomImages = () => {
    const selectedImages = [];
    const ages = [18, 30, 50];

    // Get 2-3 images from each age category to total 8 images
    let remainingImages = 8;
    ages.forEach((age, index) => {
      // For first two age groups, get 3 images each. For last group get 2 images
      const numFromAge = index < 2 ? 3 : 2;
      const ageImages = [];

      // Try to balance real and fake within each age category
      const numReal = Math.ceil(numFromAge / 2);
      const numFake = numFromAge - numReal;

      // Select real images
      const realPool = [...imagesByCategory[age].real];
      for (let i = 0; i < numReal; i++) {
        if (realPool.length > 0) {
          const idx = Math.floor(Math.random() * realPool.length);
          ageImages.push(realPool.splice(idx, 1)[0]);
        }
      }

      // Select fake images
      const fakePool = [...imagesByCategory[age].fake];
      for (let i = 0; i < numFake; i++) {
        if (fakePool.length > 0) {
          const idx = Math.floor(Math.random() * fakePool.length);
          ageImages.push(fakePool.splice(idx, 1)[0]);
        }
      }

      selectedImages.push(...ageImages);
      remainingImages -= numFromAge;
    });

    // Shuffle the final array
    return selectedImages.sort(() => Math.random() - 0.5);
  };

  const [images] = useState(getBalancedRandomImages());
  console.log(images);
  const getUserId = () => {
    const storedUserId = localStorage.getItem("surveyUserId");
    if (storedUserId) {
      return storedUserId;
    }
    const newUserId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem("surveyUserId", newUserId);
    return newUserId;
  };

  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [userBackground, setUserBackground] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const userId = getUserId();

  async function handleBackgroundSubmit(backgroundData) {
    setIsLoading(true);
    setUserBackground(backgroundData);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Minimum loading time
    setCurrentQuestion(0);
    setIsLoading(false);
  }

  async function handleNextQuestion(data) {
    setIsLoading(true);
    const enrichedData = {
      ...data,
      backgroundInfo: userBackground,
    };
    await storeData(enrichedData, userId);
    setCurrentQuestion(currentQuestion + 1);
    setIsLoading(false);
  }

  function startSurvey() {
    setCurrentQuestion(0);
  }

  async function storeData(data, userId) {
    try {
      const encodedUserId = encodeURIComponent(userId);
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxO1tjyeciuYlsEiuhOQ2Tfl3hah_kJDFRx9F_-xhk117Xd52EdoQigIV-DX35Un9yvHw/exec?userId=" +
          encodedUserId,
        {
          method: "POST",
          redirect: "follow",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error("Error storing data:", error);
    }
  }

  return (
    <div className="App">
      {isLoading && <LoadingSpinner />}
      {currentQuestion === -1 ? (
        <Instructions onStart={() => setCurrentQuestion(-2)} />
      ) : currentQuestion === -2 ? (
        <BackgroundInfo onSubmit={handleBackgroundSubmit} />
      ) : currentQuestion < images.length ? (
        <Question
          key={currentQuestion}
          image={`${process.env.PUBLIC_URL}${images[currentQuestion]}`}
          onSubmit={handleNextQuestion}
          currentStep={currentQuestion + 1}
          totalSteps={8}
        />
      ) : (
        <Conclude />
      )}
    </div>
  );
}

function Instructions({ onStart }) {
  return (
    <div className="instructions-page">
      <h1>Can you tell when this photo was taken?</h1>
      <div className="instructions-content">
        <p>
          Welcome! In this survey, you'll be shown a series of photographs and
          asked to guess when each one was taken.
        </p>
        <h2>How it works:</h2>
        <ol>
          <li>
            <strong>Identify Key Features:</strong> Click on any features in the
            photo that stand out or helps you determine its age.
          </li>
          <li>
            <strong>Explain Your Reasoning:</strong> For each feature you click,
            explain why it suggests a particular time period
          </li>
          <li>
            <strong>Final Guess:</strong> Use the textbox to make your final
            guess about when the photo was taken
          </li>
          <li>
            <strong>Confidence Rating:</strong> Rate how confident you are in
            your guess from 1-10
          </li>
        </ol>
        <h2>Demo:</h2>
        <video width="70%" controls>
          <source src={`${process.env.PUBLIC_URL}/vid.mp4`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <button className="start-button" onClick={onStart}>
          Begin
        </button>
      </div>
    </div>
  );
}

function Conclude() {
  return (
    <div className="conclude-page">
      <h1>Thank you for participating!</h1>
      <p>
        Your responses will help us understand how people determine the age of
        photographs.
      </p>
    </div>
  );
}

export default App;
