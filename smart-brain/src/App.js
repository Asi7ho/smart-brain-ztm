import React, { useState } from "react";
import "./App.css";

import Particles from "react-particles-js";
import Clarifai from "clarifai";

import Signin from "./components/signin/Signin";
import Register from "./components/register/Register";
import Navigation from "./components/navigation/Navigation";
import Logo from "./components/logo/Logo";
import Rank from "./components/rank/Rank.js";
import ImageLinkForm from "./components/imageLinkForm/ImageLinkForm";
import FaceRecognition from "./components/faceRecognition/FaceRecognition";

const particlesOptions = {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 800,
      },
    },
  },
};

const initialState = {
  id: "",
  name: "",
  email: "",
  entries: 0,
  joined: "",
};

const app = new Clarifai.App({
  apiKey: "d4fbdb86d20d46c3810abda8bd10badd",
});

function App() {
  const [input, setInput] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [box, setBox] = useState({});
  const [route, setRoute] = useState("signin");
  const [isSignedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState(initialState);

  const loadUser = (user) => {
    setUser({
      id: user.id,
      name: user.name,
      email: user.email,
      entries: user.entries,
      joined: user.joined,
    });
  };

  const onRouteChange = (route) => {
    if (route === "signin") {
      setUser(initialState);
      setSignedIn(false);
    } else if (route === "home") {
      setSignedIn(true);
    }
    setRoute(route);
  };

  const calculateFaceLocation = (data) => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;

    const image = document.getElementById("inputImage");
    const width = Number(image.width);
    const height = Number(image.height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  const displayFaceBox = (box) => {
    setBox(box);
  };

  const onInputChange = (event) => {
    setInput(event.target.value);
  };

  const onSubmit = () => {
    setImageURL(input);
    app.models
      .predict(Clarifai.FACE_DETECT_MODEL, input)
      .then((response) => {
        if (response) {
          fetch("http://localhost:8000/image", {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: user.id,
            }),
          })
            .then((res) => res.json())
            .then((count) => setUser({ ...user, entries: count }))
            .catch((err) => console.log(err));
        }
        displayFaceBox(calculateFaceLocation(response));
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="App">
      <Particles className="particles" params={particlesOptions} />
      <Navigation onRouteChange={onRouteChange} isSignedIn={isSignedIn} />
      {route === "home" ? (
        <div>
          <Logo />
          <Rank user={user} />
          <ImageLinkForm onInputChange={onInputChange} onSubmit={onSubmit} />
          <FaceRecognition box={box} imageURL={imageURL} />
        </div>
      ) : route === "signin" ? (
        <Signin onRouteChange={onRouteChange} loadUser={loadUser} />
      ) : (
        <Register onRouteChange={onRouteChange} loadUser={loadUser} />
      )}
    </div>
  );
}

export default App;
