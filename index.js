let isLoaded = false;
let currentPosition = "UP";
let pushUps = 0;

const canvas = utils.createElement("canvas", {
  id: "canvas",
});
const ctx = canvas.getContext("2d");
const video = document.getElementById("videoElement");

const getPose = async () => {
  const poses = await Detector.estimatePoses(video);

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (!isLoaded) {
    document.querySelector(".container p").remove();
    isLoaded = true;
  }

  const drawPoint = (y, x, r, name) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff0000";
    ctx.fill();
    ctx.font = "7px Arial";
    ctx.fillText(name, x + 7, y + 2);
  };

  const drawSegment = (pair1, pair2, color, scale) => {
    ctx.beginPath();
    ctx.moveTo(pair1.x * scale, pair1.y * scale);
    ctx.lineTo(pair2.x * scale, pair2.y * scale);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  const drawKeypoints = (keypoints) => {
    for (let i = 0; i < keypoints.length; i++) {
      const keypoint = keypoints[i];
      const { y, x } = keypoint;
      drawPoint(y, x, 5, keypoint.name);
    }
  };

  if (poses.length) {
    const { keypoints } = poses[0];
    drawKeypoints(keypoints);
    let elbowPositions = keypoints.filter((k) => {
      return k.name === "left_elbow" || k.name === "right_elbow";
    });
    let leftShoulder = keypoints.filter((k) => {
      return k.name === "left_shoulder";
    });
    let rightShoulder = keypoints.filter((k) => {
      return k.name === "right_shoulder";
    });

    // draw segment between left_elbow and right_elbow
    drawSegment(
      { x: elbowPositions[0].x, y: elbowPositions[0].y },
      { x: elbowPositions[1].x, y: elbowPositions[1].y },
      "red",
      canvas.width / video.videoWidth
    );

    let leftShoulderDistance = utils.getPointToLine(
      leftShoulder[0].x,
      leftShoulder[0].y,
      elbowPositions[0].x,
      elbowPositions[0].y,
      elbowPositions[1].x,
      elbowPositions[1].y
    );
    let rightShoulderDistance = utils.getPointToLine(
      rightShoulder[0].x,
      rightShoulder[0].y,
      elbowPositions[0].x,
      elbowPositions[0].y,
      elbowPositions[1].x,
      elbowPositions[1].y
    );

    if (leftShoulderDistance + rightShoulderDistance < 120) {
      currentPosition = "DOWN";
      document.getElementById("indicator_position").innerText =
        "Position: DOWN";
    } else {
      if (currentPosition === "DOWN") {
        pushUps++;
        document.getElementById(
          "indicator_pushups"
        ).innerText = `Pushups: ${pushUps}`;
      }
      currentPosition = "UP";
      document.getElementById("indicator_position").innerText = "Position: UP";
    }

    // if (currentPosition === "DOWN") {
    //   pushUps++;
    //   document.getElementById(
    //     "indicator_pushups"
    //   ).innerText = `Pushups: ${pushUps}`;
    // }
  }
};

navigator.mediaDevices
  .getUserMedia({ video: true, audio: false })
  .then((stream) => {
    window.stream = stream;
    video.srcObject = stream;
    video.addEventListener("loadeddata", (event) => {
      document.querySelector(".container").appendChild(canvas);
      poseDetection
        .createDetector(poseDetection.SupportedModels.MoveNet)
        .then((detector) => {
          window.Detector = detector;
          setInterval(getPose, 10);
        });
    });
  })
  .catch((error) => {
    console.log("Camera blocked");
  });
