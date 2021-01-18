import React from "react";

import "./FaceRecognition.css";

function FaceRecognition({ box, imageURL }) {
  return (
    <div className="center ma">
      <div className="absolute mt2">
        <img
          id="inputImage"
          src={imageURL}
          alt=""
          width="500px"
          height="auto"
        ></img>
        <div
          className="bounding-box"
          style={{
            left: box.leftCol,
            top: box.topRow,
            right: box.rightCol,
            bottom: box.bottomRow,
          }}
        ></div>
      </div>
    </div>
  );
}

export default FaceRecognition;
